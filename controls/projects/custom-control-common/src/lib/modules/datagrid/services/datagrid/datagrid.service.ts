import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InkaDatasource } from '../../datasources/inka.datasource';
import { SortOrder } from '../../model/column-agragator.model';
import { DatagridFilter } from '../../model/datagrid-filter';
import { InkaPagination } from '../../model/inka-pagination.model';
import { InkaSort } from '../../model/inka-sort.model';
import { inkaDataTypeOperations } from '../../providers/inka-data-type-filter-components-config';
import {
  InkaDataTypeModifiers,
  inkaDataTypeModifiers,
} from '../../providers/inka-data-type-modificators';
import { DataTypeFilterOperations } from '../../providers/inka-data-type-operations';

@Injectable({
  providedIn: 'root',
})
export class DatagridService<T> {
  datasource: InkaDatasource<T>;
  sorting = new BehaviorSubject<InkaSort>(null);
  filters = new FormGroup({});

  setDataSource(dataSource: InkaDatasource<T>) {
    this.datasource = dataSource;
    this.datasource.operations = this._filterOperations;
    this.datasource.modifiers = this._modifiers;
  }

  constructor(
    @Inject(inkaDataTypeOperations)
    private _filterOperations: DataTypeFilterOperations,
    @Inject(inkaDataTypeModifiers) private _modifiers: InkaDataTypeModifiers
  ) {}

  setPagination(pagination: Partial<InkaPagination>) {
    this.datasource.setPagination({
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage,
    });
  }

  setFilter(columnName: string, filter: DatagridFilter<T>) {
    this.datasource.setFilter(columnName, filter);
    this.setPagination({
      currentPage: 0,
    });
  }

  setSorting(columnName: string, order: SortOrder, index: number = 1) {
    this.datasource.setSorting(columnName, order, index);
  }

  applyHeaderFilter(columnName: string, value: DatagridFilter<unknown>) {
    this.filters?.get(columnName)?.get('header')?.patchValue(value);
    this.setFilter(columnName, value as DatagridFilter<T>);
  }
}
