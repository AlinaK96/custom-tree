import { AbstractControl, ControlValueAccessor, FormControl } from '@angular/forms';

export class InkaControlValueAccessor implements ControlValueAccessor {

  change;
  touch;

  control: AbstractControl = this.createControl();
  disabled = false;

  registerOnChange(fn: unknown): void {
    this.change = fn;
  }

  registerOnTouched(fn: unknown): void {
    this.touch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: unknown): void {
    this.control.setValue(obj);
  }

  setControl(control: AbstractControl) {
    this.control = control;
  }

  protected createControl(): AbstractControl {
    return new FormControl();
  }
}
