import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import {
  MAT_PAGINATOR_DEFAULT_OPTIONS,
  MatPaginatorIntl,
  _MatPaginatorBase,
} from '@angular/material/paginator';
import chevronLeft from '@iconify/icons-ic/twotone-chevron-left';
import chevronRight from '@iconify/icons-ic/twotone-chevron-right';
import { InkaPaginatorOptionInterface } from '../../interfaces/inka-paginator-option.interface';

const zero = 0;
const one = 1;
const two = 2;
const defaultМisiblePagesCount = 4;

@Component({
  selector: 'inka-ui-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent extends _MatPaginatorBase<InkaPaginatorOptionInterface> {
  visiblePagesCount: number;
  icons = {
    chevronLeft,
    chevronRight,
  };

  _totalLength = 0;
  _selectedCount = 0;
  _onPage = 0;

  get pages(): number[] {
    return Array.from(Array(this.getNumberOfPages()).keys());
  }

  get visiblePages(): number[] {
    let pages = [];
    const last = this.pages[this.pages.length - one];
    if (this.pages.length < this.visiblePagesCount) {
      pages = this.pages;
    } else {
      const halfVisiblePagesCount = Math.floor(this.visiblePagesCount / two);
      const firstValue = Math.max(this.pageIndex - halfVisiblePagesCount, zero);
      let pagesCount =
        this.pages.length === firstValue + this.visiblePagesCount
          ? this.visiblePagesCount + one
          : this.visiblePagesCount;
      if (firstValue !== zero) {
        pages.push(zero);
      }
      for (let i = 0; i <= pagesCount; i++) {
        const page = firstValue + i;
        pages.push(page);
        if (page + one === last) {
          break;
        }
      }
      pages.push(last);
    }
    return pages;
  }

  @Input() set totalLength(value: number) {
    this._totalLength = value;
  }

  @Input() set onPage(value: number) {
    this._onPage = value;
  }

  @Input() set selectedCount(value: number) {
    this._selectedCount = value;
  }

  constructor(
    intl: MatPaginatorIntl,
    cdr: ChangeDetectorRef,
    @Optional()
    @Inject(MAT_PAGINATOR_DEFAULT_OPTIONS)
    defaults: InkaPaginatorOptionInterface
  ) {
    super(intl, cdr, defaults);
    this.visiblePagesCount =
      defaults?.visiblePagesCount ?? defaultМisiblePagesCount;
  }

  changePageSize(pageSize: number) {
    this['_changePageSize'](pageSize);
  }

  changePage(page: number) {
    this.pageIndex = page;
    this['_emitPageEvent'](page);
  }

  displayDots(page: number) {
    return (
      Math.abs(page - this.pageIndex) >
      Math.floor(this.visiblePagesCount / two) + one
    );
  }
}
