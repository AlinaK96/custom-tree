import { AbstractControl } from "@angular/forms";
import { IHasError } from "./validation-errors-filter.pipe";

export class FormControlErrorChecker implements IHasError {
  constructor(private _control: AbstractControl) {}

  hasError(errorType: string): boolean {
    return !this._control.errors ? false : !!this._control.errors[errorType];
  }
}
