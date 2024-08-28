import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  interval,
  merge,
  of,
} from 'rxjs';
import { delayWhen, filter, first, switchMap } from 'rxjs/operators';
import { WebComponentDatasource } from '../../classes/datasource';
import { IDataWithTotal, IEventpayload, IMetadata } from '../../models';

@Directive()
export abstract class BaseWebComponentt implements AfterViewInit {
  private _disabled = false;
  readonly valueDatasource: WebComponentDatasource<unknown>;
  readonly dataSourceField$ = new BehaviorSubject<string>('');
  protected readonly initValue$ = new Subject();

  @Input()
  set disabled(disabled: boolean) {
    const currentDisabled = this.getDisabled();

    if (currentDisabled !== disabled) {
      this._sendDisabledEvents(disabled);
    }

    this.setDisabled(disabled);
  }

  get disabled(): boolean {
    return this.getDisabled();
  }

  get dataSourceField(): string {
    return this.dataSourceField$.getValue();
  }

  set dataSourceField(labelField: string) {
    this.dataSourceField$.next(labelField);
  }

  set valueDataSource(dataSource: IControlValueDatasource) {
    if (dataSource && dataSource.DataSourceName && dataSource.DataSourceField) {
      this.valueDatasource.subscribe(dataSource.DataSourceName);
      this.dataSourceField = dataSource.DataSourceField;
    }
  }

  constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
    this.valueDatasource = new WebComponentDatasource<unknown>(
      this.elementRef.nativeElement,
      this.renderer
    );
  }

  ngAfterViewInit() {
    this.valueDatasource.data$
      .pipe(
        delayWhen(() => merge(this.initValue$, interval(1000)).pipe(first())),
        filter((data) => this.filterDataSorceData(data)),
        switchMap((data) =>
          combineLatest([of(data?.Items || []), this.dataSourceField$])
        )
      )
      .subscribe(([items, dataSourceField]) => {
        const data = items[0];
        if (data && dataSourceField) {
          this.setValueFromDatasource(data[dataSourceField]);
        }
      });

    this.valueDatasource.metadata$.subscribe((metadata) => {
      this.getMetadataPayloadEvents().forEach((event) => {
        this.setEventPayload(
          event,
          this.convertMetadataToEventPayload(metadata)
        );
      });
    });
  }

  protected emit<T>(
    event: string,
    payload?: T,
    bubbles = false,
    composed = false
  ) {
    this.dispatchEvent('sendEvent', { event, payload }, bubbles, composed);
  }

  protected setValue<T>(value: T | null) {
    this.dispatchEvent('valueChange', value);
    this.emit('Change', value);
  }

  protected setEventPayload(event: string, payload: IEventpayload) {
    this.dispatchEvent('setPayload', { event, payload });
  }

  protected dispatchEvent<T>(
    event: string,
    payload?: T,
    bubbles = false,
    composed = false
  ) {
    const options = {
      detail: payload,
      bubbles,
      composed,
    };
    this.elementRef.nativeElement.dispatchEvent(
      new CustomEvent(event, options)
    );
  }

  protected setDisabled(disabled: boolean) {
    this._disabled = disabled;
  }

  protected getDisabled(): boolean {
    return this._disabled;
  }

  private _sendDisabledEvents(disabled: boolean) {
    if (disabled) {
      this.dispatchEvent('Disable');
    } else {
      this.dispatchEvent('Enable');
    }
  }

  protected filterDataSorceData<D>(
    items: IDataWithTotal<D> | undefined
  ): items is IDataWithTotal<D> {
    return !!items;
  }

  protected getMetadataPayloadEvents() {
    return ['Select', 'SelectRow', 'DataLoaded'];
  }

  // eslint-disable-next-line no-unused-vars
  protected setValueFromDatasource(value) {}

  protected convertMetadataToEventPayload(
    metadata: IMetadata[]
  ): IEventpayload {
    return {
      Type: 'array',
      Fields: [
        {
          Name: '0',
          Type: 'object',
          Fields: metadata.map((item) => ({
            Name: item.Field,
            Type: item.Type,
          })),
        },
      ],
    };
  }
}

export interface IControlValueDatasource {
  DataSourceName: string;
  DataSourceField: string;
}
