import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { IValaidationError } from '../models';

export class WebComponentErrorMatcher implements ErrorStateMatcher {
  /**
   * Match the state
   *
   * @param control - FormControl
   * @param form - FormGroupDirective
   * @returns - boolean
   */
  isErrorState(
    control: FormControl,
    form: FormGroupDirective | NgForm
  ): boolean {
    return (
      !!(control?.invalid && (control?.dirty || control?.touched)) ||
      (!!this._errors.length && (!!control?.dirty || !!control?.touched))
    );
  }
  private _errors: IValaidationError[] = [];

  setErrors(errors: IValaidationError[]) {
    this._errors = errors;
  }

  getErrors() {
    return this._errors;
  }
}
