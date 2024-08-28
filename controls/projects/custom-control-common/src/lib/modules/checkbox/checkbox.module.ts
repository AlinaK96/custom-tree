import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import {MatRippleModule} from "@angular/material/core";

@NgModule({
  declarations: [CheckboxComponent],
  imports: [CommonModule, MatRippleModule],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}
