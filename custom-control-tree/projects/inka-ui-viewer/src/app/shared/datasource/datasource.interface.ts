import { Observable } from 'rxjs';

export interface IUiConstructorDatasource<T> {
  readonly data$: Observable<IDataWithTotal<T>>;
  readonly metadata$: Observable<IMetadata<T>[]> // метаданные (информация о полях)

  /**
   * Перезагрузка данных источника данных
   */
  reload(): void;

  /**
   * Установка параметров фильтрации
   *
   * @param filterDiscriptor
   */
  setFilter(filterDiscriptor: IFilterDescriptor<T>): void;

  /**
   * Устоновка параметров пагинации
   *
   * @param sortingDiscriptor
   */
  setSorting(sortingDiscriptor: ISortingDescriptor<T>[]): void;

  /**
   * Установка параметров пагинации
   *
   * @param pagination
   */
  setPagination(paginationDiscriptor: IPaginationDescriptor): void;

  /**
   * Добавить записи в источник данных
   *
   * @param items добавляемые записи
   * @param clear очистка перед добавлением
   */
  addItems(items: T[], clear: boolean): void;

  /**
   * Обновить запись в источнике данных
   *
   * @param item обновляемая запись
   */
  update(item: T): void;

  /**
   * Удалить запись из источника данных
   *
   * @param item удаляемая запись
   */
   delete(item: T): void;
}

export interface IMetadata<T> {
  /**
   * Поле
   */
  Field: keyof T;
  /**
   * Тип поля
   */
  Type: string;
}

export interface IFilterDescriptor<T> {
  /**
   * Поле
   */
  Field?: keyof T;

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
  Filters?: IFilterDescriptor<T>[];

  /**
   * Логическая операция
   */
  Logic?: 'and' | 'or';
}

export interface ISortingDescriptor<T> {
  /**
   * Поле по которому сортируются данные
   */
  Field: T;

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
