import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Renderer2,
  Self,
  SimpleChanges,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActionsManagerService } from './actions-manager.service';
import { CustomControlDatasourceManager } from './custom-control-datasource-manager';
import { DatasourceService } from './datasource/datasource.service';
import { IValaidationError } from './validation-error.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAtributes = Record<string, any>;
interface ISendEvent<T = unknown> {
  event: string;
  payload: T;
}

interface IControlEvent<T = unknown> {
  sender: string;
  event: string;
  payload: T;
}

@UntilDestroy()
@Component({
  selector: 'app-custom-control',
  template: '',
  styleUrls: [],
})
export class CustomControlComponent implements AfterViewInit, OnChanges, OnDestroy {
  private _element: HTMLElement | null = null;
  private _differ: KeyValueDiffer<string, unknown>;

  private _value$ = new BehaviorSubject<unknown>(undefined);
  private _disabled$ = new BehaviorSubject<boolean | undefined>(undefined);

  datasourceManager?: CustomControlDatasourceManager;

  @Input()
  name = 'self';

  @Input()
  tagName?: string;

  @Input()
  attributes: TAtributes = {};

  @Input()
  errors: IValaidationError[] = [];

  @Output()
  sendEvent = new EventEmitter<IControlEvent>();

  private _sendEventUnlisten = () => {};
  private _changeValueUnlisten = () => {};

  // eslint-disable-next-line no-unused-vars
  onChange = (value: unknown) => {};
  onTouched = () => {};

  constructor(
    differs: KeyValueDiffers,
    private _renderer: Renderer2,
    private _elRef: ElementRef,
    @Optional() @Self() readonly ngControl: NgControl,
    @Optional() private _actionsManager: ActionsManagerService,
    private _datasourceService: DatasourceService
  ) {
    this._differ = differs.find({}).create();

    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    if (this.tagName) {
      this._element = this._createElement(this.tagName, this.attributes);

      this.sendEvent.emit({
        event: 'Show',
        sender: this.name,
        payload: null
      });

      this._renderer.appendChild(this._elRef.nativeElement, this._element);

      this._value$
        .pipe(
          filter((value) => value !== undefined),
          untilDestroyed(this)
        )
        .subscribe((value) => {
          this._setAttribute(this._element, 'value', value);
        });

      this._disabled$
        .pipe(
          filter((value) => value !== undefined),
          untilDestroyed(this)
        )
        .subscribe((value) => {
          this._setAttribute(this._element, 'disabled', value);
        });

      this._actionsManager.action$
        .pipe(untilDestroyed(this))
        .subscribe((result) => {
          this.dispatchEvent(this._element, 'runAction', result);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._element && changes.attributes && !changes.attributes.isFirstChange()) {
      const attributesChange = this._differ.diff(changes.attributes.currentValue);
      if (attributesChange) {
        attributesChange.forEachRemovedItem((attribute) => {
          this._removeAttribute(this._element, attribute.key);
        });
        this._setAttributes(this._element, changes.attributes.currentValue);
      }
    }

    if (this._element && changes.errors) {
      const errors: IValaidationError[] = changes.errors.currentValue;
      this._setAttribute(this._element, 'errors', Array.isArray(errors) ? errors : []);
    }

  }

  ngOnDestroy() {
    if (this._element) {
      this._removeElement(this._element);
      this._element = null;
    }

    this.datasourceManager?.destroy();

    this.sendEvent.emit({
      event: 'Hide',
      sender: this.name,
      payload: null
    });
  }

  /**
   * Установка значения элемента
   *
   * @param value значение
   */
  writeValue(value: unknown) {
    this._value$.next(value);
  }

  /**
   * Регистрация Обработчика изменей значения
   *
   * @param fn обработчик
   */
  registerOnChange(fn: (value: unknown) => void) {
    this.onChange = fn;
  }

  /**
   * Регистрация обработчика Touched
   *
   * @param fn бработчик
   */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /**
   * Изменение доступности элемента
   *
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean) {
    this._disabled$.next(isDisabled);
  }

  /**
   * Создание элемента и установка обработчиков
   *
   * @param tagName тег
   * @param attributes атрибуты
   * @returns Элемент
   */
  private _createElement(tagName: string, attributes: TAtributes) {
    const element = this._renderer.createElement(tagName);

    this.datasourceManager = new CustomControlDatasourceManager(
      element,
      this._renderer,
      this._datasourceService
    );
    this._setAttributes(element, attributes);

    this._sendEventUnlisten = this._renderer.listen(element, 'sendEvent', (event: CustomEvent<ISendEvent>) => {
      this.sendEvent.emit({
        ...event.detail,
        sender: this.name,
      });
    });

    this._changeValueUnlisten = this._renderer.listen(element, 'valueChange', (event: CustomEvent<unknown>) => {
      this.onChange(event.detail);
    });

    return element;
  }

  /**
   * Удаление элемента
   *
   * @param element DOM элемент
   */
  private _removeElement(element: any) {
    this._sendEventUnlisten();
    this._changeValueUnlisten();
    this._renderer.removeChild(this._elRef.nativeElement, element);
  }

  /**
   * Установка атрибутов
   *
   * @param element DOM элемент
   * @param attributes атрибуты
   */
  private _setAttributes(element: any, attributes: TAtributes) {
    Object.keys(attributes).forEach((attribute) => {
      this._setAttribute(element, attribute, attributes[attribute]);
    });
  }

  /**
   * Установка атрибута
   *
   * @param element DOM элемент
   * @param attribute  имя атрибута
   * @param value  значение атрибута
   */
  private _setAttribute(element: any, attribute: string, value: unknown) {
    this._renderer.setProperty(element, attribute, value);
  }

  /**
   * Удаление атрибута
   *
   * @param element DOM элемент
   * @param name имя атрибута
   */
  private _removeAttribute(element: any, name: string) {
    this._renderer.removeAttribute(element, name);
  }

  protected dispatchEvent<T>(element: any, event: string, payload: T, bubbles = false, composed = false) {
    const options = {
      detail:  payload,
      bubbles,
      composed
    };
    element.dispatchEvent(
      new CustomEvent(event, options)
    );
  }
}
