import { IValaidationError } from "./validation-error.interface";

export const errorsMessages: IValaidationError[] = [
  {
    name: 'required',
    message: `Обязательное поле`,
  },
  {
    name: 'min',
    message: `Ниже минимально допустимого значения`
  },
  {
    name: 'max',
    message: `Выше максимально допустимого значения`
  }
]
