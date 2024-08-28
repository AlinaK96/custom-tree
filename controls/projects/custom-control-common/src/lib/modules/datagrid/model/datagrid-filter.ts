import { Filter } from 'odata-query';
import { DatagridFilterType } from '../providers/inka-data-type-operations';

export interface DatagridFilter<T> {
  value: Partial<T> | Filter;
  type: DatagridFilterType;
  isModified?: boolean;
}

const filterFunctions = {
  search: (item, filterValue) => {
    return new RegExp(filterValue.toLowerCase()).test(item.toLowerCase());
  },
  includes: (item, filterValue) => filterValue.includes(item),
  equals: (item, filterValue) => {
    return filterValue === item;
  },
};

export const executeFilter = (
  item: unknown,
  filter: DatagridFilter<unknown>
) => {
  const zero = 0;
  return filter.value?.toString()?.length > zero
    ? filterFunctions[filter.type](item, filter.value)
    : true;
};

export const isFilterEmpty = (filter: DatagridFilter<string>) => {
  const zero = 0;
  return (
    filter?.value === null ||
    filter?.value === undefined ||
    (filter?.value as string)?.length === zero
  );
};
