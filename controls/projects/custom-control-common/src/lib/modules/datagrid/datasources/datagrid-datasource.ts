import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MultiSortDirective } from '../directives/multi-sort/multi-sort.directive';
import { DatagridFilter, isFilterEmpty } from '../model/datagrid-filter';
import { DatagridFilterObject } from '../model/datagrid-filter-object';
import { DatagridItem } from '../model/datagrid-item';
import { DataTypeFilterOperations } from '../providers/inka-data-type-operations';

export class DatagridDatasource<T> extends MatTableDataSource<DatagridItem<T>> {
  hasChildrenData = new BehaviorSubject<boolean>(false);
  multiSort: MultiSortDirective;
  filterData = {};
  primaryKey: string;
  foreignKey: string;
  maxLevel = new BehaviorSubject(1);

  visibleLength = 0;
  operations: DataTypeFilterOperations = {};

  private _isFilterChanged: boolean;
  private _filterChangingSubscription: Subscription;

  constructor() {
    super();
    this._filterChangingSubscription = this['_filter']
      .asObservable()
      .subscribe((filter) => {
        this._isFilterChanged = true;
      });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  _orderData(data: DatagridItem<T>[]): DatagridItem<T>[] {
    const temp = this.sortDataMultiple(
      data,
      this.multiSort?.actives,
      this.multiSort?.directions
    );
    const result = this.foreignKey && this.primaryKey ? [] : temp;
    if (this.maxLevel) {
      let level = 0;
      if (this.foreignKey && this.primaryKey) {
        let rootId = 1;
        let rootElements = temp.filter((x) => x.parentId === undefined);
        rootElements.length;
        rootElements
          .filter((x) => x.isVisible)
          .forEach((el) => {
            el.dataIndex = rootId.toString();
            result.push(el);
            this._processChildren(temp, el, rootId, result);
            rootId++;
          });
      }
      result.forEach((x) => {
        level = Math.max(level, x.level);
      });
      this.maxLevel?.next(level || 1);
    }
    this.visibleLength = result.length;
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  _pageData(data: DatagridItem<T>[]): DatagridItem<T>[] {
    if (!this.paginator) {
      return data;
    }

    const paginationStart =
      this.paginator?.pageIndex * this.paginator?.pageSize;
    const paginationEnd =
      (this.paginator?.pageIndex + 1) * this.paginator?.pageSize;
    return data.filter(
      (a, index) => index < paginationEnd && index >= paginationStart
    );
  }

  private _processChildren(
    temp: DatagridItem<T>[],
    el: DatagridItem<T>,
    rootId: number | string,
    result: DatagridItem<T>[]
  ) {
    const children = temp.filter((x) => {
      return x.parentId === el.id;
    });
    let childrenId = 1;
    children.forEach((childEl) => {
      childEl.dataIndex = `${rootId}.${childrenId}`;
      childEl.level = el.level + 1;
      result.push(childEl);
      childrenId++;
      this._processChildren(temp, childEl, childEl.dataIndex, result);
    });
  }

  /* eslint-enable */

  sortingDataAccessor = (data: DatagridItem<T>, sortHeaderId: string) =>
    data.data[sortHeaderId]?.toLocaleLowerCase();
  filterPredicate = (item: DatagridItem<T>, filter: string) => {
    const parent =
      this.primaryKey && this.foreignKey
        ? this.data.find((x) => x.id === item.parentId)
        : null;
    if (filter.length > 0) {
      const filterData = JSON.parse(filter, this._receiveData);
      const filterKeys = Object.keys(filterData);
      const isFilterEmptyStatus =
        filterKeys.length > 0
          ? filterKeys
              .map((key) => isFilterEmpty(filterData[key]))
              .reduce((acc, curr) => acc || curr, false)
          : true;

      const children =
        this.primaryKey && this.foreignKey
          ? this.data.filter((x) => x.parentId === item.id)
          : [];
      const status = this._checkItem(filterData, item);
      const childrenStatus =
        children?.length > 0
          ? children
              .map((x) => this._checkItem(filterData, x))
              .reduce((acc, curr) => acc || curr, false)
          : false;

      if (parent) {
        parent.isExpanded = this._isFilterChanged
          ? !isFilterEmptyStatus
          : parent.isExpanded;
        parent.hasFilteredChildren = isFilterEmptyStatus || status;
      }
      const isParentExpanded = parent ? parent.isExpanded : true;
      return (status || childrenStatus) && isParentExpanded;
    } else {
      return true;
    }
  };

  private _checkItem(filterData, item: DatagridItem<T>) {
    const status = Object.keys(filterData)
      .map((f) => {
        const result = { data: item.data[f], filter: filterData[f] };
        return result;
      })
      .reduce((acc, curr, i) => {
        return acc && curr.filter?.type
          ? this.operations[curr.filter.type].function(
              curr.data,
              curr.filter?.value
            )
          : true;
      }, true) as boolean;
    return status;
  }

  setData(data) {
    this.data = data;
    this._orderData(data);
  }

  applyFilter(columnName: string, filter: DatagridFilter<unknown>) {
    this.filterData[columnName] = filter;
  }

  setFilter(filter: DatagridFilterObject) {
    this.filterData = filter;
  }

  sortDataMultiple(
    data: DatagridItem<T>[],
    actives: string[],
    directions: string[]
  ): DatagridItem<T>[] {
    const d = Object.assign(new Array<DatagridItem<T>>(), data);
    return d.sort((i1, i2) => {
      return this._sortData(i1, i2, actives, directions);
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  _filterData(data: DatagridItem<T>[]): DatagridItem<T>[] {
    const result = super._filterData(data);
    this._isFilterChanged = false;
    this.hasChildrenData?.next(
      result.filter((x) => x.hasFilteredChildren).length > 0
    );
    return result;
  }

  disconnect() {
    super.disconnect();
    this._filterChangingSubscription.unsubscribe();
  }

  private _sortData(
    d1: DatagridItem<T>,
    d2: DatagridItem<T>,
    params: string[] = [],
    dirs: string[] = []
  ): number {
    if (
      d1.data[params[0]]?.toLocaleLowerCase() >
      d2.data[params[0]]?.toLocaleLowerCase()
    ) {
      return dirs[0] === 'asc' ? 1 : -1;
    } else if (
      d1.data[params[0]]?.toLocaleLowerCase() <
      d2.data[params[0]]?.toLocaleLowerCase()
    ) {
      return dirs[0] === 'asc' ? -1 : 1;
    } else {
      if (params.length > 1) {
        params = params.slice(1, params.length);
        dirs = dirs.slice(1, dirs.length);
        return this._sortData(d1, d2, params, dirs);
      } else {
        return 0;
      }
    }
  }

  private _receiveData(key, value) {
    const dateFormat = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
    if (typeof value === 'string' && dateFormat.test(value)) {
      return new Date(value);
    }

    return value;
  }
}
