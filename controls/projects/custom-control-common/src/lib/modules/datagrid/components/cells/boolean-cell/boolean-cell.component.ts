import { Component } from '@angular/core';
import { AbstractCellComponent } from '../abstract-cell/abstract-cell.component';

@Component({
  selector: 'inka-ui-boolean-cell',
  templateUrl: './boolean-cell.component.html',
  styleUrls: ['./boolean-cell.component.scss'],
})
export class BooleanCellComponent extends AbstractCellComponent {}
