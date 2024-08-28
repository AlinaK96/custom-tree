import {
  ConditionConverterOption,
  ConditionDataTypes,
  ConditionLogicOperators,
  ConditionOperators,
} from '../../models/Inner-confition.model';

export const functionOperators = {
  [ConditionOperators.Equal]: {
    operator: ConditionOperators.Equal,
    predicate: (filterA: any, filterB: any) => filterA === filterB,
  },
  [ConditionOperators.NotEqual]: {
    operator: ConditionOperators.NotEqual,
    predicate: (filterA: any, filterB: any) => filterA !== filterB,
  },
  [ConditionOperators.Less]: {
    operator: ConditionOperators.Less,
    predicate: (filterA: any, filterB: any) => filterA < filterB,
  },
  [ConditionOperators.LessOrEqual]: {
    operator: ConditionOperators.LessOrEqual,
    predicate: (filterA: any, filterB: any) => filterA <= filterB,
  },
  [ConditionOperators.Greater]: {
    operator: ConditionOperators.Greater,
    predicate: (filterA: any, filterB: any) => filterA > filterB,
  },
  [ConditionOperators.GreaterOrEqual]: {
    operator: ConditionOperators.GreaterOrEqual,
    predicate: (filterA: any, filterB: any) => filterA >= filterB,
  },
  [ConditionOperators.StartWith]: {
    operator: ConditionOperators.StartWith,
    predicate: (filterA: any, filterB: any) => filterA.startsWith(filterB),
  },
  [ConditionOperators.Contains]: {
    operator: ConditionOperators.Contains,
    predicate: (filterA: any, filterB: any) => {
      return filterA.includes(filterB)
    },
  },
  [ConditionOperators.EndWith]: {
    operator: ConditionOperators.EndWith,
    predicate: (filterA: any, filterB: any) => filterA.endsWith(filterB),
  },
  [ConditionOperators.In]: {
    operator: ConditionOperators.In,
    predicate: (filterA: any, filterB: any) => {
      return filterB.includes(filterA);
    },
  },
  [ConditionOperators.IsNull]: {
    operator: ConditionOperators.DoesNotContains,
    predicate: (filterA: any, _filterB: any) => isNullOrUndefined(filterA),
  },
  [ConditionOperators.IsNotNull]: {
    operator: ConditionOperators.IsNotNull,
    predicate: (filterA: any, _filterB: any) => !isNullOrUndefined(filterA),
  },
};

export const functionConverters: Record<ConditionDataTypes | string, ConditionConverterOption> = {
  [ConditionDataTypes.Boolean]: {
    type: ConditionDataTypes.Boolean,
    predicate: (item: any) => Number(item),
  },
  [ConditionDataTypes.Date]: {
    type: ConditionDataTypes.Date,
    predicate: (item: any) => {
      return item ? new Date(item).getTime() : null
    },
  },
  [ConditionDataTypes.DateTime]: {
    type: ConditionDataTypes.DateTime,
    predicate: (item: any) => item ? new Date(item).getTime() : 0,
  },
  [ConditionDataTypes.Object]: {
    type: ConditionDataTypes.Object,
    predicate: (item: any) => item ? item.toString() : null,
  },
  [ConditionDataTypes.String]: {
    type: ConditionDataTypes.String,
    predicate: (item: any) => {
      return item.toLowerCase();
    }
  }
};

export const functionTypeCheckers = [
  {
    type: ConditionDataTypes.String,
    predicate: (item: any) => typeof item === 'string',
  },
  {
    type: ConditionDataTypes.Number,
    predicate: (item: any) => typeof item === 'number',
  },
  {
    type: ConditionDataTypes.Boolean,
    predicate: (item: any) => typeof item === 'boolean',
  },
  {
    type: ConditionDataTypes.Date,
    predicate: (item: any) => item instanceof Date,
  },
  {
    type: ConditionDataTypes.DateTime,
    predicate: (item: any) => item instanceof Date,
  },
  {
    type: ConditionDataTypes.Object,
    predicate: (item: any) => typeof item === 'object',
  },
];

export type TPredicate = (item: any) => boolean;
export type TLogicOperators = Record<ConditionLogicOperators | string,
  { identity: TPredicate; concat: (acc: TPredicate, curr: TPredicate) => TPredicate }>;
export const functionLogicOperators: TLogicOperators = {
  [ConditionLogicOperators.Or]: {
    identity: () => false,
    concat: (acc, curr) => (item) => acc(item) || curr(item),
  },
  [ConditionLogicOperators.And]: {
    identity: () => true,
    concat: (acc, curr) => (item) => acc(item) && curr(item),
  },
  [ConditionLogicOperators.Not]: {
    identity: () => false,
    concat: (acc, curr) => (item) => !(acc(item) || curr(item)),
  },
};

export const isNullOrUndefined = (obj: unknown) => obj === null || obj === undefined;
