import { Component } from '@angular/core';
import { AbstractCellComponent } from '../abstract-cell/abstract-cell.component';

@Component({
  selector: 'inka-ui-number-cell',
  templateUrl: './number-cell.component.html',
  styleUrls: ['./number-cell.component.scss'],
})
export class NumberCellComponent extends AbstractCellComponent<number> {}
