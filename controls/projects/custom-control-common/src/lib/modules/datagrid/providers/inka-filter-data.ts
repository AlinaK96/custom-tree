import { InjectionToken } from '@angular/core';
import { FilterOperation } from '../model/filter-operation';

export const inkaFilterData = new InjectionToken('inkaFilterData');

export interface InkaFilterData<T> {
  data: T;
  operations: FilterOperation[];
}
