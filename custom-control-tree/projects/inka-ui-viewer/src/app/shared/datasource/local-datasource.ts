import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {FunctionConditionConverter} from '../conditions-converter/converters/function/function-condition.converter';
import {
  ConditionLogicOperators,
  ConditionOperators,
  DataSourceFilter
} from '../conditions-converter/models/Inner-confition.model';
import {
  IDataWithTotal,
  IFilterDescriptor,
  IMetadata,
  IPaginationDescriptor,
  ISortingDescriptor,
  IUiConstructorDatasource,
} from './datasource.interface';

const one = 1;
const zero = 0;
const minusOne = -1;

export class LocalDatasource<T> implements IUiConstructorDatasource<T> {
  private readonly _data$: BehaviorSubject<TDataSourceItemWithIndex<T>[]>;
  private readonly _reload$ = new BehaviorSubject<void>(undefined);
  private readonly _filter$ = new BehaviorSubject<IFilterDescriptor<T>>({});
  private readonly _sorting$ = new BehaviorSubject<ISortingDescriptor<T>[]>([]);
  private readonly _pagination$ = new BehaviorSubject<IPaginationDescriptor | undefined>(undefined);
  readonly data$: Observable<IDataWithTotal<TDataSourceItemWithIndex<T>>>;
  readonly metadata$: Observable<IMetadata<T>[]>;
  private readonly _conditionConverter = new FunctionConditionConverter();
  private _index = zero;

  constructor(data: T[], metadata: IMetadata<T>[]) {
    this._data$ = new BehaviorSubject(
      data.map((item) => ({
        ...item,
        index$: this._index++,
      }))
    );
    this.metadata$ = new BehaviorSubject(metadata);
    this.data$ = combineLatest([this._data$, this._filter$, this._sorting$, this._pagination$, this._reload$]).pipe(
      debounceTime(1),
      map(([data, filter, sorting, pagination]) => {
        const filterValue = this._convertFilterDiscriptor(filter);
        const filterFn = this._conditionConverter.convert(filterValue);
        const filtredData = this.sort(
          data.filter((item) => filterFn(item)),
          sorting
        );

        return {
          Items: pagination ? filtredData.slice(pagination.Offset, pagination.Offset + pagination.Limit) : filtredData,
          Total: filtredData.length,
        };
      })
    );
  }

  reload(): void {
    this._reload$.next();
  }

  setFilter(filterDiscriptor: IFilterDescriptor<T>): void {
    this._filter$.next(filterDiscriptor);
  }

  setSorting(sortingDiscriptor: ISortingDescriptor<T>[]): void {
    this._sorting$.next(sortingDiscriptor);
  }

  setPagination(paginationDiscriptor: IPaginationDescriptor): void {
    this._pagination$.next(paginationDiscriptor);
  }

  addItems(items: TDataSourceItemWithIndex<T>[], clear: boolean): void {
    this._index = clear ? zero : this._index;
    this._data$.next([...(clear ? [] : this._data$.getValue()), ...items]);
  }

  update(item: TDataSourceItemWithIndex<T>): void {
    this._data$.next([
      ...this._data$.getValue().map((dataItem) => (dataItem.index$ === item.index$ ? item : dataItem)),
    ]);
  }

  delete(item: TDataSourceItemWithIndex<T>): void {
    this._data$.next([...this._data$.getValue().filter((dataItem) => dataItem.index$ !== item.index$)]);
  }

  protected sort(data: TDataSourceItemWithIndex<T>[], sortingDiscriptor: ISortingDescriptor<T>[]) {
    const columns: string[] = [];
    const directions: string[] = [];
    sortingDiscriptor.forEach((item) => {
      columns.push(`${item.Field}`);
      directions.push(item.Direction);
    });
    return data.sort((a, b) => {
      return this._sortData(a, b, columns, directions);
    });
  }

  private _sortData(d1: T, d2: T, params: string[] = [], dirs: string[] = []): number {
    const field = params[0] as keyof T;
    const direction = dirs[0];

    let d1Param = this._getFieldValue(d1, field);
    let d2Param = this._getFieldValue(d2, field);
    if (d1Param > d2Param) {
      return direction === 'asc' ? one : minusOne;
    } else if (d1Param < d2Param) {
      return direction === 'asc' ? minusOne : one;
    } else {
      if (params.length > one) {
        return this._sortData(d1, d2, params.slice(one, params.length), dirs.slice(one, dirs.length));
      } else {
        return zero;
      }
    }
  }

  private _getFieldValue(data: T, field: keyof T) {
    return this._prepearParamsToSorting(data[field]);
  }

  private _prepearParamsToSorting(d1Param: unknown): any {
    let param = d1Param || '';

    if (typeof param === 'boolean' || typeof param === 'number') {
      param = Number(param);
    } else if (typeof param === 'string') {
      param = param?.toLocaleLowerCase() || '';
    }

    return param;
  }

  private _convertFilterDiscriptor(filterDiscriptor: IFilterDescriptor<T>): DataSourceFilter {
    return {
      Logic: filterDiscriptor.Logic as ConditionLogicOperators,
      Operator: filterDiscriptor.Operator as ConditionOperators,
      Field: filterDiscriptor.Field as string,
      Value: filterDiscriptor.Value,
      Filters: (filterDiscriptor.Filters || []).map((filter) => this._convertFilterDiscriptor(filter)),
    };
  }
}

type TDataSourceItemWithIndex<T> = T & { index$: number };
