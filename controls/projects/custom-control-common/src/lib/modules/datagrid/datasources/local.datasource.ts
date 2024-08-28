import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from '../../../utilities/checkers.util';
import { InkaDatasource } from '../datasources/inka.datasource';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { ColumnAggregator, SortOrder } from '../model/column-agragator.model';
import { DatagridItem } from '../model/datagrid-item';
import { InkaDatasourceConfig } from '../model/inka-datasource-config.model';
import { DatagridFilterType } from '../providers/inka-data-type-operations';

const filterDebounceTime = 0;
const commonDebounceTime = 0;
const paginationDebounceTime = 0;
const sortDebounceTime = 0;

const positive = 1;
const neutral = 0;
const negative = -1;

export class LocalDatasource<T> extends InkaDatasource<T> {
  filterDebounceTime = filterDebounceTime;
  commonDebounceTime = commonDebounceTime;
  paginationDebounceTime = paginationDebounceTime;
  sortDebounceTime = sortDebounceTime;

  constructor(config: InkaDatasourceConfig<T>) {
    super(config);
    this.data$.next(config.data);
  }

  protected onFilter(data: DatagridItem<T>[]) {
    const columnAggregators = this.getAggregators().filter(
      (x) => x.columnFilterValue?.value !== null
    );
    return data.filter((item) => this.isRowVisible(item, columnAggregators));
  }

  protected onPaginate(data: DatagridItem<T>[]) {
    const { currentPage, pageSize } = this.pagination;
    const start = currentPage * pageSize;
    const end = start + pageSize;
    this.setGlobalCount(data.length);
    return data.filter((item, index) => {
      return index >= start && index < end;
    });
  }

  protected onSorting(data: DatagridItem<T>[]) {
    const columnAggregators =
      this.getAggregators()?.filter(
        (aggregator) => !isNullOrUndefined(aggregator.columnSortOrder)
      ) || [];
    const columns = [];
    const directions = [];
    columnAggregators.forEach((aggregator) => {
      columns.push(aggregator.columnName);
      directions.push(aggregator.columnSortOrder);
    });
    return data.sort((a, b) => {
      return this._sortData(a, b, columns, directions);
    });
  }

  protected isRowVisible(
    data: DatagridItem<T>,
    columnAggregators: ColumnAggregator[]
  ) {
    let status = true;
    columnAggregators
      .filter((x) => x.columnFilterValue)
      .forEach((columnAggregator) => {
        let value = data.data[columnAggregator.columnName];

        let filter = columnAggregator.columnFilterValue;

        if (
          columnAggregator.columnType === ColumnDataTypesEnum.Date ||
          columnAggregator.columnType === ColumnDataTypesEnum.DateTime
        ) {
          if (filter.type === DatagridFilterType.Includes) {
            filter.value = (filter.value as []).map((x) =>
              new Date(x).getTime()
            );
            value = new Date(value).getTime();
          } else {
            value = new Date(value);
          }
        }

        const modifier = this.modifiers[columnAggregator.columnType];
        if (modifier) {
          filter = modifier(filter);
        }
        status =
          status && this.operations[filter.type].function(value, filter.value);
      });
    return status;
  }

  setData(data: T[]) {
    this.data$.next(data);
  }

  select(columns: string[]): Observable<T[]> {
    return this.data$.pipe(
      map((items) =>
        items.map((item) => {
          const newItem = {};
          for (let column of columns) {
            newItem[column] = item[column];
          }
          return newItem as T;
        })
      )
    );
  }

  private _sortData(
    d1: DatagridItem<T>,
    d2: DatagridItem<T>,
    params: string[] = [],
    dirs: string[] = []
  ): number {
    let d1Param = this._prepearParamsToSorting(d1.data[params[0]]);
    let d2Param = this._prepearParamsToSorting(d2.data[params[0]]);
    if (this.customSoringFunctions && this.customSoringFunctions[params[0]]) {
      return this.customSoringFunctions[params[0]](
        d1Param,
        d2Param,
        dirs[0] as SortOrder
      );
    } else if (d1Param > d2Param) {
      return dirs[0] === 'asc' ? positive : negative;
    } else if (d1Param < d2Param) {
      return dirs[0] === 'asc' ? negative : positive;
    } else {
      if (params.length > positive) {
        params = params.slice(positive, params.length);
        dirs = dirs.slice(positive, dirs.length);
        return this._sortData(d1, d2, params, dirs);
      } else {
        return neutral;
      }
    }
  }

  /**
   * Process param for sorting
   *
   * @param d1Param - param for sorting
   * @private
   */
  private _prepearParamsToSorting(d1Param: unknown) {
    let param = d1Param || '';
    if (typeof param === 'boolean' || typeof param === 'number') {
      param = Number(param);
    } else if (typeof param === 'string') {
      param = param?.toLocaleLowerCase() || '';
    }
    return param;
  }
}
