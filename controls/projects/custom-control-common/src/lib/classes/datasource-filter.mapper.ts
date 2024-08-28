import { DatagridFilter } from '../modules/datagrid/model/datagrid-filter';
import { BaseMapper } from './base-mapper';

import { IFilterDescriptor } from '../models';
import { ConditionOperators } from '../modules/conditions-converter/models/Inner-confition.model';
import { DatagridFilterType } from '../modules/datagrid/providers/inka-data-type-operations';

export class DatasourceFilterMapper extends BaseMapper<
  DatagridFilter<unknown>,
  IFilterDescriptor
> {
  map(data: DatagridFilter<unknown>): IFilterDescriptor {
    return {
      Operator: this._getOperator(data.type),
      Value: data.value,
    };
  }

  private _getOperator(type: DatagridFilterType) {
    const operators = {
      [DatagridFilterType.Includes]: ConditionOperators.In,
      [DatagridFilterType.Equals]: ConditionOperators.Equal,
      [DatagridFilterType.NotEquals]: ConditionOperators.NotEqual,
      [DatagridFilterType.Search]: ConditionOperators.Contains,
      [DatagridFilterType.GreaterOrEquals]: ConditionOperators.GreaterOrEqual,
      [DatagridFilterType.LessOrEquals]: ConditionOperators.LessOrEqual,
    };

    return operators[type];
  }
}
