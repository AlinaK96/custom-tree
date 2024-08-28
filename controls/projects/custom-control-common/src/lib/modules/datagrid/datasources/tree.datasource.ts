import cloneDeep from 'lodash.clonedeep';
import { ArrayUtilities } from '../../../utilities/array-utilities';
import { isNullOrUndefined } from '../../../utilities/checkers.util';
import { LocalDatasource } from '../datasources/local.datasource';
import { ColumnAggregator } from '../model/column-agragator.model';
import { DatagridFilter } from '../model/datagrid-filter';
import { DatagridItem } from '../model/datagrid-item';
import { TreeDatasourceConfig } from '../model/inka-datasource-config.model';

export class TreeDatasource<T> extends LocalDatasource<T> {
  private readonly _foreignKey: string;
  private readonly _primaryKey: string;

  expanded = {};

  constructor(config: TreeDatasourceConfig<T>) {
    super(config);
    this._foreignKey = config.foreignKey;
    this._primaryKey = config.primaryKey;
  }

  protected wrapItem(data: T[]): DatagridItem<T>[] {
    const wrappedData = super.wrapItem(data);
    wrappedData.forEach((item) => {
      item.parentId = item.data[this._foreignKey];
      item.parent = wrappedData.find(
        (x) => x.data[this._primaryKey] === item.data[this._foreignKey]
      );
      item.isExpanded = this.expanded[item.data[this._primaryKey]];

      item.level = item.parent ? item.parent.level + 1 : 0;
      const child = wrappedData.find(
        (chlid) => chlid.data[this._foreignKey] === item.data[this._primaryKey]
      );
      item.hasChildren = !isNullOrUndefined(child);
    });
    return wrappedData;
  }

  private _appendChildren(
    result: DatagridItem<unknown>[],
    data: DatagridItem<unknown>[],
    item: DatagridItem<unknown>
  ) {
    const children = data.filter(
      (i) => i.parentId === item.data[this._primaryKey]
    );
    for (const child of children) {
      result.push(child);
    }
  }

  protected onFilter(data: DatagridItem<T>[]): DatagridItem<T>[] {
    const aggregators = this.getAggregators();
    let treeData = [];
    const buildedTreeArray = data
      .filter((x) => !x.parentId)
      .map((x) => this._buildNode(x, data));
    const flatten = ArrayUtilities.flatten(buildedTreeArray, (c) => c);
    for (const item of flatten) {
      if (item.parent) {
        if (!this.isFilterEmpty()) {
          this.expanded[item.parentId] = this.isRowVisible(item, aggregators);
          item.parent.isVisible =
            item.parent.isVisible || this.isRowVisible(item, aggregators);
        }
        item.isVisible =
          this.isRowVisible(item, aggregators) && this.expanded[item.parentId];
      } else {
        item.isVisible = this.isRowVisible(item, aggregators);
      }
    }
    treeData = flatten.filter((x) => x.isVisible);
    return this._setDataIndexes(treeData);
  }

  private _buildNode(item: DatagridItem<T>, data: DatagridItem<T>[]) {
    const children = data.filter(
      (x) => x.parentId === item.data[this._primaryKey]
    );
    return [item, ...children.map((x) => this._buildNode(x, data))];
  }

  private _appendItem(
    item: DatagridItem<T>,
    data: DatagridItem<T>[],
    result: DatagridItem<T>[]
  ) {
    if (result.indexOf(item) < 0) {
      result.push(item);
    }
    const children = data.filter(
      (x) => x.data[this._foreignKey] === item.data[this._primaryKey]
    );
    if (children.length > 0) {
      for (const child of children) {
        this._appendItem(child, data, result);
      }
    }
  }

  private _isVisible(
    item: DatagridItem<T>,
    columnAggregators: ColumnAggregator[]
  ): boolean {
    return super.isRowVisible(item, columnAggregators);
  }

  setFilter(columnName: string, filter: DatagridFilter<unknown>) {
    super.setFilter(columnName, filter);
    this.expanded = {};
  }

  toggleTreeItem(item) {
    this.expanded[item.data[this._primaryKey].toString()] =
      !this.expanded[item.data[this._primaryKey].toString()];
    this.data$.next(this.data$.value);
  }

  protected onPaginate(data: DatagridItem<T>[]): DatagridItem<T>[] {
    return super.onPaginate(data);
  }

  private _addItemsToResult(
    item: DatagridItem<T>,
    result: DatagridItem<T>[],
    allData: DatagridItem<T>[]
  ) {
    const children = allData.filter(
      (x) => x.parentId === item.data[this._primaryKey]
    );
    for (const child of children) {
      if (result.indexOf(child) < 0) {
        result.push(child);
      }
      if (item.hasChildren) {
        this._addItemsToResult(child, result, allData);
      }
    }
  }

  private _setDataIndexes(items: DatagridItem<T>[]) {
    const { pageSize, currentPage } = this.pagination$.value;
    let rootId = 1;
    let childrenIds = {};

    return items.map((item) => {
      if (item.parent && !childrenIds[item.parentId]) {
        childrenIds[item.parentId] = 1;
      }
      item.dataIndex = item.parent
        ? `${item.parent.dataIndex}.${childrenIds[item.parentId]++}`
        : (rootId++).toString();
      return cloneDeep(item);
    });
  }
}
