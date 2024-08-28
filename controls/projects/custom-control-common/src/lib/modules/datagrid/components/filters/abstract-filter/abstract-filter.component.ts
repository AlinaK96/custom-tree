import { Component, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InkaControlValueAccessor } from '../../../../../classes/control-value-accessor';
import { ColumnDataTypesEnum } from '../../../enums/column-data-types.enum';
import { DatagridFilter } from '../../../model/datagrid-filter';
import { DatagridFilterType } from '../../../providers/inka-data-type-operations';

@Component({
  selector: 'inka-abstract-filter',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AbstractFilterComponent,
      multi: true,
    },
  ],
})
export class AbstractFilterComponent
  extends InkaControlValueAccessor
  implements OnInit, OnDestroy
{
  @Input() set operationType(operations) {
    if (operations) {
      this.filterOperationType = operations;
    }
  }

  operations = [];
  componentType!: Type<AbstractFilterComponent>;
  filterOperationType: DatagridFilterType = DatagridFilterType.Search;
  filterSubscription: Subscription;
  limitLength: number = null;
  columnType: ColumnDataTypesEnum;

  ngOnInit(): void {
    this.filterSubscription = this.control.valueChanges.subscribe((value) => {
      if (this.limitLength) {
        this.control.setValue(
          (value as string)?.substring(0, this.limitLength),
          { emitEvent: false }
        );
      }
      if (this.change) {
        this.change({
          type: this.filterOperationType,
          value: this.modifyValue(value),
        } as DatagridFilter<string>);
      }
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  writeValue(obj: unknown) {
    super.writeValue(obj);
  }

  modifyValue(value): unknown {
    return value;
  }

  setOperation(operation) {
    this.filterOperationType = operation;
    this.control.setValue(null);
  }
}
