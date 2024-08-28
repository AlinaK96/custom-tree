import { DatagridFilter } from '../model/datagrid-filter';

export interface DatagridFilterObject {
  [key: string]: DatagridFilter<unknown>;
}
