import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Input,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { AbstractCellComponent } from '../abstract-cell/abstract-cell.component';

@Component({
  selector: 'inka-ui-cell-hub',
  templateUrl: './cell-hub.component.html',
  styleUrls: ['./cell-hub.component.scss'],
})
export class CellHubComponent implements AfterViewInit {
  @Input() cellComponent: Type<AbstractCellComponent>;
  @Input() formatString: string;
  @Input() value: unknown;

  private _componentRef: ComponentRef<AbstractCellComponent>;

  constructor(
    private _vcr: ViewContainerRef,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector
  ) {}

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => this._render());
  }

  private _render() {
    const zero = 0;
    this._vcr.clear();
    const injector = Injector.create({
      providers: [],
      parent: this._injector,
    });
    const factory = this._cfr.resolveComponentFactory<AbstractCellComponent>(
      this.cellComponent
    );
    this._componentRef = this._vcr.createComponent<AbstractCellComponent>(
      factory,
      zero,
      injector
    );
    this._componentRef.instance.formatString = this.formatString;
    this._componentRef.instance.value = this.value;
  }
}
