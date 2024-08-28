import {
  AfterViewInit,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import icSearch from '@iconify/icons-ic/twotone-search';
import { BehaviorSubject } from 'rxjs';
import { RowFilterControlDirective } from '../../../directives/row-filter-control/row-filter-control.directive';
import { FilterOperation } from '../../../model/filter-operation';

@Component({
  selector: 'inka-common-row-filter-wrapper',
  templateUrl: './common-row-filter-wrapper.component.html',
  styleUrls: ['./common-row-filter-wrapper.component.scss'],
})
export class CommonRowFilterWrapperComponent implements AfterViewInit {
  isOperationsOpened = false;
  selectionControl = new FormControl();

  @Input() operations: FilterOperation[] = [];
  @Input() displayOperationsButton = true;
  @Output() operationsChanged: EventEmitter<string> =
    new EventEmitter<string>();

  icons = {
    icSearch,
  };

  @ContentChild(RowFilterControlDirective) control!: RowFilterControlDirective;

  isFocused$ = new BehaviorSubject(false);

  setOpenOperationsPopup(isOpened: boolean) {
    this.isOperationsOpened = isOpened;
  }

  selectOperation() {
    this.operationsChanged.emit(this.selectionControl.value[0]);
    this.setOpenOperationsPopup(false);
  }

  ngAfterViewInit(): void {
    this.isFocused$ = this.control?.isFocused$;
  }
}
