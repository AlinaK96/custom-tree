import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  Output,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ColumnDataTypesEnum } from '../../enums/column-data-types.enum';
import { DatagridFilter } from '../../model/datagrid-filter';
import { FilterOperation } from '../../model/filter-operation';
import { inkaFilterData } from '../../providers/inka-filter-data';
import { AbstractFilterComponent } from '../filters/abstract-filter/abstract-filter.component';

const zero = 0;

@UntilDestroy()
@Component({
  selector: 'inka-ui-row-filter-cell',
  templateUrl: './row-filter-cell.component.html',
  styleUrls: ['./row-filter-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RowFilterCellComponent),
      multi: true,
    },
  ],
})
export class RowFilterCellComponent implements AfterViewInit {
  @Input() filterComponent: Type<AbstractFilterComponent>;
  @Input() filterData: unknown;
  @Input() operations: FilterOperation[];
  @Input() columnType: ColumnDataTypesEnum;
  private _componentRef: ComponentRef<AbstractFilterComponent>;

  @Output() filterChanged: EventEmitter<DatagridFilter<unknown>> =
    new EventEmitter<DatagridFilter<unknown>>();

  constructor(
    private _vcr: ViewContainerRef,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector
  ) {}

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => this._render());
  }

  private _render() {
    this._vcr.clear();
    const injector = Injector.create({
      providers: [
        {
          provide: inkaFilterData,
          useValue: {
            data: this.filterData,
            operations: this.operations,
          },
        },
      ],
      parent: this._injector,
    });
    const factory = this._cfr.resolveComponentFactory<AbstractFilterComponent>(
      this.filterComponent
    );
    this._componentRef = this._vcr.createComponent<AbstractFilterComponent>(
      factory,
      zero,
      injector
    );
    this._componentRef.instance.operations = this.operations;
    this._componentRef.instance.columnType = this.columnType;
    this._componentRef.instance.control.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((filterValue) => {
        this.filterChanged.emit({
          type: this._componentRef.instance.filterOperationType,
          value: this._componentRef.instance.modifyValue(filterValue),
        });
      });
  }
}
