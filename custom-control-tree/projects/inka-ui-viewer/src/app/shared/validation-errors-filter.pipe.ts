import { Pipe, PipeTransform } from "@angular/core";
import { IValaidationError } from "./validation-error.interface";

@Pipe({
  name: 'validationErrorsFilter',
  pure: false,
})
export class ValidationErrorsFilterPipe implements PipeTransform {
  transform(errorMessages: IValaidationError[], errorChacker: IHasError): IValaidationError[] {
    return errorMessages.filter((errorMessage) => errorChacker.hasError(errorMessage.name));
  }
}

export interface IHasError {
  hasError(errorType: string): boolean;
}
