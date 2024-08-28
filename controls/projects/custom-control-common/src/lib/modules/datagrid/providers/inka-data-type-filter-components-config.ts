import { InjectionToken, Type } from '@angular/core';
import { AbstractFilterComponent } from '../components/filters/abstract-filter/abstract-filter.component';
import { ColumnDataType } from '../enums/column-data-type.enum';

export const inkaDataTypeFilterComponentsConfig =
  new InjectionToken<DataTypeFilterComponentsConfig>(
    'dataTypeFilterComponentsConfig'
  );
export const inkaDataTypeOperations = new InjectionToken(
  'inkaDataTypeOperations'
);

export type DataTypeFilterComponentsConfig = {
  [key in ColumnDataType]: Type<AbstractFilterComponent>;
};
