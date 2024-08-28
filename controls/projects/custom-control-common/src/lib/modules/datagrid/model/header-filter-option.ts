import { DatagridFilterType } from '../providers/inka-data-type-operations';

export class HeaderFilterOption {
  name: string;
  value: unknown;
  operationType?: DatagridFilterType;
}
