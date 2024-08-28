import { Directive, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Directive({
  selector: '[inkaRowFilterControl]',
})
export class RowFilterControlDirective {
  isFocused = false;
  isFocused$ = new BehaviorSubject<boolean>(false);

  @HostListener('blur') onBlur() {
    this.isFocused = false;
    this.isFocused$.next(false);
  }
  @HostListener('focus') onFocus() {
    this.isFocused = true;
    this.isFocused$.next(true);
  }
}
