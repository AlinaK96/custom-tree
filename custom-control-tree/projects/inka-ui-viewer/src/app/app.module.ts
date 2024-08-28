import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CustomControlComponent } from './shared/custom-control.component';
import { ValidationErrorsFilterPipe } from './shared/validation-errors-filter.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DatasourceService } from './shared/datasource/datasource.service';
import { NgxMatNumberInputSpinnerModule } from 'ngx-mat-number-input-spinner';

@NgModule({
  declarations: [AppComponent, CustomControlComponent, ValidationErrorsFilterPipe],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    NgxMatNumberInputSpinnerModule,
  ],
  providers: [
    DatasourceService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
