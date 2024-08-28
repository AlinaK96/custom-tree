import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@visurel/iconify-angular';

@NgModule({
  declarations: [PaginatorComponent],
  exports: [PaginatorComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule, IconModule],
})
export class InkaPaginatorModule {}
