import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import arrowBottom from '@iconify/icons-ic/twotone-keyboard-arrow-down';
import arrowRight from '@iconify/icons-ic/twotone-keyboard-arrow-right';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  delay,
  filter,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { isNullOrUndefined } from '../../../../utilities/checkers.util';
import { getUniqueId } from '../../../../utilities/components-helper';
import { ObjectHelper } from '../../../../utilities/object-helper';
import { PaginatorComponent } from '../../../inka-paginator/components/paginator/paginator.component';
import { InkaDatasource } from '../../datasources/inka.datasource';
import { ColumnDirective } from '../../directives/column.directive';
import { MultiSortDirective } from '../../directives/multi-sort/multi-sort.directive';
import { ColumnDataTypesEnum } from '../../enums/column-data-types.enum';
import {
  IColorGrouping,
  IRowGrouping,
  ISpanGrouping,
} from '../../interfaces/data-grouping';
import { SortOrder } from '../../model/column-agragator.model';
import { DatagridFilter } from '../../model/datagrid-filter';
import { DatagridItem } from '../../model/datagrid-item';
import { HeaderFilterOption } from '../../model/header-filter-option';
import { DatagridService } from '../../services/datagrid/datagrid.service';

@UntilDestroy()
@Component({
  selector: 'inka-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss'],
  providers: [DatagridService],
})
export class DatagridComponent implements AfterViewInit {
  rowsIds = { all: getUniqueId('mat-checkbox') };
  icons = {
    arrowRight,
    arrowBottom,
  };

  spanInfo: ISpanGrouping = {
    columnFields: [],
    spanInfoArray: [],
  };

  colorGroupInfo: IColorGrouping = {
    columnFields: [],
    indexes: [],
  };

  groupingInfo: IRowGrouping = {
    columnFields: [],
  };

  // Флаг группировки по значению
  isRowSpanGrouping = false;

  // Флаг группировки по цвету
  isRowColorGrouping = false;

  // Флаг группировки по заголовку
  isRowGrouping = false;

  private _selectable$ = new BehaviorSubject<boolean>(false);
  @Input() nested = false;

  dataGrid = null;

  displayFirstColumnPadding$ = of(false);

  // Отображение кодов в заголовке //TODO прокинуть как входной аргумент
  displayCodeFieldInHeaders = true;

  // Отображение статусной строки //TODO прокинуть как входной аргумент
  displayStatusRow = true;

  selected = new SelectionModel<string>();
  cols = [];

  @Input() key: string;
  @Input() parentKey: string;

  @Input() pageOptions = [5, 10, 20, 50];
  @Input() pageSize = 10;
  @Input() pagination = true;
  @Input() enableWordWrap = false;
  @Input() enableRowFilter = true;
  @Input() enableHeaderFilter = true;
  @Input() minColumnWidth: string;
  @Input() noDataText = 'Нет данных';
  @Input() stickyHeader = false;
  @Input() rowClassName: string;
  @Input() columnReordering = false;
  @Input() height: string;
  @Input() argColumns: string[];
  @Input() normalizedColumns: string[];

  @Input() set selectable(selectable: boolean) {
    this._selectable$.next(selectable);
  }

  get selectable() {
    return this._selectable$.getValue();
  }

  @Input() set multiple(isMultiple: boolean) {
    this.selected = new SelectionModel(isMultiple, this.selected.selected);
  }

  _dataSource$: BehaviorSubject<InkaDatasource<unknown>> = new BehaviorSubject<
    InkaDatasource<unknown>
  >(undefined);

  @Input() set dataSource(dataSource: InkaDatasource<unknown>) {
    this.datagridService.setDataSource(dataSource);
    this._dataSource$.next(dataSource);
    dataSource.getSorting().forEach((x) => {
      this.initialSort.push(x.columnName);
      this.initialSortDirections.push(
        x.order !== 'none' ? (x.order as SortDirection) : null
      );
    });
    this.selected.clear();
    this.isAllSelected = false;
    this.rowsSelected.emit(this.selected.selected.map((r) => JSON.parse(r)));
  }

  /**
   * Min count of pages in page size options array
   */
  get minCountPaginator() {
    return Math.min.apply(null, this.pageOptions);
  }

  get tableHeight() {
    return this.stickyHeader ? this._el.nativeElement.offsetHeight : null;
  }

  @Input() initialSort: string[] = [];
  @Input() initialSortDirections: SortDirection[] = [];

  @Output() rowClicked = new EventEmitter<DatagridItem<unknown>>();
  @Output() rowsSelected = new EventEmitter<DatagridItem<unknown>[]>();

  isAllSelected = false;
  selectAllCheckBoxOn = false;

  visibleColumns = [];
  visibleFilterColumns = [];
  visibleColumnsCount = 0;

  @ContentChildren(ColumnDirective, {})
  columns: QueryList<ColumnDirective>;
  columns$ = new BehaviorSubject<ColumnDirective[]>([]);
  sort$ = new BehaviorSubject<MultiSortDirective | undefined>(undefined);
  columnsItems$ = this.columns$.pipe(delay(0));

  @ViewChild(MultiSortDirective) set sort(sort: MultiSortDirective) {
    if (sort) {
      this.sort$.next(sort);
    }
  }

  @ViewChild(PaginatorComponent) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.datagridService.datasource.paginator = paginator;
    }
  }

  @Input() columnDrop = (
    event: CdkDragDrop<string[]>,
    visibleColumns: string[],
    visibleFilterColumns: string[]
  ) => {
    const currentIndex = this.selectable
      ? event.currentIndex + 1
      : event.currentIndex;
    const previousIndex = this.selectable
      ? event.previousIndex + 1
      : event.previousIndex;
    moveItemInArray(this.visibleColumns, previousIndex, currentIndex);
    moveItemInArray(this.visibleFilterColumns, previousIndex, currentIndex);
  };

  @Input() displayPaginationFn: (size: number) => boolean = (size: number) => {
    return size >= Math.min(...this.pageOptions);
  };

  @Input() rowClassCallback: (data: DatagridItem<unknown>) => object =
    () => ({});

  @Input() set rowSpanFields(rowSpanFieldsValue: string[]) {
    this.spanInfo.columnFields = rowSpanFieldsValue;
    if (this.spanInfo.columnFields.length > 0) {
      this.isRowSpanGrouping = true;
    }
  }

  @Input() set rowColorFields(rowColorFieldsValue: string[]) {
    this.colorGroupInfo.columnFields = rowColorFieldsValue;
    if (this.colorGroupInfo.columnFields.length > 0) {
      this.isRowColorGrouping = true;
    }
  }

  @Input() set rowGroupFields(rowGroupFieldsValue: string[]) {
    this.groupingInfo.columnFields = rowGroupFieldsValue;
    if (this.groupingInfo.columnFields.length > 0) {
      this.isRowGrouping = true;
    }
  }

  constructor(
    readonly datagridService: DatagridService<unknown>,
    private _cdr: ChangeDetectorRef,
    private _el: ElementRef,
    private _sanitizer: DomSanitizer
  ) {}

  // eslint-disable-next-line max-lines-per-function

  ngAfterViewInit(): void {
    combineLatest(
      this.datagridService.datasource.pageData$,
      this.selected.changed.pipe(delay(0))
    )
      .pipe(untilDestroyed(this))
      .subscribe(([pageData, data]) => {
        this.rowsIds = { all: getUniqueId('mat-checkbox') };
        this.isAllSelected = true;
        let isAllSelected = true;
        pageData.forEach((item) => {
          isAllSelected =
            isAllSelected &&
            data.source.selected.includes(JSON.stringify(item));
          this.rowsIds[item.id] = getUniqueId('mat-checkbox');
        });
        this.isAllSelected = isAllSelected;
      });
    const filterDebounce = 400;
    combineLatest([this.columns$, this._selectable$])
      .pipe(untilDestroyed(this), delay(0))
      .subscribe(([columns, selectable]) => {
        this.cols = [...columns];
        this.visibleColumns = columns?.map((column) => column.field);
        this.visibleFilterColumns = this.visibleColumns.map(
          (x) => `${x}_filter`
        );
        this.visibleColumnsCount = this.visibleColumns.length;

        if (selectable) {
          this.visibleColumns = ['checkbox', ...this.visibleColumns];
          this.visibleFilterColumns = [
            'checkbox_filter',
            ...this.visibleFilterColumns,
          ];
        }
      });

    this.columns.changes
      .pipe(startWith(this.columns?.toArray()), untilDestroyed(this), delay(0))
      .subscribe((columns) => {
        this.columns$.next(columns);
        columns.forEach((column) => {
          this.datagridService.datasource.setColumnType(
            column.field,
            column.dataType
          );
          this.datagridService.filters.addControl(
            column.field,
            new FormGroup({
              header: new FormControl(),
              row: new FormControl(),
            })
          );

          this.datagridService.filters.controls[column.field].valueChanges
            .pipe(debounceTime(filterDebounce))
            // eslint-disable-next-line max-nested-callbacks
            .subscribe((data) => {
              this.datagridService.setFilter(
                column.field,
                data.row ?? data.header
              );
            });

          if (!isNullOrUndefined(column.modifyHeaderFilterCallback)) {
            this.datagridService.datasource.setColumnFilterModifier(
              column.field,
              column.modifyHeaderFilterCallback
            );
          }
        });

        const filters = this.datagridService.datasource.getFilterValues();
        filters.forEach((x) => {
          this.datagridService.applyHeaderFilter(x.columnName, x.filterValue);
        });
      });

    const filters = this.datagridService.datasource.getFilterValues();
    filters.forEach((x) => {
      this.datagridService.applyHeaderFilter(x.columnName, x.filterValue);
    });

    this.sort$
      .pipe(
        filter((sort) => !!sort),
        switchMap((sort) => sort.sortingChanges),
        untilDestroyed(this),
        delay(0)
      )
      .subscribe((data) => {
        this.datagridService.datasource?.clearSorting();
        data.forEach((col) => {
          this.datagridService?.setSorting(
            col.active,
            col.direction as SortOrder
          );
        });
      });

    this._dataSource$.subscribe((datasource) => {
      datasource.pageData$.subscribe((pageData) => {
        if (pageData != null) {
          this.spanInfo.spanInfoArray = [];
          this.colorGroupInfo.indexes = [];

          if (this.isRowColorGrouping || this.isRowSpanGrouping) {
            this.fillGrouping(pageData);
          }
        }

        if (this.isRowGrouping) {
          let grouped = this.groupBy(this.groupingInfo.columnFields, pageData);
          pageData.splice(0, pageData.length);
          grouped.forEach((item) => pageData.push(item));
        }
      });
    });
  }

  getColumnFilterable(column: ColumnDirective) {
    return column?.allowFilter$.value;
  }

  /**
   * Toggle item in tree tables
   *
   * @param item
   */
  toggleItem(item: DatagridItem<unknown>) {
    this.datagridService.datasource.toggleTreeItem(item);
  }

  /**
   * Get current header filter value
   *
   * @param column
   */
  getCurrentFilterValue(column) {
    return (this.datagridService.filters.controls[column] as FormGroup)?.get(
      'header'
    )?.value;
  }

  /**
   * Apply header filter value for column name
   *
   * @param columnName
   * @param filterValue
   */
  applyHeaderFilterValue(columnName: string, filterValue) {
    this.datagridService.filters.patchValue({
      columnName: { heading: filterValue },
    });
  }

  /**
   * Check is null value of header filter for column
   *
   * @param field
   */
  hasColumnHeaderFilterValue(field: string) {
    const fieldValue = this.datagridService.filters?.value[field];
    if (fieldValue) {
      return fieldValue?.header?.value?.length > 0;
    }
    return false;
  }

  /**
   * Set value for row filter
   *
   * @param ctrl
   * @param filter
   */
  setRowFilter(ctrl: AbstractControl, filter: DatagridFilter<unknown>) {
    ctrl.setValue(filter);
  }

  /**
   * Get row filter for column
   *
   * @param columnName
   */
  getRowFilter(columnName: string) {
    let columnRowFilterCtrl = null;
    const columnFilter = this.datagridService.filters
      ? (this.datagridService.filters.controls[columnName] as FormGroup)
      : null;
    if (columnFilter) {
      columnRowFilterCtrl = columnFilter.get('row');
    }
    return columnRowFilterCtrl;
  }

  /**
   * Get option for header filter
   *
   * @param columnName
   */
  getHeaderOptions(columnName: string): Observable<HeaderFilterOption[]> {
    const column = this.columns.find((x) => x.field === columnName);
    const callbackFn = column?.headerFilterFormat ?? null;
    return this.datagridService.datasource.select([columnName]).pipe(
      map((items) => {
        return [...new Set(items.map((item) => item[columnName]))];
      }),
      map((options) =>
        options.map((option) => {
          return {
            name: callbackFn ? callbackFn(option) : option,
            value: option,
          } as HeaderFilterOption;
        })
      )
    );
  }

  /**
   * Handle click on row
   *
   * @param row - data item for clicked row
   */
  clickRow(row: DatagridItem<unknown>) {
    this.rowClicked.emit(row);
  }

  isSelected(row: DatagridItem<unknown>) {
    return this.selected.isSelected(JSON.stringify(row));
  }

  select(row: DatagridItem<unknown>) {
    this.selected.toggle(JSON.stringify(row));
    this.rowsSelected.emit(this.selected.selected.map((x) => JSON.parse(x)));
    this.isAllSelected = this.datagridService.datasource.pageData$.value.every(
      (item) => this.selected.selected.includes(JSON.stringify(item))
    );
    this.selectAllCheckBoxOn = this.selected.selected.length != 0;
  }

  handleResize(width: number, column: ColumnDirective) {
    column.width = `${width}px`;
  }

  // isAllSelected() {
  //   return this.selected.selected.length >= this.datagridService.datasource.size$.value;
  // }

  toggleAll(selectAll: boolean) {
    if (!this.isAllSelected || selectAll) {
      this.datagridService.datasource.pageData$.value
        .filter((x) => !this.isSelected(x))
        .forEach((x) => {
          this.selected.toggle(JSON.stringify(x));
        });
    } else {
      this.selected.clear();
    }
    this.rowsSelected.emit(this.selected.selected.map((r) => JSON.parse(r)));
  }

  handleColumnDrop(event: CdkDragDrop<string[]>) {
    this.columnDrop(event, this.visibleColumns, this.visibleFilterColumns);
  }

  columnTrackBy = (_: number, column: ColumnDirective) => {
    return column.field;
  };

  trackByFilter(_: number, column: ColumnDirective) {
    return `${column.field}_filter`;
  }

  isArgField(code: string) {
    return this.argColumns.includes(code);
  }

  getRowData(item: DatagridItem<unknown>, field: string) {
    //return this._sanitizer.sanitize(SecurityContext.HTML, item?.data ? ObjectHelper.getObjValue(item?.data as object, field) : null);
    return item?.data
      ? ObjectHelper.getObjValue(item?.data as object, field)
      : null;
  }

  getRowSpanCount(item: DatagridItem<unknown>, field: string): number {
    if (!this.isRowSpanGrouping) {
      return null;
    }

    if (item != null) {
      let span = this.spanInfo.spanInfoArray.find(
        (spanItem) =>
          spanItem.columnField == field && spanItem.index == item.data['index$']
      );
      if (span != null) {
        return span.count;
      }
    }
    return null;
  }

  getRowSpanDisplay(item: DatagridItem<unknown>, field: string): number {
    if (!this.isRowSpanGrouping) {
      return null;
    }

    if (item != null) {
      let span = this.spanInfo.spanInfoArray.find(
        (spanItem) =>
          spanItem.columnField == field &&
          spanItem.indexes.indexOf(item.data['index$']) > -1
      );
      if (span != null) {
        return span.count;
      }
    }
    return null;
  }

  getRowGroupColoring(item: DatagridItem<unknown>): boolean {
    if (!this.isRowColorGrouping) {
      return false;
    }

    if (item != null) {
      return this.colorGroupInfo.indexes.indexOf(item.data['index$']) > -1;
    }
    return false;
  }

  fillGrouping(data: DatagridItem<unknown>[]) {
    let prevItem = null;
    let coloring = false;
    for (let dataItem of data) {
      if (dataItem.data == null) {
        continue;
      }
      let item = dataItem.data;

      if (this.spanInfo.columnFields.length > 0) {
        this.spanInfo.columnFields.forEach((field) => {
          if (prevItem != null) {
            if (prevItem[field] != null && prevItem[field] == item[field]) {
              let spans = this.spanInfo.spanInfoArray.filter(
                (spanItem) => spanItem.columnField == field
              );
              if (spans.length > 0) {
                let span = spans[spans.length - 1];
                span.count++;
                span.indexes.push(item['index$']);
              } else {
                this.spanInfo.spanInfoArray.push({
                  columnField: field,
                  count: 2,
                  index: prevItem['index$'],
                  indexes: [item['index$']],
                });
              }
            } else {
              this.spanInfo.spanInfoArray.push({
                columnField: field,
                count: 1,
                index: item['index$'],
                indexes: [],
              });
            }
          }
        });
      }

      if (this.isRowColorGrouping) {
        if (prevItem != null) {
          let groupCheck = true;
          this.colorGroupInfo.columnFields.forEach((field) => {
            if (prevItem[field] != null && prevItem[field] != item[field]) {
              groupCheck = false;
            }
          });

          if (!groupCheck) {
            if (coloring) {
              coloring = false;
            } else {
              coloring = true;
            }
          }

          if (coloring) {
            this.colorGroupInfo.indexes.push(item['index$']);
          }
        }
      }

      prevItem = item;
    }

    this.spanInfo.spanInfoArray = this.spanInfo.spanInfoArray.filter(
      (item) => item.count > 1
    );
  }

  groupBy(columns: string[], data: DatagridItem<unknown>[]) {
    if (columns.length == 0) return data;
    let dataIndex: number = -1;
    const customReducer = (
      accumulator,
      currentValue: DatagridItem<unknown>
    ) => {
      let formatted = columns.map((field) =>
        this.formatValue(currentValue.data[field], field)
      );
      let filtered = formatted.filter((item) => item != null && item != '');
      let currentGroup = filtered.length > 0 ? formatted.join(', ') : 'NA';
      let groupArrayRow = Object.assign({}, currentValue.data as unknown[]);
      var keys = Object.keys(currentValue.data);
      keys.forEach((key) => (groupArrayRow[key] = `${currentGroup}`));
      if (!accumulator[currentGroup])
        accumulator[currentGroup] = [
          {
            dataIndex: (dataIndex--).toString(),
            data: groupArrayRow,
            children: null,
            hasChildren: false,
            hasFilteredChildren: false,
            id: null,
            isExpanded: false,
            isVisible: true,
            level: 0,
            parent: null,
            parentId: null,
            rowIndex: 0,
            isGroup: true,
          } as DatagridItem<unknown>,
        ];

      accumulator[currentGroup].push(currentValue);

      return accumulator;
    };
    let groups = data.reduce(customReducer, {});
    let groupArray = Object.keys(groups).map((key) => groups[key]);
    let flatList = groupArray.reduce((a, c) => {
      return a.concat(c);
    }, []);
    return flatList;
  }

  formatValue(value: any, field: string) {
    if (value == null || value === '') {
      return value;
    }
    let columns = this.columns$.getValue();
    let column = columns.find((item) => item.field == field);
    if (column) {
      switch (column.dataType) {
        case ColumnDataTypesEnum.Boolean:
          return (value as boolean) == true ? 'Да' : 'Нет';

        case ColumnDataTypesEnum.Date:
        case ColumnDataTypesEnum.DateTime:
          return moment(value).format(column.formatString.replace('dd', 'DD'));

        default:
          return value.toString();
      }
    }
    return value.toString();
  }

  getPageSelectedRowsCount(): number {
    return this.selected.selected.length;
  }

  getPageRowsCount(): number {
    return this._dataSource$.value.pageData$.value.filter(
      (item) => item.dataIndex.indexOf('-') == -1
    ).length;
  }

  getTotalRowsCount(): number {
    return this._dataSource$.value.size;
  }
}
