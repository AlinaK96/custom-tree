import { Component, Input } from '@angular/core';

@Component({
  selector: 'inka-ui-abstract-cell',
  templateUrl: './abstract-cell.component.html',
  styleUrls: ['./abstract-cell.component.scss'],
})
export class AbstractCellComponent<TType = unknown> {
  @Input() formatString: string;
  @Input() value: TType;
}
