import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChild,
  ContentChildren,
  Directive,
  Inject,
  Input,
  NgZone,
  OnInit,
  QueryList,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AbstractFilterComponent } from '../components/filters/abstract-filter/abstract-filter.component';
import { ColumnAlignsEnum } from '../enums/column-aligns.enum';
import { ColumnDataTypesEnum } from '../enums/column-data-types.enum';
import { DatagridItem } from '../model/datagrid-item';
import { FilterOperation } from '../model/filter-operation';
import { HeaderFilterOption } from '../model/header-filter-option';
import {
  Cells,
  inkaCellComponentsProvider,
} from '../providers/inka-cell-components.provider';
import {
  DataTypeFilterComponentsConfig,
  inkaDataTypeFilterComponentsConfig,
  inkaDataTypeOperations,
} from '../providers/inka-data-type-filter-components-config';
import {
  DataTypeFilterOperations,
  DatagridFilterType,
  inkaDataTypeFilterComponentsData,
} from '../providers/inka-data-type-operations';
import { ColumnContentDirective } from './column-content/column-content.directive';

@UntilDestroy()
@Directive({
  selector: '[inkaColumn],inka-column',
})
export class ColumnDirective implements OnInit, AfterViewInit {
  allowSorting$ = new BehaviorSubject<boolean>(false);
  allowFilter$ = new BehaviorSubject<boolean>(false);

  sortingDisabled$ = this.allowSorting$.pipe(map((x) => !x));
  sorting$ = this.allowSorting$;

  allowFilterStatus = true;

  @Input() field: string;
  @Input() caption: string;
  @Input() dataType: ColumnDataTypesEnum = ColumnDataTypesEnum.String;
  @Input() width: string;
  @Input() minWidth: string;
  @Input() maxWidth: string;
  @Input() allowHeaderFilter = false;
  allowSortId: boolean;
  sortingDisabled: boolean;

  @Input() set allowFilter(allowFilter: boolean) {
    this.allowFilter$.next(allowFilter);
  }

  get allowFilter() {
    return this.allowFilterStatus;
  }

  @Input() set allowSort(allowSort: boolean) {
    this.allowSorting$.next(allowSort);
  }

  @Input() headerOptions: HeaderFilterOption[];
  @Input() align: ColumnAlignsEnum = ColumnAlignsEnum.Left;
  @Input() modifyHeaderFilterCallback: (unknown) => unknown;
  @Input() filterType: DatagridFilterType = DatagridFilterType.Includes;
  @Input() noTruncate = false;
  @Input() rowFilterData: unknown;
  @Input() headerFilterType?: DatagridFilterType;
  @Input() headerFilterFormat: (item: DatagridItem<unknown>) => string;
  @Input() formatString: string;
  @Input() sticky: 'No' | 'Left' | 'Right';
  @Input() className: string;
  @Input() resizable: boolean;

  @ContentChild(ColumnContentDirective)
  public contentTemplate: ColumnContentDirective;
  @ContentChildren(AbstractFilterComponent)
  filterComponents: QueryList<AbstractFilterComponent>;

  operations: FilterOperation[] = [];

  get filterComponent() {
    return (
      this.filterComponents.first?.componentType ||
      this._componentConfig[this.dataType]
    );
  }

  get cellComponent() {
    return this._cells[this.dataType];
  }

  getRowFilterData() {
    return this.rowFilterData || this._datas[this.dataType];
  }

  constructor(
    @Inject(inkaDataTypeFilterComponentsConfig)
    private _componentConfig: DataTypeFilterComponentsConfig,
    @Inject(inkaDataTypeFilterComponentsData)
    private _datas: Record<ColumnDataTypesEnum, unknown>,
    @Inject(inkaDataTypeOperations)
    private _operations: DataTypeFilterOperations,
    @Inject(inkaCellComponentsProvider) private _cells: Cells,
    private _cdr: ChangeDetectorRef,
    private _zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.sorting$.pipe(untilDestroyed(this)).subscribe((data) => {
      Promise.resolve(null).then(() => {
        this.sortingDisabled = !data;
        this._cdr.detectChanges();
      });
    });

    this.allowFilter$.pipe(untilDestroyed(this), delay(0)).subscribe((data) => {
      Promise.resolve(null).then(() => {
        this._zone.run(() => {
          this.allowFilterStatus = data;
        });
      });
    });
  }

  ngOnInit(): void {
    Object.keys(this._operations).forEach((item) => {
      if (this._operations[item].availableTypes.includes(this.dataType)) {
        this.operations.push(this._operations[item]);
      }
    });
  }

  getData() {
    return {
      allowSort: this.allowSorting$.getValue(),
      allowFilter: this.allowFilter$.getValue(),
      allowHeaderFilter: this.allowHeaderFilter,
      field: this.field,
      caption: this.caption,
      dataType: this.dataType,
      width: this.width,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      headerOptions: this.headerOptions,
      align: this.align,
      modifyHeaderFilterCallback: this.modifyHeaderFilterCallback,
      filterType: this.filterType,
      noTruncate: this.noTruncate,
      rowFilterData: this.rowFilterData,
      headerFilterType: this.headerFilterType,
      headerFilterFormat: this.headerFilterFormat,
      formatString: this.formatString,
      sticky: this.sticky,
      className: this.className,
      resizable: this.resizable,
      sortingDisabled: this.sortingDisabled,
      column: null,
    };
  }
}
