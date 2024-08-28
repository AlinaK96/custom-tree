import { BaseStoreService } from "../base-store.service";
import { IUiConstructorDatasource } from "./datasource.interface";

export class DatasourceService extends BaseStoreService<IUiConstructorDatasource<unknown>> {}
