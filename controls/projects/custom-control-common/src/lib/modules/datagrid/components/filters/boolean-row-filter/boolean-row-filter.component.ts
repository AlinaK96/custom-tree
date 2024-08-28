import { Component, forwardRef, Inject, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, startWith } from 'rxjs/operators';
import { AbstractFilterComponent } from '../../../components/filters/abstract-filter/abstract-filter.component';
import { BooleanFilterOption } from '../../../model/boolean-filter-option';
import { DatagridFilterType } from '../../../providers/inka-data-type-operations';
import {
  InkaFilterData,
  inkaFilterData,
} from '../../../providers/inka-filter-data';

@UntilDestroy()
@Component({
  selector: 'inka-boolean-row-filter',
  templateUrl: './boolean-row-filter.component.html',
  styleUrls: ['./boolean-row-filter.component.scss'],
  providers: [
    {
      provide: AbstractFilterComponent,
      useExisting: forwardRef(() => BooleanRowFilterComponent),
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanRowFilterComponent),
      multi: true,
    },
  ],
})
export class BooleanRowFilterComponent
  extends AbstractFilterComponent
  implements ControlValueAccessor
{
  icons = {
    icArrowDropDown,
  };
  componentType = BooleanRowFilterComponent;
  filterOperationType = DatagridFilterType.Equals;

  change = null;
  touch = null;

  control = new FormControl();
  isFocused = false;
  isOpened = false;

  controlValue$ = this.control.valueChanges.pipe(
    startWith([null]),
    map((value) =>
      value !== null
        ? this.filterData.data.find((x) => x.value === value[0])?.title
        : this.filterData.data.find((x) => x.value === null)?.title
    )
  );

  @Input() list: [] = [];
  @Input() selected!: boolean;
  @Input() multi = false;

  constructor(
    @Inject(inkaFilterData)
    public filterData: InkaFilterData<BooleanFilterOption[]>
  ) {
    super();
    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((data) => {
      this.setOpenStatus(false);
    });
  }

  propagateChange = (propagate: unknown) => {};

  registerOnChange(fn: unknown) {
    this.change = fn;
    this.propagateChange = this.change;
  }

  registerOnTouched(fn: unknown) {
    this.touch = fn;
  }

  writeValue(obj: { value: boolean }) {
    if (obj !== null && obj.value !== this.selected) {
      this.selected = obj.value;
      this.registerOnChange(this.selected);
    }
  }

  setOpenStatus(status: boolean) {
    this.isOpened = status;
  }

  modifyValue(value): unknown {
    return value ? value[0] : null;
  }
}
