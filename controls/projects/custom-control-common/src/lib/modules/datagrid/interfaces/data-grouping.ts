/**
 * Группировка строк по значению
 */
export interface ISpanGrouping {
  columnFields: string[];
  spanInfoArray: IRowSpanItem[];
}

/**
 * Схлопывание строк по значению
 */
export interface IRowSpanItem {
  columnField: string;
  index: number;
  count: number;
  indexes: number[];
}

/**
 * Группировка строк по цвету
 */
export interface IColorGrouping {
  columnFields: string[];
  indexes: number[];
}

/**
 * Группировка строк по цвету
 */
export interface IRowGrouping {
  columnFields: string[];
}
