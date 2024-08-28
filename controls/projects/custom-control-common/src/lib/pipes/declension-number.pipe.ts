import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'declensionNumber',
})
export class DeclensionNumberPipe implements PipeTransform {
  /**
   * Численное склонение (1 - контакт, 2- контакта, 200 - контактов)
   * @param value - необходимо передовать число (1 - 10 -20)
   * @param args - передаем массив числового склонения (['контакт', 'контакта', 'контактов'])
   */
  transform(value: number, args: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const word =
      args[
        value % 100 > 4 && value % 100 < 20
          ? 2
          : cases[value % 10 < 5 ? value % 10 : 5]
      ];

    return `${value} ${word}`;
  }
}
