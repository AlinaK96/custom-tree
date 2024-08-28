import { ConditionConverterOption, ConditionDataTypes, ConditionOperatorOption, ConditionOperators, InnerCondition } from "../models/Inner-confition.model";
import { isNullOrUndefined } from "./function/function-condition.constatns";

/**
 * Base conditions converter
 */
export abstract class BaseConverter<TEntityType extends object, TResultType> {
  /**
   * @param operators - Operators storage
   * @param converters - Converters storage
   */
  constructor(
    protected readonly operators: Record<ConditionOperators | string, ConditionOperatorOption> = {},
    protected readonly converters: Record<ConditionDataTypes | string, ConditionConverterOption> = {}
  ) {}

  convert(entity: TEntityType) {
    const inner = this.convertToInner(entity);
    return this.convertToResult(inner);
  }

  /**
   * Convert inner conditions format to result type
   *
   * @param obj
   */
  abstract convertToResult(obj: InnerCondition): TResultType;

  /**
   * Convert data source filter type to inner condition
   *
   * @param obj
   */
  abstract convertToInner(obj: TEntityType): InnerCondition;

  /**
   * Create result object from standard inner condition
   * @param innerCondition
   * @protected
   */
  protected abstract createResultFromStandardCondition(innerCondition: InnerCondition): TResultType;

  /**
   * Create result from standard inner condition
   * @param innerCondition
   * @protected
   */
  protected abstract createResultFromLogicCondition(innerCondition: InnerCondition): TResultType;

  /**
   * Set operator
   *
   * @param operator
   * @protected
   */
  protected setOperator(operator: ConditionOperatorOption | ConditionOperatorOption[]) {
    const operators = Array.isArray(operator) ? operator : [operator];
    operators.forEach((operatorItem) => {
      this.operators[operatorItem.operator] = operatorItem;
    });
  }

  /**
   * Set operator function
   *
   * @protected
   * @param converter
   */
  protected setConverter(converter: ConditionConverterOption | ConditionConverterOption[]) {
    let converters: ConditionConverterOption[] = Array.isArray(converter) ? converter : [converter];
    converters.forEach((converterItem) => {
      this.converters[converterItem.type] = converterItem;
    });
  }

  /**
   * Check is inner condition
   * @param innerCondition
   */
  protected isInnerConditionLogic = (innerCondition: InnerCondition) => !isNullOrUndefined(innerCondition.Logic);

  /**
   *
   * @param innerCondition
   */
  protected isInnerConditionStandard = (innerCondition: InnerCondition) => !isNullOrUndefined(innerCondition.Operator);
}
