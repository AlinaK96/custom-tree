import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatSort, MatSortable, SortDirection } from '@angular/material/sort';

@Directive({
  selector: '[inkaUiMultiSort]',
})
export class MultiSortDirective extends MatSort implements OnInit {
  start = 'asc' as 'asc' | 'desc';

  @Input()
  actives: string[] = [];
  @Input()
  directions: SortDirection[] = [];

  @Output() public sortingChanges = new EventEmitter<
    { active: string; direction: string }[]
  >();

  private _shiftDown = false;

  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])
  keyDown(event: KeyboardEvent) {
    this._shiftDown = event.shiftKey;
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  sort(sortable: MatSortable): void {
    this.updateMultipleSorts(sortable);
    super.sort(sortable);
    this.emitSortingChanges();
  }

  programSort(sortable: MatSortable, direction: 'asc' | 'desc' | '') {
    this.updateMultipleSorts(sortable, direction);
    super.sort(sortable);
  }

  // eslint-disable-next-line complexity
  updateMultipleSorts(
    sortable: MatSortable,
    direct: SortDirection = null
  ): void {
    if (!this._shiftDown) {
      let direction = '';
      if (!direct && direct !== '') {
        direction = !this.actives.includes(sortable.id)
          ? 'asc'
          : this.getNextSortDirection(sortable);
      } else {
        direction = direct;
      }
      this.directions = !direction ? [] : ([direction] as SortDirection[]);
      this.actives = !direction ? [] : [sortable.id];
      return;
    }
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);

    if (this.isActive(sortable)) {
      if (
        this.activeDirection(sortable) ===
        (sortable.start ? sortable.start : this.start)
      ) {
        this.directions.splice(i, 1, this.getNextSortDirection(sortable));
      } else {
        this.actives.splice(i, 1);
        this.directions.splice(i, 1);
      }
    } else {
      this.actives.push(sortable.id);
      this.directions.push(sortable.start ? sortable.start : this.start);
    }
  }

  emitSortingChanges() {
    const sortData = [];
    for (let j = 0; j < this.actives.length; j++) {
      sortData.push({
        active: this.actives[j],
        direction: this.directions[j],
      });
    }
    this.sortingChanges.next(sortData);
  }

  isActive(sortable: MatSortable) {
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);
    return i > -1;
  }

  activeDirection(sortable: MatSortable): 'asc' | 'desc' {
    const i = this.actives.findIndex((activeId) => activeId === sortable.id);
    return this.directions[i] || (sortable.start ? sortable.start : this.start);
  }
}
