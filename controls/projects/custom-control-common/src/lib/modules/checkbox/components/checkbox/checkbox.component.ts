import { ChangeDetectionStrategy, Component, forwardRef, OnInit, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { getUniqueId } from '../../../../utilities/components-helper';

// Данный компонент копирует необходимый функционал от базового компонента material checkbox
@Component({
  selector: 'inka-ui-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'mat-checkbox',
    '[id]': 'id',
    '[attr.tabindex]': 'null',
    '[class.mat-checkbox-indeterminate]': 'indeterminate',
    '[class.mat-checkbox-checked]': 'checked',
    '[class.mat-checkbox-disabled]': 'disabled',
    '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disableRipple', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent extends MatCheckbox {
  id = getUniqueId('mat-checkbox');
}
