import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[inkaColumnContent]',
})
export class ColumnContentDirective {
  constructor(public template: TemplateRef<HTMLElement>) {}
}
