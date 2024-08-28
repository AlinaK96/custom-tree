import { InjectionToken, Type } from '@angular/core';
import { AbstractCellComponent } from '../components/cells/abstract-cell/abstract-cell.component';
import { BooleanCellComponent } from '../components/cells/boolean-cell/boolean-cell.component';
import { DateCellComponent } from '../components/cells/date-cell/date-cell.component';
import { NumberCellComponent } from '../components/cells/number-cell/number-cell.component';
import { StringCellComponent } from '../components/cells/string-cell/string-cell.component';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';

export const inkaCellComponentsProvider = new InjectionToken(
  'inkaCellComponents',
  {
    factory: () => inkaCells,
  }
);

export type Cells = Record<ColumnDataTypesEnum, Type<AbstractCellComponent>>;

export const inkaCells = {
  [ColumnDataTypesEnum.String]: StringCellComponent,
  [ColumnDataTypesEnum.Number]: NumberCellComponent,
  [ColumnDataTypesEnum.Date]: DateCellComponent,
  [ColumnDataTypesEnum.DateTime]: DateCellComponent,
  [ColumnDataTypesEnum.Boolean]: BooleanCellComponent,
};
