import { CollectionViewer } from '@angular/cdk/collections/collection-viewer';
import { DateRange } from '@angular/material/datepicker';
import cloneDeep from 'lodash.clonedeep';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  IFilterDescriptor,
  IPaginationDescriptor,
  ISortingDescriptor,
} from '../models';
import { WebComponentDataGridDatasourceConfig } from '../models/web-component-data-grid-datasource-config';
import { ConditionOperators } from '../modules/conditions-converter/models/Inner-confition.model';
import { InkaDatasource } from '../modules/datagrid/datasources/inka.datasource';
import { SortOrder } from '../modules/datagrid/model/column-agragator.model';
import { DatagridFilter } from '../modules/datagrid/model/datagrid-filter';
import { DatagridItem } from '../modules/datagrid/model/datagrid-item';
import { InkaPagination } from '../modules/datagrid/model/inka-pagination.model';
import { DatagridFilterType } from '../modules/datagrid/providers/inka-data-type-operations';
import { isNullOrUndefined } from '../utilities/checkers.util';
import { WebComponentDatasource } from './datasource';
import { DatasourceFilterMapper } from './datasource-filter.mapper';

const mapBetweenFunctions = {
  [DatagridFilterType.Between]: (
    filter: DatagridFilter<DateRange<unknown>>
  ) => {
    const filters = [];
    const startFilter: IFilterDescriptor = {
      Value: (filter.value as DateRange<unknown>).start,
      Operator: ConditionOperators.GreaterOrEqual,
    };
    filters.push(startFilter);
    if ((filter.value as DateRange<unknown>).end) {
      const endFilter: IFilterDescriptor = {
        Value: (filter.value as DateRange<unknown>).end,
        Operator: ConditionOperators.LessOrEqual,
      };
      filters.push(endFilter);
    }

    return filters;
  },
  [DatagridFilterType.NotBetween]: (
    filter: DatagridFilter<DateRange<unknown>>
  ) => {
    const filters = [];
    const startFilter: IFilterDescriptor = {
      Value: (filter.value as DateRange<unknown>).start,
      Operator: ConditionOperators.Less,
    };
    filters.push(startFilter);
    if ((filter.value as DateRange<unknown>).end) {
      const endFilter: IFilterDescriptor = {
        Value: (filter.value as DateRange<unknown>).end,
        Operator: ConditionOperators.Greater,
      };
      filters.push(endFilter);
    }

    return filters;
  },
};

export class WebComponentDataGridDatasource extends InkaDatasource<unknown> {
  sortingData$ = new BehaviorSubject<ISortingDescriptor[]>([]);
  filteringData$ = new BehaviorSubject<IFilterDescriptor>({
    Logic: 'and',
    Filters: [],
  });
  paginationData$: BehaviorSubject<IPaginationDescriptor>;
  cache$ = new BehaviorSubject<DatagridItem<unknown>[]>([]);

  ds: WebComponentDatasource<unknown>;
  private _filterMapper = DatasourceFilterMapper.getInstance();

  constructor(private _config: WebComponentDataGridDatasourceConfig) {
    super(_config);
    this.ds = _config.dataSource;
    this.paginationData$ = new BehaviorSubject<IPaginationDescriptor>({
      Limit: _config.pagination.pageSize,
      Offset: _config.pagination.pageSize * _config.pagination.currentPage,
    });
  }

  protected onFilter(data: DatagridItem<unknown>[]) {
    return data;
  }

  protected onPaginate(data: DatagridItem<unknown>[]) {
    this.ds.setPagination({
      Limit: this.pagination.pageSize,
      Offset: this.pagination.currentPage * this.pagination.pageSize,
    });
    return data;
  }

  protected onSorting(data: DatagridItem<unknown>[]) {
    return data;
  }

  select(columns: string[]): Observable<unknown[]> {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  connect(_: CollectionViewer): Observable<DatagridItem<unknown>[]> {
    const data = combineLatest(
      this.filteringData$.pipe(distinctUntilChanged()),
      this.sortingData$.pipe(distinctUntilChanged()),
      this.paginationData$.pipe(distinctUntilChanged())
    ).pipe(
      map(([filter, sorting, pagination]) => {
        this.ds.setFilter(filter);
        this.ds.setSorting(sorting);
        if (!isNullOrUndefined(pagination?.Limit)) {
          this.ds.setPagination(pagination);
        }
      }),
      switchMap(() => {
        return this.ds.data$.pipe(
          map((x) => {
            if (x) {
              this.cache$.next(this.wrapItem(x.Items));
              this.size$.next(x.Total);
            }

            return this.cache$.value;
          })
        );
      }),
      shareReplay(1),
      distinctUntilChanged(),
      debounceTime(100),
      tap((data) => {
        this.cache$.next(data);
        this.pageData$.next(data);
        if (this._config.onLoad) {
          this._config.onLoad(data);
        }
      })
    );
    return data;
  }

  setData(items: unknown[]) {
    this.ds.addItems(items, true);
  }

  setSorting(
    columnName: string,
    sorting?: SortOrder,
    sortingNumber: number = 1
  ) {
    let descriptors = cloneDeep(
      this.sortingData$.value
    ) as ISortingDescriptor[];
    if (sorting) {
      let descriptor: ISortingDescriptor = descriptors.find(
        (x) => x.Field === columnName
      );
      if (descriptor) {
        descriptor.Direction = sorting;
      } else {
        descriptor = {
          Field: columnName,
          Direction: sorting,
        } as ISortingDescriptor;
        descriptors.push(descriptor);
      }
    } else {
      descriptors = descriptors.filter((x) => x.Field !== columnName);
    }
    this.sortingData$.next(descriptors);
  }

  setFilter(columnName: string, filter: DatagridFilter<unknown>) {
    const filterData = cloneDeep(
      this.filteringData$.value
    ) as IFilterDescriptor;
    filterData.Filters = filterData.Filters.filter(
      (x) => x.Field !== columnName
    );
    if (!isNullOrUndefined(filter?.value)) {
      let filterValue = filterData.Filters.find((x) => x.Field === columnName);
      if (filterValue) {
        filterValue.Value = filter.value;
      } else {
        const between = [
          DatagridFilterType.Between,
          DatagridFilterType.NotBetween,
        ];
        if (between.includes(filter.type)) {
          const filters = mapBetweenFunctions[filter.type](filter);
          filters
            .filter((x) => !isNullOrUndefined(x.Value))
            .forEach((x) => {
              x.Field = columnName;
              filterData.Filters.push(x);
            });
        } else {
          filterValue = this._filterMapper.map(filter);
          filterValue.Field = columnName;
          filterData.Filters.push(filterValue);
        }
      }
    }
    this.filteringData$.next(filterData);
    this.resetPagination();
  }

  setPagination(pagination: InkaPagination) {
    if (pagination?.pageSize) {
      this.paginationData$.next({
        Limit: pagination.pageSize,
        Offset: pagination.currentPage * pagination.pageSize,
      });
    }
  }
}
