import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textBooleanFormatter',
})
export class TextBooleanFormatterPipe implements PipeTransform {
  /**
   * Русификация логического значения
   * @param value - логическое значение
   * @param args
   */
  transform(value?: any, args?: string[]): string {
    if (value == null) {
      return '';
    }
    if (value != null && typeof value == 'boolean') {
      return (value as boolean) ? 'Да' : 'Нет';
    }
  }
}
