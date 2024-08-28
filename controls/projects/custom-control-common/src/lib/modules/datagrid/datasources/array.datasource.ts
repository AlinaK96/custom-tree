import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalDatasource } from '../datasources/local.datasource';
import { DatagridItem } from '../model/datagrid-item';

export class ArrayDatasource<T> extends LocalDatasource<T> {
  protected mapItems(items: DatagridItem<T>[]): Observable<DatagridItem<T>[]> {
    return super.mapItems(items).pipe(
      map((items1) =>
        items1.map((item, i) => {
          item.dataIndex = this.getItemDataIndex(i);
          return item;
        })
      )
    );
  }
}
