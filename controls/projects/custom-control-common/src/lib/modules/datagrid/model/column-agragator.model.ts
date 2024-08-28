import { isNullOrUndefined } from '../../../utilities/checkers.util';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { DatagridFilter } from '../model/datagrid-filter';

export type SortOrder = 'asc' | 'desc';

export class ColumnAggregator<TColumnDataType = unknown> {
  columnName: string;
  columnType: ColumnDataTypesEnum;
  columnSortOrder?: SortOrder | 'none' = 'none';
  columnSortNumber?: number = null;
  columnFilterValue: DatagridFilter<TColumnDataType>;
  filterModifyCallback: (unknown) => unknown;

  isFilterEmpty() {
    const zero = 0;
    if (Array.isArray(this.columnFilterValue)) {
      return (this.columnFilterValue.value as []).length > zero;
    } else {
      return isNullOrUndefined(this.columnFilterValue.value);
    }
  }
}
