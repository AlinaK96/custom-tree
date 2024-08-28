import { OdataClientService } from '../../../utilities/odata-client.service';
import { SortOrder } from '../model/column-agragator.model';
import { DatagridFilter } from '../model/datagrid-filter';

export interface InkaDatasourceConfig<T> {
  pagination?: {
    pageSize?: number;
    currentPage?: number;
  };
  filter?: {
    [key in string]: DatagridFilter<T>;
  };
  sorting?: { columnName: string; order: SortOrder }[];
  sortingFunctions?: Record<
    string,
    (a: unknown, b: unknown, order: SortOrder) => number
  >;
  data?: T[];
}

export interface OdataDatasourceConfig<T> extends InkaDatasourceConfig<T> {
  httpClient: OdataClientService;
  entityPath: string;
  onLoaded?: (data) => void;
}

export interface TreeDatasourceConfig<T> extends InkaDatasourceConfig<T> {
  primaryKey: string;
  foreignKey: string;
}
