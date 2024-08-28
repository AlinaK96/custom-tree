import { InjectionToken } from '@angular/core';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { FilterOperation } from '../model/filter-operation';

const zero = 0;

export const inkaDataTypeFilterComponentsData = new InjectionToken(
  'inkaDataTypeFilterComponentsData'
);
export type DataTypeFilterOperations = {
  [key in string | DatagridFilterType]: FilterOperation;
};

export enum DatagridFilterType {
  Search = 'search',
  Includes = 'includes',
  Equals = 'equals',
  NotEquals = 'notEquals',
  LessOrEquals = 'lessOrEquals',
  GreaterOrEquals = 'greaterOrEqual',
  Between = 'between',
  Custom = 'custom',
  NotBetween = 'notBetween',
}

export const operations: DataTypeFilterOperations = {
  [DatagridFilterType.Search]: {
    operation: DatagridFilterType.Search,
    name: 'Поиск',
    function: (item, filterValue) =>
      new RegExp(filterValue.toLowerCase()).test(item.toLowerCase()),
    availableTypes: [ColumnDataTypesEnum.String],
  },
  [DatagridFilterType.Equals]: {
    operation: DatagridFilterType.Equals,
    name: 'Равно',
    function: (item, filterValue) => {
      if (typeof item === 'string') {
        item = item.toLowerCase();
        filterValue = filterValue.toLowerCase();
      }
      return item === filterValue;
    },
    availableTypes: [
      ColumnDataTypesEnum.String,
      ColumnDataTypesEnum.Number,
      ColumnDataTypesEnum.Boolean,
    ],
  },
  [DatagridFilterType.Includes]: {
    operation: DatagridFilterType.Includes,
    name: 'Вхождение',
    function: (item, filterValue) => {
      if (typeof item === 'string') {
        item = item.toLowerCase();
        filterValue = filterValue.map((x) => x.toLowerCase());
      }
      return filterValue?.length > zero ? filterValue.includes(item) : true;
    },
    availableTypes: [],
  },
  [DatagridFilterType.NotEquals]: {
    operation: DatagridFilterType.NotEquals,
    name: 'Не равно',
    function: (item, filterValue) => {
      if (typeof item === 'string') {
        item = item.toLowerCase();
        filterValue = filterValue.toLowerCase();
      }
      return item !== filterValue;
    },
    availableTypes: [
      ColumnDataTypesEnum.String,
      ColumnDataTypesEnum.Boolean,
      ColumnDataTypesEnum.Number,
    ],
  },
  [DatagridFilterType.GreaterOrEquals]: {
    operation: DatagridFilterType.GreaterOrEquals,
    name: 'Больше или равно',
    function: (item, filterValue) => Number(item) >= Number(filterValue),
    availableTypes: [ColumnDataTypesEnum.Number],
  },
  [DatagridFilterType.LessOrEquals]: {
    operation: DatagridFilterType.LessOrEquals,
    name: 'Меньше или равно',
    function: (item, filterValue) => {
      return Number(item) <= Number(filterValue);
    },
    availableTypes: [ColumnDataTypesEnum.Number],
  },
  [DatagridFilterType.Between]: {
    operation: DatagridFilterType.Between,
    name: 'Между',
    function: (item, filterValue) => {
      let status = true;
      if (filterValue.start) {
        status = Number(item) >= Number(filterValue.start);
      }
      if (filterValue.end) {
        status = status && Number(item) <= Number(filterValue.end);
      }
      return status;
    },
    availableTypes: [
      ColumnDataTypesEnum.Number,
      ColumnDataTypesEnum.Date,
      ColumnDataTypesEnum.DateTime,
    ],
  },
  [DatagridFilterType.NotBetween]: {
    operation: DatagridFilterType.NotBetween,
    name: 'Не входит в интервал',
    function: (item, filterValue) => {
      let status = true;
      if (filterValue.start) {
        status = Number(item) < Number(filterValue.start);
      }
      if (filterValue.end) {
        status = status || Number(item) > Number(filterValue.end);
      }
      return status;
    },
    availableTypes: [],
  },
};

export function operationsFactory(customOperations: DataTypeFilterOperations) {
  return Object.assign(operations, customOperations);
}
