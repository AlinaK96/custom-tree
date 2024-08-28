import { AfterViewInit, Directive, ElementRef, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[inkaUiOutsideViewportOnly]',
})
export class OutsideViewportOnlyDirective implements OnInit, AfterViewInit {
  constructor(private _tooltip: MatTooltip, private _element: ElementRef<HTMLElement>) {}

  private _isElementInside() {
    const e = this._element.nativeElement;
    return e.scrollWidth <= e.clientWidth;
  }

  ngAfterViewInit(): void {
    if (this._tooltip) {
      this._tooltip.disabled = this._isElementInside();
    }
  }

  ngOnInit(): void {
    this._tooltip.tooltipClass = 'outside-viewport-only-content';
  }
}
