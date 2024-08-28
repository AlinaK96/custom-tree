import { ObjectHelper } from '../../../../utilities/object-helper';
import {
  ConditionDataTypes,
  DataSourceFilter,
  InnerCondition,
} from '../../models/Inner-confition.model';
import { BaseConverter } from '../base.converter';
import {
  functionConverters,
  functionLogicOperators,
  functionOperators,
  functionTypeCheckers,
  isNullOrUndefined,
} from './function-condition.constatns';

export class FunctionConditionConverter extends BaseConverter<
  DataSourceFilter,
  (item: any) => boolean
> {
  constructor() {
    super(functionOperators, functionConverters);
  }

  /**
   * @inheritDoc
   */
  convertToInner(dataSourceFilter: DataSourceFilter): InnerCondition {
    let innerCondition: InnerCondition = {};
    if (this._isDataSourceConditionLogic(dataSourceFilter)) {
      innerCondition = this._createLogicInnerCondition(dataSourceFilter);
    }

    if (this._isDataSourceConditionStandard(dataSourceFilter)) {
      innerCondition = this._createStandardInnerCondition(dataSourceFilter);
    }

    return innerCondition;
  }

  /**
   * Create object in Inner condition format for logical condition
   *
   * @param dataSourceFilter - data source filter
   * @private
   */
  private _createLogicInnerCondition(dataSourceFilter: DataSourceFilter) {
    const innerCondition: InnerCondition = {
      Logic: dataSourceFilter.Logic,
      Filters: (dataSourceFilter.Filters || []).map((filter) =>
        this.convertToInner(filter)
      ),
    };

    return innerCondition;
  }

  /**
   * Create object in Inner condition format for simple condition
   *
   * @param dataSourceFilter - data source filter
   * @private
   */
  private _createStandardInnerCondition = (
    dataSourceFilter: DataSourceFilter
  ) => {
    const innerCondition: InnerCondition = {
      Field: dataSourceFilter.Field,
      Operator: dataSourceFilter.Operator,
      Value: dataSourceFilter.Value,
      Type: this._getConditionalDataType(dataSourceFilter),
    };

    return innerCondition;
  };

  /**
   * @inheritDoc
   */
  convertToResult(innerCondition: InnerCondition): (item: any) => boolean {
    let callback = (_: unknown) => true;
    if (this.isInnerConditionLogic(innerCondition)) {
      callback = this.createResultFromLogicCondition(innerCondition);
    }

    if (this.isInnerConditionStandard(innerCondition)) {
      callback = this.createResultFromStandardCondition(innerCondition);
    }

    return callback;
  }

  /**
   * @inheritDoc
   */
  protected createResultFromLogicCondition(
    innerCondition: InnerCondition
  ): (item: any) => boolean {
    const { identity, concat } =
      functionLogicOperators[innerCondition.Logic as string];
    return (innerCondition.Filters || [])
      .map((x) => this.convertToResult(x))
      .reduce(concat, identity);
  }

  /**
   * @inheritDoc
   */
  protected createResultFromStandardCondition(
    innerCondition: InnerCondition
  ): (item: any) => boolean {
    const operator = this.operators[innerCondition.Operator as string];
    const converter = this.converters[innerCondition.Type as string];
    const conditionValue = converter
      ? converter.predicate(innerCondition.Value)
      : innerCondition.Value;
    return (item) => {
      const value = ObjectHelper.getObjValue(
        item,
        innerCondition.Field as string
      );
      const normalizedItemValue = converter
        ? converter.predicate(value)
        : value;
      return operator.predicate(normalizedItemValue, conditionValue) as boolean;
    };
  }

  /**
   * Check is datasource condition standard
   * @param dataSourceCondition
   */
  private _isDataSourceConditionStandard = (
    dataSourceCondition: DataSourceFilter
  ) => !isNullOrUndefined(dataSourceCondition.Operator);

  /**
   * Check is datasource condition logical
   * @param dataSourceCondition
   */
  private _isDataSourceConditionLogic = (
    dataSourceCondition: DataSourceFilter
  ) => !isNullOrUndefined(dataSourceCondition.Logic);

  /**
   *
   * @param dataSourceFilter
   * @private
   */
  private _getConditionalDataType(dataSourceFilter: DataSourceFilter) {
    const type = functionTypeCheckers.find((x) =>
      x.predicate(dataSourceFilter.Value)
    );
    return type?.type || ConditionDataTypes.String;
  }
}
