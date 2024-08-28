export interface IMetadata {
  /**
   * Поле
   */
  Field: string;
  /**
   * Тип поля
   */
  Type: string;
}

export interface IFilterDescriptor {
  /**
   * Поле
   */
  Field?: string;

  /**
   * Оператор
   */
  Operator?: string;

  /**
   * Значение фильтра
   */
  Value?: unknown;

  /**
   * Вложенные фильтры
   */
  Filters?: IFilterDescriptor[];

  /**
   * Логическая операция
   */
  Logic?: 'and' | 'or';
}

export interface ISortingDescriptor {
  /**
   * Поле по которому сортируются данные
   */
  Field: string;

  /**
   * Направление сортировки
   */
  Direction: 'asc' | 'desc';
}

export interface IPaginationDescriptor {
  /**
   * Смещение в источнике данных
   */
  Offset: number;

  /**
   * Количество записей
   */
  Limit: number;
}

export interface IDataWithTotal<T> {
  /**
   * Набор записей
   */
  Items: T[];

  /**
   * Количество записей в источнике данных
   */
  Total: number;
}

export interface IDataSourseChangeDataEvent<T> {
  /**
   * Названеи источника данных
   */
  name: string;

  /**
   * Данные
   */
  data: IDataWithTotal<T>;
}