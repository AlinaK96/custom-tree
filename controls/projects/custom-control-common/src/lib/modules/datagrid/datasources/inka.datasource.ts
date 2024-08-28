import { DataSource } from '@angular/cdk/collections';
import { CollectionViewer } from '@angular/cdk/collections/collection-viewer';
import { MatPaginator } from '@angular/material/paginator';
import cloneDeep from 'lodash.clonedeep';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';
import { isNullOrUndefined } from '../../../utilities/checkers.util';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { ColumnAggregator, SortOrder } from '../model/column-agragator.model';
import { DatagridFilter } from '../model/datagrid-filter';
import { DatagridItem } from '../model/datagrid-item';
import { InkaDatasourceConfig } from '../model/inka-datasource-config.model';
import { InkaPagination } from '../model/inka-pagination.model';
import { LoadingModel } from '../model/loading.model';
import { InkaDataTypeModifiers } from '../providers/inka-data-type-modificators';
import {
  DatagridFilterType,
  DataTypeFilterOperations,
} from '../providers/inka-data-type-operations';

export type AggregatorSettings = Record<string, ColumnAggregator>;
export type DataItem = DatagridItem<Record<string, unknown>>;

const zero = 0;
const defaultPaginationDebounceTime = 200;
const defaultFilterDebounceTime = 200;
const defaultSortDebounceTime = 200;
const defaultCommonDebounceTime = 200;

export abstract class InkaDatasource<T> extends DataSource<DatagridItem<T>> {
  paginatorSubscription: Subscription;
  operations: DataTypeFilterOperations;
  operation: DatagridFilterType = DatagridFilterType.Equals;
  modifiers: InkaDataTypeModifiers;
  filterModifiers = [];

  size = zero;
  pageSize$ = of(zero);

  data$ = new BehaviorSubject<T[]>([]);
  columnsAggregators$: BehaviorSubject<AggregatorSettings>;
  pagination$: BehaviorSubject<InkaPagination>;
  size$ = new BehaviorSubject<number>(zero);
  pageData$ = new BehaviorSubject<DatagridItem<T>[]>([]);
  paginationStream$: Observable<InkaPagination>;
  aggregatedData$: Observable<DatagridItem<T>[]>;
  reload$ = new BehaviorSubject<void>(undefined);

  loading$ = new BehaviorSubject<LoadingModel>({
    loading: true,
    message: '',
  });

  customSoringFunctions: Record<
    string,
    (a: unknown, b: unknown, order: SortOrder) => number
  >;

  private _paginator: MatPaginator;
  set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    this.paginatorSubscription = paginator.page
      .pipe(filter((pageData) => !isNullOrUndefined(pageData.pageSize)))
      .subscribe((pageData) => {
        this.setPagination({
          pageSize: pageData.pageSize,
          currentPage: pageData.pageIndex,
        });
      });
  }

  paginationDebounceTime = defaultPaginationDebounceTime;
  sortDebounceTime = defaultSortDebounceTime;
  filterDebounceTime = defaultFilterDebounceTime;
  commonDebounceTime = defaultCommonDebounceTime;

  get pagination(): InkaPagination {
    return this.pagination$.value;
  }

  protected constructor(model: InkaDatasourceConfig<T>) {
    super();
    if (model.sortingFunctions) {
      this.customSoringFunctions = model.sortingFunctions;
    }
    const defaultCurrentPage = 0;
    const defaultPageSize = 5;
    this.pagination$ = new BehaviorSubject<InkaPagination>({
      currentPage: model?.pagination?.currentPage || defaultCurrentPage,
      pageSize: model?.pagination?.pageSize || defaultPageSize,
    });
    this.pageSize$ = this.pagination$.pipe(
      map((pagination) => pagination.pageSize)
    );
    this.paginationStream$ = this.pagination$.asObservable();
    const aggregators: AggregatorSettings = {};
    if (model?.filter) {
      Object.keys(model?.filter).forEach((filter) => {
        if (!aggregators[filter]) {
          aggregators[filter] = { columnName: filter } as ColumnAggregator;
        }
        aggregators[filter].columnName = filter;
        aggregators[filter].columnFilterValue = model.filter[filter];
      });
    }
    if (model?.sorting) {
      model.sorting.forEach((sort) => {
        if (!aggregators[sort.columnName]) {
          aggregators[sort.columnName] = {
            columnName: sort.columnName,
          } as ColumnAggregator;
        }
        aggregators[sort.columnName].columnSortOrder = sort.order;
      });
    }

    this.columnsAggregators$ = new BehaviorSubject<AggregatorSettings>(
      aggregators
    );
    this.aggregatedData$ = combineLatest(
      this.data$.pipe(debounceTime(this.paginationDebounceTime)),
      this.columnsAggregators$.pipe(debounceTime(this.filterDebounceTime)),
      this.paginationStream$.pipe(debounceTime(this.paginationDebounceTime))
    ).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      debounceTime(this.commonDebounceTime),
      map((data) => data[0]),
      map((item) => this.wrapItem(item)),
      map((data) => this.onSorting(data)),
      map((data) => this.onFilter(data)),
      map((data) => this.onPaginate(data)),
      switchMap((items) => this.mapItems(items))
    );
  }

  /**
   * Return aggregated data
   *
   * @param _collectionViewer
   */
  connect(_: CollectionViewer): Observable<DatagridItem<T>[]> {
    return this.aggregatedData$.pipe(delay(0));
  }

  /**
   * Unsubscribe all subscription
   *
   * @param _collectionViewer
   */
  disconnect(_: CollectionViewer): void {
    this.paginatorSubscription?.unsubscribe();
  }

  /**
   * Set modification functions for column filters
   *
   * @param columnName
   * @param callbackFn
   */
  setColumnFilterModifier(
    columnName: string,
    callbackFn: (unknown) => unknown
  ) {
    const aggregator =
      this.getColumnAggregator(columnName) ||
      ({ columnName } as ColumnAggregator);
    if (aggregator) {
      aggregator.filterModifyCallback = callbackFn;
      this._setColumnAggregator(columnName, aggregator);
    }
  }

  /**
   * Add aggregation settings for column
   *
   * @param columnName
   * @param aggregator
   * @private
   */
  private _setColumnAggregator(
    columnName: string,
    aggregator: ColumnAggregator
  ) {
    const aggregatorSettings = cloneDeep(this.columnsAggregators$.value);
    aggregatorSettings[columnName] = aggregator;
    this.columnsAggregators$.next(cloneDeep(aggregatorSettings));
  }

  /**
   * Get aggregator settings for column
   *
   * @param columnName
   * @protected
   */
  protected getColumnAggregator(columnName: string) {
    return this.columnsAggregators$.value[columnName];
  }

  /**
   * Get aggregators as array
   *
   * @private
   */
  protected getAggregators(): ColumnAggregator[] {
    const aggregatorSettings = this.columnsAggregators$.value as Record<
      string,
      ColumnAggregator
    >;
    return Object.keys(aggregatorSettings).map(
      (key) => aggregatorSettings[key]
    );
  }

  /**
   * Set filter value for column
   *
   * @param columnName
   * @param filter
   */
  setFilter(columnName: string, filter: DatagridFilter<unknown>) {
    const columnSettings =
      this.getColumnAggregator(columnName) ||
      ({ columnName } as ColumnAggregator);
    columnSettings.columnFilterValue = filter;
    this._setColumnAggregator(columnName, cloneDeep(columnSettings));
    if (this._paginator) {
      this._paginator.pageIndex = 0;
    }
  }

  /**
   * Set sorting values for column
   *
   * @param columnName
   * @param sorting
   * @param sortingNumber
   */
  setSorting(
    columnName: string,
    sorting?: SortOrder,
    sortingNumber: number = 1
  ) {
    const columnSettings =
      this.getColumnAggregator(columnName) ||
      ({ columnName } as ColumnAggregator);
    columnSettings.columnSortOrder = sorting || 'none';
    columnSettings.columnSortNumber = sortingNumber;
    this._setColumnAggregator(columnName, cloneDeep(columnSettings));
  }

  /**
   * Clear sorting settings for all columns
   */
  clearSorting() {
    const columnSettings = cloneDeep(this.getAggregators());
    const newSettings = {};
    columnSettings.forEach((agr) => {
      agr.columnSortOrder = null;
      agr.columnSortNumber = null;
      newSettings[agr.columnName] = agr;
    });
    this.columnsAggregators$.next(newSettings);
  }

  /**
   * Iterate aggregated data
   *
   * @param items
   * @protected
   */
  protected mapItems(items: DatagridItem<T>[]): Observable<DatagridItem<T>[]> {
    return of(items.map((i) => this.mapItem(i)));
  }

  /**
   * Iteration callback method
   *
   * @param item
   * @protected
   */
  protected mapItem(item: DatagridItem<T>): DatagridItem<T> {
    return item;
  }

  /**
   * Set pagination data
   *
   * @param pagination
   */
  public setPagination(pagination: InkaPagination) {
    const paginationData = this.pagination$.value;
    this.pagination$.next({
      pageSize: pagination?.pageSize ?? paginationData.pageSize,
      currentPage: pagination?.currentPage ?? paginationData.currentPage,
    });
  }

  resetPagination() {
    this._paginator?.firstPage();
  }

  /**
   * Filter data
   *
   * @param data
   * @protected
   */
  protected abstract onFilter(data: DatagridItem<T>[]);

  /**
   * Sort data
   *
   * @param data
   * @protected
   */
  protected abstract onSorting(data: DatagridItem<T>[]);

  /**
   * Paginate data
   *
   * @param data
   * @protected
   */
  protected abstract onPaginate(data: DatagridItem<T>[]);

  /**
   * Select fields of data
   *
   * @param columns
   */
  abstract select(columns: string[]): Observable<T[]>;

  /**
   * Wrap aggregated data to DatagridItem type
   *
   * @param data
   * @protected
   */
  protected wrapItem(data: T[]): DatagridItem<T>[] {
    return (data || []).map(
      (item, index) =>
        ({
          data: item,
          dataIndex: this.getItemDataIndex(index),
        } as DatagridItem<T>)
    );
  }

  /**
   * Set global count of data
   *
   * @param count
   * @protected
   */
  protected setGlobalCount(count: number) {
    this.size$.next(count);
  }

  /**
   * Toggle open status for item
   *
   * @param _item
   */
  toggleTreeItem(_: DatagridItem<unknown>) {
    return;
  }

  /**
   * Set loading settings
   *
   * @param loading
   * @param message
   */
  setLoading(loading: boolean, message?: string) {
    const currentLoadingStatus = this.loading$.value;
    currentLoadingStatus.loading = loading;
    if (message) {
      currentLoadingStatus.message = message;
    }
    this.loading$.next(currentLoadingStatus);
  }

  /**
   * Check is filter empty
   */
  isFilterEmpty() {
    const aggregators = this.getAggregators();
    aggregators.filter((x) => {
      return !(
        x.columnFilterValue === null || x.columnFilterValue?.value === ''
      );
    });
    return (
      aggregators.filter(
        (x) =>
          !(
            x.columnFilterValue === null ||
            x.columnFilterValue?.value === '' ||
            isNullOrUndefined(x.columnFilterValue?.value)
          )
      )?.length === zero
    );
  }

  /**
   * Set data type for column
   *
   * @param columnName
   * @param columnType
   */
  setColumnType(columnName: string, columnType: ColumnDataTypesEnum) {
    const aggregator =
      this.getColumnAggregator(columnName) ??
      ({ columnName } as ColumnAggregator);
    aggregator.columnType = columnType;
    this._setColumnAggregator(columnName, aggregator);
  }

  /**
   * Get sorting  settings
   */
  getSorting() {
    return this.getAggregators()
      .filter((x) => x.columnSortOrder !== null)
      .map((x) => ({
        columnName: x.columnName,
        order: x.columnSortOrder,
      }));
  }

  /**
   * Get values for header filter
   */
  getFilterValues() {
    return this.getAggregators()
      .filter((x) => !isNullOrUndefined(x.columnFilterValue))
      .map((x) => ({
        columnName: x.columnName,
        filterValue: x.columnFilterValue,
      }));
  }

  /**
   * Get data index
   *
   * @param index
   * @protected
   */
  protected getItemDataIndex(index) {
    const one = 1;
    const pagination = this.pagination$.getValue();
    return (
      index +
      one +
      pagination.currentPage * pagination.pageSize
    ).toString();
  }

  reload() {
    this.reload$.next();
  }
}
