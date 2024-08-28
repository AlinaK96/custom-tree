import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { isNullOrUndefined } from '../../../utilities/checkers.util';

@Directive({
  selector: '[inkaUiResizableColumn]',
})
export class ResizableColumnDirective implements OnInit {
  @Input('inkaUiResizableColumn') resizable: boolean;
  @Input() index: number;
  @Input() id: string;

  @Output() resized = new EventEmitter<number>();

  private _startX: number;
  private _startWidth: number;
  private _column: HTMLElement;
  private _table: HTMLElement;
  private _pressed: boolean;

  constructor(
    private _el: ElementRef<HTMLElement>,
    private _renderer: Renderer2
  ) {
    this._column = this._el.nativeElement;
  }

  ngOnInit(): void {
    if (this.resizable) {
      const row = this._renderer?.parentNode(this._column);
      const thead = this._renderer?.parentNode(row);
      this._table = this._renderer?.parentNode(thead);

      const resizer = this._renderer.createElement('span');
      this._renderer?.addClass(resizer, 'resize-holder');
      this._renderer?.appendChild(this._column, resizer);

      this._renderer?.listen(resizer, 'mousedown', this._onMouseDown);
      this._renderer?.listen(this._table, 'mousemove', this._onMouseMove);
      this._renderer?.listen('document', 'mouseup', this._onMouseUp);
    }
  }

  private _onMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    this._pressed = true;
    this._startX = event.pageX;
    this._startWidth = this._column.offsetWidth;
  };

  private _onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    const offset = 35;
    if (this._pressed && event.buttons) {
      this._renderer?.addClass(this._table, 'resizing');
      let zero = 0;
      let width = Math.max(
        this._startWidth + (event.pageX - this._startX - offset),
        zero
      );
      const cells = Array.from(this._table.querySelectorAll('.mat-row'))
        .map((row: HTMLElement) =>
          row.querySelectorAll('.mat-cell').item(this.index)
        )
        .filter((x) => !isNullOrUndefined(x));

      this._setColumnWidth(this._column, width);
      for (const cell of cells) {
        this._setColumnWidth(cell, width);
      }
      this.resized.emit(width);
    }
  };

  private _setColumnWidth(cell, width: number) {
    this._renderer.setStyle(cell, 'width', width);
  }

  private _onMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    if (this._pressed) {
      this._pressed = false;
      this._renderer?.removeClass(this._table, 'resizing');
    }
  };
}
