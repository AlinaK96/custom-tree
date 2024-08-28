export class DatagridItem<T> {
  id: string;
  parentId: string;
  rowIndex: number;
  dataIndex: string;
  data: T;
  isVisible: boolean;
  hasChildren: boolean;
  level: number;
  isExpanded: boolean;
  parent: DatagridItem<T>;
  hasFilteredChildren: boolean;
  children: DatagridItem<T>[];
  isGroup?: boolean;
}
