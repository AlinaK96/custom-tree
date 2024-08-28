import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, ViewChild } from '@angular/core';
import baselineFilterAlt from '@iconify/icons-ic/baseline-filter-alt';
import { HeaderFilterOption } from '../../model/header-filter-option';
import { DatagridFilterType } from '../../providers/inka-data-type-operations';

const defaultOffset = 40;

@Component({
  selector: 'inka-ui-heading-cell',
  templateUrl: './heading-cell.component.html',
  styleUrls: ['./heading-cell.component.scss'],
})
export class HeadingCellComponent {
  @Input() isFirst: boolean;
  @Input() displayCellPadding: boolean;
  @Input() headingFilterOptions: HeaderFilterOption[];
  @Input() allowHeaderFilter: boolean;
  @Input() columnName: string;
  @Input() currentFilterValue: unknown[];
  @Input() modifyFilterCallback: (unknown) => unknown;
  @Input() filterType: DatagridFilterType = DatagridFilterType.Includes;

  @ViewChild('trigger') trigger: ElementRef<HTMLElement>;
  @ViewChild('menuPanel') menuPanel: ElementRef<HTMLElement>;

  offsetY = defaultOffset;

  constructor(@Inject(DOCUMENT) private _document: Document) {}

  icons = {
    baselineFilterAlt,
  };
  isHeaderFilterOpened = false;
  positions = [
    new ConnectionPositionPair(
      { originX: 'center', originY: 'top' },
      { overlayX: 'center', overlayY: 'top' }
    ),
    new ConnectionPositionPair(
      { originX: 'start', originY: 'bottom' },
      { overlayX: 'start', overlayY: 'bottom' }
    ),
  ];

  /**
   * Handle filter icon click method
   * @param $event
   */
  handleHeaderFilter($event: MouseEvent) {
    $event.stopPropagation();
    this.isHeaderFilterOpened = true;
  }

  /**
   * Open filter overlay
   */
  open() {
    this.isHeaderFilterOpened = true;
  }

  /**
   * Close filterOverlay
   */
  close() {
    this.isHeaderFilterOpened = false;
  }
}
