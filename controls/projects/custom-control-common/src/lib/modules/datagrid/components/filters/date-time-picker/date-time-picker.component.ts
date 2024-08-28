import { Overlay } from '@angular/cdk/overlay';
import {
  Component,
  forwardRef,
  Injector,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import {
  DateRange,
  DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import icCalendarToday from '@iconify/icons-ic/twotone-calendar-today';
import { MatDatetimepickerType } from '@mat-datetimepicker/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InkaDateAdapter } from '../../../adapters/inka-date.adapter';
import { ColumnDataTypesEnum } from '../../../enums/column-data-types.enum';
import { DatagridFilterType } from '../../../providers/inka-data-type-operations';
import { AbstractFilterComponent } from '../abstract-filter/abstract-filter.component';
import { CommonRowFilterWrapperComponent } from '../common-row-filter-wrapper/common-row-filter-wrapper.component';

@UntilDestroy()
@Component({
  selector: 'inka-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    },
    { provide: DateAdapter, useClass: InkaDateAdapter },
    {
      provide: AbstractFilterComponent,
      useExisting: forwardRef(() => DateTimePickerComponent),
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
})
export class DateTimePickerComponent extends AbstractFilterComponent {
  filterOperationType = DatagridFilterType.Between;
  componentType = DateTimePickerComponent;

  startDate = new FormControl();
  endDate = new FormControl();

  get type() {
    let type = 'date';
    if (this.columnType === ColumnDataTypesEnum.Date) {
      type = 'date';
    }
    if (this.columnType === ColumnDataTypesEnum.DateTime) {
      type = 'datetime';
    }
    return type as MatDatetimepickerType;
  }

  @Input() minDate: Date;
  @Input() maxDate: Date;

  @ViewChild(CommonRowFilterWrapperComponent)
  wrapper: CommonRowFilterWrapperComponent;

  selectedDateRange: DateRange<Date>;
  icons = {
    icCalendarToday,
  };
  isCalendarOpened = false;

  range$ = this.control.valueChanges;

  constructor(
    private _overlay: Overlay,
    private _vcr: ViewContainerRef,
    private _injector: Injector
  ) {
    super();
    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.selectedDateRange = null;
    });
  }

  setCalendarOpenStatus(status: boolean) {
    this.isCalendarOpened = status;
  }

  onSelectedChange(date: Date): void {
    if (
      this.selectedDateRange &&
      this.selectedDateRange.start &&
      date > this.selectedDateRange.start &&
      !this.selectedDateRange.end &&
      (this.filterOperationType === DatagridFilterType.Between ||
        this.filterOperationType === DatagridFilterType.NotBetween)
    ) {
      this.selectedDateRange = new DateRange(
        new Date(this.selectedDateRange.start),
        new Date(date)
      );
    } else {
      this.selectedDateRange = new DateRange(new Date(date), null);
    }
    this.accept();
  }

  accept() {
    if (this.startDate?.value && this.endDate?.value) {
      const start = this.startDate.value as Date;
      const end = this.endDate.value as Date;
      if (start.getTime() > end.getTime()) {
        this.startDate.setValue(end);
        this.endDate.setValue(start);
      }
    }
    this.control.setValue({
      start: this.startDate.value,
      end: this.endDate.value,
    });
    this.setCalendarOpenStatus(false);
  }

  cancel() {
    this.setCalendarOpenStatus(false);
  }

  changeOperation($event: string) {
    this.selectedDateRange = null;
    this.setOperation($event);
  }

  changeFocus(status) {
    this.wrapper.isFocused$.next(status);
  }

  modifyValue(date: DateRange<Date>) {
    if (this.type === 'date') {
      const zero = 0;
      if (date.start) {
        date.start.setHours(zero);
        date.start.setMinutes(zero);
        date.start.setSeconds(zero, zero);
      }

      if (date.end) {
        const maxHours = 23;
        const maxMinutes = 59;
        const maxSeconds = 59;
        date.end.setHours(maxHours);
        date.end.setMinutes(maxMinutes);
        date.end.setSeconds(maxSeconds, zero);
      }
    }

    return date;
  }
}
