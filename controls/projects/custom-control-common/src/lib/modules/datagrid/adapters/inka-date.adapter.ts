import { NativeDateAdapter } from '@angular/material/core';

const firstDayOfWeek = 1;

export class InkaDateAdapter extends NativeDateAdapter {
  getFirstDayOfWeek(): number {
    return firstDayOfWeek;
  }
}
