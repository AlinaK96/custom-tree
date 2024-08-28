/* eslint-disable */

import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  MatSortHeader,
  MatSortHeaderIntl,
  matSortAnimations,
} from '@angular/material/sort';
import { MultiSortDirective } from '../../directives/multi-sort/multi-sort.directive';
import { HeadingCellComponent } from '../heading-cell/heading-cell.component';

const descIcon = {
  body: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.64645 12.3536C7.84171 12.5488 8.15829 12.5488 8.35355 12.3536L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L8 11.2929L5.17157 8.46447C4.97631 8.2692 4.65973 8.2692 4.46447 8.46447C4.2692 8.65973 4.2692 8.97631 4.46447 9.17157L7.64645 12.3536ZM7.5 3L7.5 12H8.5V3H7.5Z" fill="#000000de"/>
</svg>
`,
  width: 24,
  height: 24,
};

const ascIcon = {
  body: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.35355 2.64645C8.15829 2.45118 7.84171 2.45118 7.64645 2.64645L4.46447 5.82843C4.2692 6.02369 4.2692 6.34027 4.46447 6.53553C4.65973 6.7308 4.97631 6.7308 5.17157 6.53553L8 3.70711L10.8284 6.53553C11.0237 6.7308 11.3403 6.7308 11.5355 6.53553C11.7308 6.34027 11.7308 6.02369 11.5355 5.82843L8.35355 2.64645ZM7.5 3L7.5 12H8.5V3H7.5Z" fill="#000000de"/>
</svg>
`,
  width: 24,
  height: 24,
};

const bothIcon = {
  body: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.35355 2.64645C8.15829 2.45118 7.84171 2.45118 7.64645 2.64645L4.46447 5.82843C4.2692 6.02369 4.2692 6.34027 4.46447 6.53553C4.65973 6.7308 4.97631 6.7308 5.17157 6.53553L8 3.70711L10.8284 6.53553C11.0237 6.7308 11.3403 6.7308 11.5355 6.53553C11.7308 6.34027 11.7308 6.02369 11.5355 5.82843L8.35355 2.64645ZM7.5 3L7.5 12H8.5V3H7.5Z" fill="#000000de"/>
<path d="M7.64645 12.3536C7.84171 12.5488 8.15829 12.5488 8.35355 12.3536L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L8 11.2929L5.17157 8.46447C4.97631 8.2692 4.65973 8.2692 4.46447 8.46447C4.2692 8.65973 4.2692 8.97631 4.46447 9.17157L7.64645 12.3536ZM7.5 3L7.5 12H8.5V3H7.5Z" fill="#000000de"/>
</svg>
`,
  width: 24,
  height: 24,
};

interface C2MatSortHeaderColumnDef {
  name: string;
}

@Component({
  selector: '[inka-ui-multi-sort-header]',
  templateUrl: './multi-sort-header.component.html',
  styleUrls: ['./multi-sort-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    matSortAnimations.indicator,
    matSortAnimations.leftPointer,
    matSortAnimations.rightPointer,
    matSortAnimations.arrowOpacity,
    matSortAnimations.arrowPosition,
    matSortAnimations.allowChildren,
  ],
})
export class MultiSortHeaderComponent extends MatSortHeader {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
  @ContentChild(HeadingCellComponent) headingCell: HeadingCellComponent;
  start = 'asc' as 'asc' | 'desc';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('mat-multi-sort-header') id: string;
  @Input() isColumnHeaderFiltered = false;
  private _disabled: boolean;

  @Input() set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.changeDetectorRef.detectChanges();
  }

  get disabled() {
    return this._disabled;
  }

  @Output() public openFilter = new EventEmitter<unknown>();

  contextMenuPosition = { x: '0px', y: '0px' };
  icons = {
    ascIcon,
    descIcon,
    bothIcon,
  };

  constructor(
    public _intl: MatSortHeaderIntl,
    public changeDetectorRef: ChangeDetectorRef,
    @Optional() public _sort: MultiSortDirective,
    @Inject('MAT_SORT_HEADER_COLUMN_DEF')
    @Optional()
    public _columnDef: C2MatSortHeaderColumnDef,
    focusMonitor: FocusMonitor,
    elementRef: ElementRef<HTMLElement>
  ) {
    super(
      _intl,
      changeDetectorRef,
      _sort,
      _columnDef,
      focusMonitor,
      elementRef
    );
  }

  @Input() public displayFilterIcon = false;

  @HostListener('longpress', ['true'])
  __setIndicatorHintVisible(visible: string | boolean) {
    super._setIndicatorHintVisible((visible as boolean) && this._isSorted());
  }

  _handleClick() {
    this._sort.direction = this.getSortDirection();
    super._handleClick();
  }

  _isSorted() {
    return (
      this._sort.actives.findIndex((activeId) => activeId === this.id) > -1
    );
  }

  _sortId() {
    return this._sort.actives?.length > 1
      ? this._sort.actives.findIndex((activeId) => activeId === this.id) + 1
      : '';
  }

  _updateArrowDirection() {
    this._arrowDirection = this.getSortDirection();
  }

  @HostBinding('attr.aria-sort')
  _getAriaSortAttribute() {
    if (!this._isSorted()) {
      return null;
    }

    return this.getSortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  _renderArrow() {
    return !this.disabled && this._isSorted();
  }

  getSortDirection(): 'asc' | 'desc' | '' {
    const i = this._sort.actives.findIndex(
      (activeIds) => activeIds === this.id
    );
    const direction = this._sort.directions[i];
    return this._isSorted() ? direction : this.start || this._sort.start;
  }

  isAsc() {
    return this.getSortDirection() === 'asc';
  }

  isDesc() {
    return this.getSortDirection() === 'desc';
  }

  displayMenu($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    this.contextMenuPosition.y = `${$event.clientY}px`;
    this.contextMenuPosition.x = `${$event.clientX}px`;
    this.matMenuTrigger.openMenu();
    return false;
  }

  sort(direction: 'asc' | 'desc' | '') {
    this._sort.programSort(this, direction);
    this._sort.emitSortingChanges();
  }

  toggleFilter($event: MouseEvent) {
    $event.stopPropagation();
    this.headingCell.open();
  }
}

/* eslint-enable */
