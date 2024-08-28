import { Sort } from '@angular/material/sort';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';

export interface InkaSort {
  sort: Sort;
  columnType: ColumnDataTypesEnum;
}
