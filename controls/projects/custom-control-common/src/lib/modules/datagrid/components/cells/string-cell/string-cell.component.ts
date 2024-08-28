import { Component } from '@angular/core';
import { AbstractCellComponent } from '../abstract-cell/abstract-cell.component';

@Component({
  selector: 'inka-ui-string-cell',
  templateUrl: './string-cell.component.html',
  styleUrls: ['./string-cell.component.scss'],
})
export class StringCellComponent extends AbstractCellComponent {}
