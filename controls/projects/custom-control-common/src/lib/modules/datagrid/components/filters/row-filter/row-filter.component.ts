import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import SearchIcon from '@iconify/icons-ic/twotone-search';
import { AbstractFilterComponent } from '../../../components/filters/abstract-filter/abstract-filter.component';
import { BooleanFilterOption } from '../../../model/boolean-filter-option';
import { DatagridFilterType } from '../../../providers/inka-data-type-operations';
import {
  InkaFilterData,
  inkaFilterData,
} from '../../../providers/inka-filter-data';

const limitLength = 1023;

@Component({
  selector: 'inka-row-filter',
  templateUrl: './row-filter.component.html',
  styleUrls: ['./row-filter.component.scss'],
})
export class RowFilterComponent extends AbstractFilterComponent {
  icons = {
    SearchIcon,
  };
  isFocused = false;
  filterOperationType = DatagridFilterType.Search;
  limitLength = limitLength;

  get controlData() {
    return this.control as FormControl;
  }

  changeFocus(isFocused) {
    this.isFocused = isFocused;
  }

  constructor(
    @Inject(inkaFilterData)
    public filterData: InkaFilterData<BooleanFilterOption[]>,
    private _cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.operations = this.filterData.operations;
    this._cdr.detectChanges();
  }

  protected createControl(): FormControl {
    return new FormControl();
  }

  modifyValue(value): unknown {
    return (value as string)?.trim().length > 0
      ? super.modifyValue(value)
      : null;
  }
}
