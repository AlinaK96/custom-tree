import { Renderer2 } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, takeWhile } from "rxjs/operators";
import { IFilterDescriptor, IPaginationDescriptor, ISortingDescriptor, IUiConstructorDatasource } from "./datasource/datasource.interface";
import { DatasourceService } from "./datasource/datasource.service";

export class CustomControlDatasourceManager {
  private readonly ngUnsubscribe$ = new Subject<void>();
  private _subscriptionsCount: {[name: string]: number} = {};
  private _setFilterUnlisten = () => {};
  private _setSortingUnlisten = () => {};
  private _setPaginationUnlisten = () => {};
  private _setReloadUnlisten = () => {};
  private _setSubscribeUnlisten = () => {};
  private _setAdditemsUnlisten = () => {};
  private _setUpdateItemUnlisten = () => {};
  private _setDeleteItemUnlisten = () => {};
  private _setUnsubscribeUnlisten = () => {};

  constructor(
    private element: HTMLElement,
    private renderer: Renderer2,
    private _datasourceService: DatasourceService
  ) {
    this.setHandlers();
  }

  private setHandlers() {
    this._setRealoadHandler();
    this._setSubscribeHandler();
    this._setFilterHandler();
    this._setSortingHandler();
    this._setPaginationHandler();
    this._setAddItemsHandler();
    this._setUpdateItemHandler();
    this._setDeleteItemHandler();
    this._setUnsubscribeHandler();
  }

  private _setSubscribeHandler() {
    this._setSubscribeUnlisten = this.renderer.listen(
      this.element,
      'subscribeOnDataSource',
      (event: CustomEvent<ISubscribeWebComponentEventPayload>) => {
        const datasourceName = event.detail.datasource;
        const datasource = this._getDatasource(datasourceName);
        const subscriptionCount = this._subscriptionsCount[datasourceName];

        if (subscriptionCount) {
          this._subscriptionsCount[datasourceName]++;
          return;
        }

        if (event.detail.unsubscribe && this._subscriptionsCount[event.detail.unsubscribe]) {
          this._subscriptionsCount[event.detail.unsubscribe]--;
        }

        this._subscriptionsCount[datasourceName] = 1;
        datasource.data$
          .pipe(
            takeWhile(() => !!this._subscriptionsCount[datasourceName]),
            takeUntil(this.ngUnsubscribe$)
          )
          .subscribe(data => {
            this._dispatchEvent('changeDatasourceData', {name: datasourceName, data: data});
          });

        datasource.metadata$
          .pipe(
            takeWhile(() => !!this._subscriptionsCount[datasourceName]),
            takeUntil(this.ngUnsubscribe$)
          )
          .subscribe(data => {
            this._dispatchEvent('changeDatasourceMetadata', data);
          });
      },
    );
  }

  private _setUnsubscribeHandler() {
    this._setUnsubscribeUnlisten = this.renderer.listen(
      this.element,
      'subscribeOnDataSource',
      (event: CustomEvent<string>) => {
        if (this._subscriptionsCount[event.detail]) {
          this._subscriptionsCount[event.detail]--;
        }
      },
    );
  }

  private _setRealoadHandler() {
    this._setReloadUnlisten = this.renderer.listen(
      this.element,
      'reloadDataSourceData',
      (event: CustomEvent<string>) => {
        const datasource = this._getDatasource(event.detail);
        datasource.reload();
      },
    );
  }

  private _setFilterHandler() {
    this._setFilterUnlisten = this.renderer.listen(
      this.element,
      'setDatasourceFilter',
      (event: CustomEvent<IFilterWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.setFilter(event.detail.filter);
      },
    );
  }

  private _setSortingHandler() {
    this._setSortingUnlisten = this.renderer.listen(
      this.element,
      'setDataSourceSorting',
      (event: CustomEvent<ISortingWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.setSorting(event.detail.sorting);
      },
    );
  }

  private _setPaginationHandler() {
    this._setPaginationUnlisten = this.renderer.listen(
      this.element,
      'setDataSourcePagination',
      (event: CustomEvent<IPaginationWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.setPagination(event.detail.pagination);
      },
    );
  }

  private _setAddItemsHandler() {
    this._setAdditemsUnlisten = this.renderer.listen(
      this.element,
      'addDataSourceItems',
      (event: CustomEvent<IAddItemsWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.addItems(event.detail.items, event.detail.clear);
      },
    );
  }

  private _setUpdateItemHandler() {
    this._setUpdateItemUnlisten = this.renderer.listen(
      this.element,
      'updateDataSourceItem',
      (event: CustomEvent<IUpdateDeleteItemWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.update(event.detail.item);
      },
    );
  }

  private _setDeleteItemHandler() {
    this._setDeleteItemUnlisten = this.renderer.listen(
      this.element,
      'deleteDataSourceItem',
      (event: CustomEvent<IUpdateDeleteItemWebComponentEventPayload>) => {
        const datasource = this._getDatasource(event.detail.datasource);
        datasource.update(event.detail.item);
      },
    );
  }

  private removeHandlers() {
    this._setReloadUnlisten();
    this._setSubscribeUnlisten();
    this._setFilterUnlisten();
    this._setSortingUnlisten();
    this._setPaginationUnlisten();
    this._setAdditemsUnlisten();
    this._setUpdateItemUnlisten();
    this._setDeleteItemUnlisten();
    this._setUnsubscribeUnlisten();
  }

  destroy() {
    this.removeHandlers();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private _getDatasource(name: string): IUiConstructorDatasource<unknown> {
    const datasource = this._datasourceService.get(name);

    if (datasource) {
      return datasource;
    }

    throw new Error('Ivalid datasource');
  }

  private _dispatchEvent<T>(event: string, payload: T, bubbles = false, composed = false) {
    const options = {
      detail:  payload,
      bubbles,
      composed
    };
    this.element.dispatchEvent(
      new CustomEvent(event, options)
    );
  }
}

interface ISubscribeWebComponentEventPayload {
  datasource: string;
  unsubscribe?: string;
}

interface IFilterWebComponentEventPayload {
  datasource: string;
  filter: IFilterDescriptor<unknown>;
}

interface ISortingWebComponentEventPayload {
  datasource: string;
  sorting: ISortingDescriptor<unknown>[];
}

interface IPaginationWebComponentEventPayload {
  datasource: string;
  pagination: IPaginationDescriptor;
}

interface IAddItemsWebComponentEventPayload {
  datasource: string;
  items: unknown[];
  clear: boolean;
}

interface IUpdateDeleteItemWebComponentEventPayload {
  datasource: string;
  item: unknown;
}
