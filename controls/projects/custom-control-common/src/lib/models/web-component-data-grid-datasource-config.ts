import {InkaDatasourceConfig} from '../modules/datagrid/model/inka-datasource-config.model';
import {WebComponentDatasource} from '../classes/datasource';

export interface WebComponentDataGridDatasourceConfig extends InkaDatasourceConfig<unknown> {
  dataSource: WebComponentDatasource<unknown>;
  onLoad?: (data) => void;
}
