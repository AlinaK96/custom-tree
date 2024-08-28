import { Component, OnInit } from '@angular/core';
import {AbstractCellComponent} from '../abstract-cell/abstract-cell.component';

@Component({
  selector: 'inka-ui-date-cell',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.scss']
})
export class DateCellComponent extends AbstractCellComponent<Date>{
}
