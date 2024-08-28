import { Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  IDataSourseChangeDataEvent,
  IDataWithTotal,
  IFilterDescriptor,
  IMetadata,
  IPaginationDescriptor,
  ISortingDescriptor,
} from '../models';

export class WebComponentDatasource<T> {
  private _data$ = new BehaviorSubject<IDataWithTotal<T> | undefined>(
    undefined
  );
  private _metadata$ = new BehaviorSubject<IMetadata[] | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private name?: string;
  data$ = this._data$;
  metadata$ = this._metadata$.pipe(filter((data) => !!data));

  private _changeDatasourceDataUnlisten = () => {};
  private _changeDatasourceMetadataUnlisten = () => {};

  constructor(
    private readonly _element: HTMLElement,
    private readonly _renderer: Renderer2
  ) {
    this._changeDatasourceDataUnlisten =
      this._setDatasourceChangeDataListener();
    this._changeDatasourceMetadataUnlisten =
      this._setDatasourceChangeMetadataListener();
  }

  subscribe(name: string) {
    if (this.name === name) {
      return;
    }

    const unsubscribe = this.name;
    this.name = name;
    this._dispatchEvent('subscribeOnDataSource', {
      datasource: this.name,
      unsubscribe,
    });
  }

  unsubscribe(name: string) {
    const unsubscribe = this.name;
    this.name = name;
    this._dispatchEvent('unsubscribeOnDataSource', this.name);
  }

  destroy() {
    this._changeDatasourceDataUnlisten();
    this._changeDatasourceMetadataUnlisten();
  }

  reloadData() {
    this._dispatchEvent('reloadDataSourceData', this.name);
  }

  setFilter(filterDescriptor: IFilterDescriptor) {
    this._dispatchEvent('setDatasourceFilter', {
      datasource: this.name,
      filter: filterDescriptor,
    });
  }

  setSorting(sortingDescriptor: ISortingDescriptor[]) {
    this._dispatchEvent('setDataSourceSorting', {
      datasource: this.name,
      sorting: sortingDescriptor,
    });
  }

  setPagination(paginationDescriptor: IPaginationDescriptor) {
    this._dispatchEvent('setDataSourcePagination', {
      datasource: this.name,
      pagination: paginationDescriptor,
    });
  }

  addItems(items: T[], clear = false) {
    this._dispatchEvent('addDataSourceItems', {
      datasource: this.name,
      items,
      clear,
    });
  }

  updateItem(item: T) {
    this._dispatchEvent('updateDataSourceItem', {
      datasource: this.name,
      item,
    });
  }

  deleteItem(item: T) {
    this._dispatchEvent('deleteDataSourceItem', {
      datasource: this.name,
      item,
    });
  }

  private _setDatasourceChangeDataListener() {
    return this._renderer.listen(
      this._element,
      'changeDatasourceData',
      (event: CustomEvent<IDataSourseChangeDataEvent<T>>) => {
        const { name, data } = event.detail;

        if (name === this.name) {
          this._data$.next(data);
        }
      }
    );
  }

  private _setDatasourceChangeMetadataListener() {
    return this._renderer.listen(
      this._element,
      'changeDatasourceMetadata',
      (event: CustomEvent<IMetadata[]>) => {
        this._metadata$.next(event.detail);
      }
    );
  }

  private _dispatchEvent<T>(
    event: string,
    payload: T,
    bubbles = false,
    composed = false
  ) {
    const options = {
      detail: payload,
      bubbles,
      composed,
    };
    this._element.dispatchEvent(new CustomEvent(event, options));
  }
}
