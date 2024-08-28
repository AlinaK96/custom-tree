import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'simpleTextFormatter',
})
export class SimpleTextFormatterPipe implements PipeTransform {
  /**
   * замена переносов строк
   * @param value - строка с переносами строк через \ n
   * @param args
   */
  transform(value: any, args?: string[]): string {
    if (value != null && typeof value == 'string') {
      return (value as string).replace(/\n/g, '<br>');
    }
    return value;
  }
}
