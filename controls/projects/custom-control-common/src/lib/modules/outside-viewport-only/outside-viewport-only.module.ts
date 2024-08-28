import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideViewportOnlyDirective } from './directives/outside-viewport-only/outside-viewport-only.directive';

@NgModule({
  declarations: [OutsideViewportOnlyDirective],
  exports: [OutsideViewportOnlyDirective],
  imports: [CommonModule],
})
export class OutsideViewportOnlyModule {}
