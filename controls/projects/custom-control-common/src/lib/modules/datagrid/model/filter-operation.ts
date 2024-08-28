import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { DatagridFilterType } from '../providers/inka-data-type-operations';

export interface FilterOperation {
  operation: DatagridFilterType;
  name: string;
  function?: (item, filter) => boolean;
  availableTypes: ColumnDataTypesEnum[];
}
