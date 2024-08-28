import { InjectionToken } from '@angular/core';
import { endOfDay, startOfDay } from 'date-fns';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { DatagridFilter } from '../model/datagrid-filter';
import { DatagridFilterType } from '../providers/inka-data-type-operations';

export const inkaDataTypeModifiers = new InjectionToken<InkaDataTypeModifiers>(
  'inkaDataTypeModifiers'
);
export const defaultModifiers = {
  [ColumnDataTypesEnum.Date]: (filter: DatagridFilter<unknown>) => {
    let newFilter = {} as DatagridFilter<unknown>;
    if (filter.type === DatagridFilterType.Equals && filter.value) {
      newFilter.type = DatagridFilterType.Between;
      newFilter.value = {
        start: startOfDay(filter.value as Date),
        end: endOfDay(filter.value as Date),
      };
      return newFilter;
    } else if (filter.type === DatagridFilterType.NotEquals && filter.value) {
      newFilter.type = DatagridFilterType.NotBetween;
      newFilter.value = {
        start: startOfDay(filter.value as Date),
        end: endOfDay(filter.value as Date),
      };
      return newFilter;
    } else if (
      filter.type === DatagridFilterType.LessOrEquals &&
      filter.value
    ) {
      newFilter.type = DatagridFilterType.LessOrEquals;
      newFilter.value = endOfDay(filter.value as Date);
      return newFilter;
    } else if (
      filter.type === DatagridFilterType.GreaterOrEquals &&
      filter.value
    ) {
      newFilter.type = DatagridFilterType.GreaterOrEquals;
      newFilter.value = startOfDay(filter.value as Date);
      return newFilter;
    }

    return filter;
  },
};

export type InkaDataTypeModifiers = {
  [key in DatagridFilterType]: (
    f: DatagridFilter<unknown>
  ) => DatagridFilter<unknown>;
};

export const createModifiers = (modifiers) => {
  return modifiers
    ? Object.assign(defaultModifiers, modifiers)
    : defaultModifiers;
};
