import { InjectionToken, Type } from '@angular/core';
import { DateTimePickerComponent } from '../components/filters/date-time-picker/date-time-picker/date-time-picker.component';
import { RowFilterComponent } from '../components/filters/row-filter/row-filter.component';
import { ColumnDataType } from '../enums/column-data-type.enum';

export const dataTypeFilterComponentsConfig = new InjectionToken(
  'dataTypeFilterComponentsConfig',
  {
    factory: () => ({
      [ColumnDataType.String]: RowFilterComponent as Type<unknown>,
      [ColumnDataType.Date]: DateTimePickerComponent,
      [ColumnDataType.DateTime]: DateTimePickerComponent,
    }),
  }
);
export type DataTypeFilterComponentsConfig = {
  [key in ColumnDataType]: Type<unknown>;
};
