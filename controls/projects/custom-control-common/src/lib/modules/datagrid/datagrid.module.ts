import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule,
} from '@mat-datetimepicker/core';
import { IconModule } from '@visurel/iconify-angular';
import { TextBooleanFormatterPipe } from '../../pipes/boolean.pipe';
import { SimpleTextFormatterPipe } from '../../pipes/simple-text-formatter.pipe';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { InkaPaginatorModule } from '../inka-paginator/inka-paginator.module';
import { OutsideViewportOnlyModule } from '../outside-viewport-only/outside-viewport-only.module';
import { AbstractCellComponent } from './components/cells/abstract-cell/abstract-cell.component';
import { BooleanCellComponent } from './components/cells/boolean-cell/boolean-cell.component';
import { CellHubComponent } from './components/cells/cell-hub/cell-hub.component';
import { DateCellComponent } from './components/cells/date-cell/date-cell.component';
import { NumberCellComponent } from './components/cells/number-cell/number-cell.component';
import { StringCellComponent } from './components/cells/string-cell/string-cell.component';
import { DatagridComponent } from './components/datagrid/datagrid.component';
import { AbstractFilterComponent } from './components/filters/abstract-filter/abstract-filter.component';
import { BooleanRowFilterComponent } from './components/filters/boolean-row-filter/boolean-row-filter.component';
import { CommonRowFilterWrapperComponent } from './components/filters/common-row-filter-wrapper/common-row-filter-wrapper.component';
import { DateTimePickerComponent } from './components/filters/date-time-picker/date-time-picker.component';
import { NumberRowFilterComponent } from './components/filters/number-row-filter/number-row-filter.component';
import { RowFilterComponent } from './components/filters/row-filter/row-filter.component';
import { HeadingCellComponent } from './components/heading-cell/heading-cell.component';
import { MultiSortHeaderComponent } from './components/multi-sort-header/multi-sort-header.component';
import { RowFilterCellComponent } from './components/row-filter-cell/row-filter-cell.component';
import { ColumnContentDirective } from './directives/column-content/column-content.directive';
import { ColumnDirective } from './directives/column.directive';
import { MultiSortDirective } from './directives/multi-sort/multi-sort.directive';
import { ResizableColumnDirective } from './directives/resizable-column.directive';
import { RowFilterControlDirective } from './directives/row-filter-control/row-filter-control.directive';
import { ColumnDataType } from './enums/column-data-type.enum';
import { UniqueIdPipe } from './pipes/unique-id.pipe';
import {
  inkaDataTypeFilterComponentsConfig,
  inkaDataTypeOperations,
} from './providers/inka-data-type-filter-components-config';
import {
  createModifiers,
  inkaDataTypeModifiers,
} from './providers/inka-data-type-modificators';
import {
  inkaDataTypeFilterComponentsData,
  operationsFactory,
} from './providers/inka-data-type-operations';

@NgModule({
  declarations: [
    DatagridComponent,
    ColumnDirective,
    ColumnContentDirective,
    MultiSortDirective,
    MultiSortHeaderComponent,
    HeadingCellComponent,
    RowFilterComponent,
    NumberRowFilterComponent,
    BooleanRowFilterComponent,
    DateTimePickerComponent,
    CommonRowFilterWrapperComponent,
    RowFilterControlDirective,
    RowFilterCellComponent,
    AbstractFilterComponent,
    ResizableColumnDirective,
    AbstractCellComponent,
    CellHubComponent,
    StringCellComponent,
    NumberCellComponent,
    DateCellComponent,
    BooleanCellComponent,
    UniqueIdPipe,
    SimpleTextFormatterPipe,
    TextBooleanFormatterPipe,
  ],
  imports: [
    CommonModule,
    IconModule,
    MatSortModule,
    ReactiveFormsModule,
    OverlayModule,
    OutsideViewportOnlyModule,
    InkaPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatDatetimepickerModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatNativeDatetimeModule,
    DragDropModule,
    CheckboxModule,
  ],
  providers: [
    MatDatepickerModule,
    {
      provide: inkaDataTypeFilterComponentsConfig,
      useValue: {
        [ColumnDataType.String]: RowFilterComponent as Type<unknown>,
        [ColumnDataType.Date]: DateTimePickerComponent as Type<unknown>,
        [ColumnDataType.DateTime]: DateTimePickerComponent as Type<unknown>,
        [ColumnDataType.Number]: NumberRowFilterComponent as Type<unknown>,
        [ColumnDataType.Boolean]: BooleanRowFilterComponent as Type<unknown>,
      },
    },
    {
      provide: inkaDataTypeFilterComponentsData,
      useValue: {
        [ColumnDataType.Boolean]: [
          { title: 'Все', value: null },
          { title: 'Да', value: true },
          { title: 'Нет', value: false },
        ],
      },
    },
    {
      provide: inkaDataTypeOperations,
      useValue: operationsFactory({}),
    },
    {
      provide: inkaDataTypeModifiers,
      useValue: createModifiers({}),
    },
  ],
  exports: [
    DatagridComponent,
    ColumnDirective,
    ColumnContentDirective,
    NumberRowFilterComponent,
    BooleanRowFilterComponent,
    DateTimePickerComponent,
    ResizableColumnDirective,
    CellHubComponent,
    MultiSortDirective,
    MultiSortHeaderComponent,
    HeadingCellComponent,
    RowFilterCellComponent,
  ],
})
export class DatagridModule {}
