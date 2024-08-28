/* eslint-disable no-unreachable */
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';

export const compareNumber = (a: number, b: number) => a - b;
export const compareString = (a: string, b: string) => {
  if (a < b) return -1;
  if (b < a) return 1;
  return 0;
};
export const compareDate = (a: Date, b: Date) => a.getTime() - b.getTime();

export const compare = (
  a: unknown,
  b: unknown,
  type: ColumnDataTypesEnum,
  isAsc: boolean
) => {
  if (!isAsc) {
    let temp = a;
    a = b;
    b = temp;
  }

  switch (type) {
    case ColumnDataTypesEnum.String:
      return compareString(a as string, b as string);
    case ColumnDataTypesEnum.Number:
      return compareNumber(a as number, b as number);
    case ColumnDataTypesEnum.Date:
      return compareDate(a as Date, b as Date);
  }
};
