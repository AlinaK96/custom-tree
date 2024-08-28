import { Pipe, PipeTransform } from '@angular/core';
import { getUniqueId } from '../../../utilities/components-helper';

@Pipe({
  name: 'uniqueId',
})
export class UniqueIdPipe implements PipeTransform {
  transform(value: string): string {
    return getUniqueId(value);
  }
}
