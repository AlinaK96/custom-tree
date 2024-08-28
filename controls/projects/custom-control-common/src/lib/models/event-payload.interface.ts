/**
 * Пейлоад генерируемого события типа элемента UI конструктора
 */
 export interface IEventpayload {
  /**
   * Тип пейлоада
   */
  Type: string;

  /**
   * Поля типа пейлоада
   */
  Fields?: IEventpayloadField[];
}

/**
 * Поле пейлоада генерируемого события типа элемента UI конструктора
 */
export interface IEventpayloadField extends IEventpayload {
  /**
   * Имя поля в пейлоаде генерируемого события типа элемента UI конструктора
   */
  Name: string;
}
