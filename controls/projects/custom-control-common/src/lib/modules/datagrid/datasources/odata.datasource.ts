import * as _ from 'lodash';
import cloneDeep from 'lodash.clonedeep';
import { QueryOptions } from 'odata-query';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { OdataResponse } from '../../../models';
import { isNullOrUndefined } from '../../../utilities/checkers.util';
import { OdataClientService } from '../../../utilities/odata-client.service';
import { InkaDatasource } from '../datasources/inka.datasource';
import { ColumnAggregator } from '../model/column-agragator.model';
import { DatagridFilter } from '../model/datagrid-filter';
import { DatagridItem } from '../model/datagrid-item';
import { OdataDatasourceConfig } from '../model/inka-datasource-config.model';
import { DatagridFilterType } from '../providers/inka-data-type-operations';

export class OdataDatasource<T> extends InkaDatasource<T> {
  private _http: OdataClientService;
  private _entityPath: string;

  filterDebounceTime = 800;

  queryOptions: Partial<QueryOptions<T>> = {
    filter: [],
    count: true,
  };

  onLoaded: (data) => void;

  constructor(config: OdataDatasourceConfig<T>) {
    super(config);
    this._http = config.httpClient;
    this._entityPath = config.entityPath;
    this.onLoaded = config.onLoaded;
  }

  protected onFilter(data: DatagridItem<T>[]) {
    const columnAggregators = this.getAggregators();
    const filters = {};
    columnAggregators
      .filter((x) => !this._isFilterEmpty(x))
      .forEach((aggregator) => {
        let filterValue = cloneDeep(aggregator.columnFilterValue);
        if (
          aggregator.filterModifyCallback &&
          !isNullOrUndefined(filterValue?.value)
        ) {
          filterValue.value = aggregator.filterModifyCallback(
            filterValue.value
          );
        }
        const modifier = this.modifiers[aggregator.columnType];
        if (modifier) {
          filterValue = modifier(filterValue);
        }
        if (
          !isNullOrUndefined(filterValue?.value) &&
          filterValue?.value !== ''
        ) {
          this._buildFilterItem(
            filters,
            aggregator.columnName,
            filterValue,
            aggregator.columnType
          );
        }
      });
  }

  protected onPaginate(data: DatagridItem<T>[]) {
    const { currentPage, pageSize } = this.pagination;
    this.queryOptions.top = pageSize;
    this.queryOptions.skip = pageSize * currentPage;
  }

  protected onSorting(data: DatagridItem<T>[]) {
    const columnAggregators = this.getAggregators();
    let sortingString = '';
    columnAggregators
      .filter((x) => x.columnSortOrder)
      .sort((a, b) => a?.columnSortNumber - b?.columnSortNumber)
      .forEach(({ columnName, columnSortOrder }, index, array) => {
        sortingString += `${columnName} ${columnSortOrder} ${
          index < array.length - 1 ? ',' : ''
        }`;
      });
    this.queryOptions.orderBy = sortingString;
  }

  protected mapItems(items: DatagridItem<T>[]): Observable<DatagridItem<T>[]> {
    this.setLoading(true);
    return this._http
      .odataGetFull<T[]>(
        this._entityPath,
        this.queryOptions as Partial<QueryOptions<unknown>>
      )
      .pipe(
        map((response: OdataResponse<T[]>) => {
          if (!isNullOrUndefined(response['@odata.count'])) {
            this.setGlobalCount(response['@odata.count']);
          }
          if (this.onLoaded) {
            this.onLoaded(response.value);
          }
          return this.wrapItem(response.value);
        }),
        finalize(() => {
          this.setLoading(false);
        })
      );
  }

  /**
   * Generate odata filter object
   *
   * @param filterObject
   * @param columnName
   * @param filter
   * @param columnType
   * @private
   */
  private _buildFilterItem(
    filterObject: object,
    columnName: string,
    filter: DatagridFilter<unknown | Record<string, unknown>>,
    columnType: string
  ) {
    const columnNameParts = columnName.split('.');
    let fullMethodName = '';
    if (columnNameParts.length > 1) {
      fullMethodName += '.expand';
    }
    fullMethodName += columnNameParts.join('.expand') + '.filter';
    let lastFieldName = columnNameParts[columnNameParts.length - 1];
    const filterValue = {};
    switch (filter.type) {
      case DatagridFilterType.Search:
        filterValue[`tolower(${lastFieldName})`] = { contains: filter.value };
        break;
      case DatagridFilterType.Includes:
        filterValue['or'] = (filter.value as []).map((x) => ({
          [columnName]: x,
        }));
        break;
      case DatagridFilterType.Custom:
        filterValue[lastFieldName] = filter.value;
        break;
      case DatagridFilterType.Equals:
        if (columnType === 'string') {
          lastFieldName = `tolower(${lastFieldName})`;
          filter.value = (filter.value as string).toLowerCase();
        }
        filterValue[lastFieldName] = { eq: filter.value };
        break;
      case DatagridFilterType.LessOrEquals:
        filterValue[lastFieldName] = { le: filter.value };
        break;
      case DatagridFilterType.GreaterOrEquals:
        filterValue[lastFieldName] = { ge: filter.value };
        break;
      case DatagridFilterType.Between:
        const modifiedValue = filter.value as { start: unknown; end: unknown };
        filterValue[lastFieldName] = {};
        if (modifiedValue.start) {
          filterValue[lastFieldName].ge = modifiedValue.start;
        }

        if (modifiedValue.end) {
          filterValue[lastFieldName].le = modifiedValue.end;
        }
        break;
      case DatagridFilterType.NotBetween:
        const modifiedValue1 = filter.value as { start: unknown; end: unknown };
        filterValue['not'] = {
          [lastFieldName]: { ge: modifiedValue1.start, le: modifiedValue1.end },
        };
        break;
      case DatagridFilterType.NotEquals:
        if (columnType === 'string') {
          columnName = `tolower(${columnName})`;
          filter.value = (filter.value as string).toLowerCase();
        }
        filterValue[lastFieldName] = { ne: filter.value };
        break;
      default:
        throw new Error('Operation is not supported');
    }
    filterObject = _.setWith(filterObject, fullMethodName, filterValue, Object);
    return filterObject;
  }

  select(columns: string[]): Observable<T[]> {
    return of([]);
  }

  /***
   * check is filter empty
   *
   * @param filter
   * @private
   */
  private _isFilterEmpty(filter: ColumnAggregator) {
    const zero = 0;
    if (Array.isArray(filter.columnFilterValue?.value)) {
      return (filter.columnFilterValue?.value as []).length === zero;
    } else {
      return isNullOrUndefined(filter.columnFilterValue?.value);
    }
  }
}
