import { Component, forwardRef, Inject, ViewChild } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AbstractFilterComponent } from '../../../components/filters/abstract-filter/abstract-filter.component';
import { CommonRowFilterWrapperComponent } from '../../../components/filters/common-row-filter-wrapper/common-row-filter-wrapper.component';
import { DatagridFilterType } from '../../../providers/inka-data-type-operations';
import {
  InkaFilterData,
  inkaFilterData,
} from '../../../providers/inka-filter-data';

@Component({
  selector: 'inka-number-row-filter',
  templateUrl: './number-row-filter.component.html',
  styleUrls: ['./number-row-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberRowFilterComponent),
      multi: true,
    },
    {
      provide: AbstractFilterComponent,
      useExisting: forwardRef(() => NumberRowFilterComponent),
    },
  ],
})
export class NumberRowFilterComponent
  extends AbstractFilterComponent
  implements ControlValueAccessor
{
  filterOperationType = DatagridFilterType.Equals;

  change = null;
  touch = null;

  isFocused = false;

  value = 0;
  disabled = false;

  rangeControl = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  @ViewChild(CommonRowFilterWrapperComponent)
  wrapper: CommonRowFilterWrapperComponent;

  constructor(
    @Inject(inkaFilterData) public filterData: InkaFilterData<unknown>
  ) {
    super();
    this.rangeControl.valueChanges.subscribe((data) => {
      if (
        [DatagridFilterType.Between, DatagridFilterType.NotBetween].includes(
          this.filterOperationType
        )
      ) {
        this.control.setValue(data);
      } else {
        this.control.setValue(data.start);
      }
    });
  }

  registerOnChange(fn: unknown) {
    this.change = fn;
  }

  registerOnTouched(fn: () => {}) {
    this.touch = fn;
  }

  writeValue(obj: number) {
    this.value = obj;
    this.control.setValue(obj);
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  updateValue(insideValue: number) {
    this.value = insideValue;
  }

  changeFocus(isFocused) {
    this.wrapper.isFocused$.next(isFocused);
  }
}
