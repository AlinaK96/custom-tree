import { MatPaginatorDefaultOptions } from '@angular/material/paginator';

export interface InkaPaginatorOptionInterface
  extends MatPaginatorDefaultOptions {
  visiblePagesCount: number;
}
