/**
 * Logical operators for conditions
 */
export enum ConditionLogicOperators {
  Or = 'or',
  And = 'and',
  Not = 'not'
}

/**
 * Action operators for conditions
 */
export enum ConditionOperators {
  NotEqual = '!=',
  Less = '<',
  LessOrEqual = '<=',
  Equal = '=',
  GreaterOrEqual = '>=',
  Greater = '>',
  StartWith = 'startWith',
  DoesNotStartWith = 'doesNotStartWith',
  EndWith = 'endWith',
  DoesNotEndWith = 'doesNotEndWith',
  Contains = 'contains',
  DoesNotContains = 'doesNotContains',
  In = 'in',
  IsNull = 'isNull',
  IsNotNull = 'isNotNull'
}

/**
 * Data types for conditions
 */
export enum ConditionDataTypes {
  String = 'string',
  Date = 'date',
  DateTime = 'datetime',
  Object = 'object',
  Boolean = 'boolean',
  Number = 'number'
}

/**
 * General filter type
 */
export interface DataSourceFilter {
  Field?: string;
  Logic?: ConditionLogicOperators;
  Operator?: ConditionOperators;
  Filters?: DataSourceFilter[];
  Value?: unknown;
}

/**
 * Inner condition type
 */
export interface InnerCondition {
  Field?: string;
  Type?: string;
  Logic?: ConditionLogicOperators;
  Operator?: ConditionOperators;
  Filters?: InnerCondition[];
  Value?: unknown;
}

/**
 * Predicate used for operation type
 */
export type ConditionOperatorPredicate = (itemA: unknown, itemB: unknown) => unknown;

/**
 * Predicate used for converting type
 */
export type ConditionConverterPredicate = (item: unknown) => unknown;

/**
 * Condition operator option type
 */
export interface ConditionOperatorOption {
  operator: ConditionOperators | string;
  predicate: ConditionOperatorPredicate;
}

/**
 * Condition converter option type
 */
export interface ConditionConverterOption {
  type: ConditionDataTypes | string,
  predicate: ConditionConverterPredicate
}
