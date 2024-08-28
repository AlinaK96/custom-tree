import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDataWithTotal, IValaidationError } from '../../models';

import { WebComponentErrorMatcher } from '../../classes/wec-сomponent-error.matcher';
import { debounce } from '../../decorators';
import {
  BaseWebComponentt,
  IControlValueDatasource,
} from './base-web-componentt';

@UntilDestroy()
@Directive()
export abstract class BaseFormControlWebComponent<
    T,
    F extends AbstractControl = FormControl
  >
  extends BaseWebComponentt
  implements AfterViewInit
{
  readonly control = this.createForm();
  readonly matcher = new WebComponentErrorMatcher();

  protected debounce = true;

  @Input()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Label = 'Label';

  @Input()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Placeholder = '';

  @Input()
  set errors(errors: IValaidationError[]) {
    this.matcher.setErrors(errors);
  }

  get errors(): IValaidationError[] {
    return this.matcher.getErrors();
  }

  @Input()
  set value(value: T | null) {
    this._changeValue$.next({
      value,
      patchValue: true,
      patchWithEvent: true,
      emitEvent: false,
    });
    this.initValue$.next();
  }

  @Input()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  set DataSource(dataSource: IControlValueDatasource) {
    this.valueDataSource = dataSource;
  }

  private readonly _changeValue$ = new BehaviorSubject<
    | {
        value: unknown;
        patchValue: boolean;
        patchWithEvent: boolean;
        emitEvent: boolean;
      }
    | undefined
  >(undefined);

  constructor(elementRef: ElementRef, renderer: Renderer2) {
    super(elementRef, renderer);

    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this._changeValue$.next({
        value,
        patchValue: false,
        patchWithEvent: false,
        emitEvent: true,
      });
    });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this._changeValue$
      .pipe(
        filter((value) => value !== undefined),
        untilDestroyed(this)
      )
      .subscribe((value) => {
        Promise.resolve(null).then(() => {
          if (value.patchValue) {
            this.control.patchValue(value.value);
          }

          if (value.emitEvent) {
            this.emitEvent(value.value);
          }
        });
      });
  }

  @debounce(1000)
  onChangeWithDebounce(value: T) {
    this.setValue(value);
  }

  onChange(value: T) {
    this.setValue(value);
  }

  protected createForm(): F {
    return new FormControl(null, this.getControlsValidators()) as unknown as F;
  }

  protected emitEvent(value) {
    if (this.control.valid) {
      if (this.debounce) {
        this.onChangeWithDebounce(value);
      } else {
        this.onChange(value);
      }
    }
  }

  protected setDisabled(disabled: boolean) {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  protected getDisabled(): boolean {
    return this.control.disabled;
  }

  protected getControlsValidators(): ValidatorFn[] {
    return [];
  }

  protected filterDataSorceData<D>(
    items: IDataWithTotal<D> | undefined
  ): items is IDataWithTotal<D> {
    return !!items;
  }

  protected setValueFromDatasource(value) {
    this._changeValue$.next({
      value,
      patchValue: true,
      patchWithEvent: true,
      emitEvent: true,
    });
  }
}
