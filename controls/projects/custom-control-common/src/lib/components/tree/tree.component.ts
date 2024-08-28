import { SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

type TTreeNode<T> = T & {
  level: number;
  parent?: TTreeNode<T>;
  children?: TTreeNode<T>[];
};
type TGetChildrenCallback<T> = (node: T) => Observable<T[]>;
type THasChildrenCallback<T> = (node: T) => boolean;
type TGetNodeText<T> = (node: T) => string;
type TGetNodeValue<T> = (node: T) => unknown;

const zero = 0;
const one = 1;

@Component({
  selector: 'inka-ui-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent<T> implements OnChanges {
  readonly selectedNodes = new SelectionModel<unknown>(true);

  @Input()
  selectable?: boolean;

  @Input()
  multiselect?: boolean;

  @Input()
  data: T[] = [];

  @Input()
  hasChildren?: THasChildrenCallback<T>;

  @Input()
  getChildren?: TGetChildrenCallback<T>;

  @Input()
  set selected(selected: unknown[]) {
    this.selectedNodes.select(...selected.filter((item) => !item));
  }

  @Output()
  selectedChange = new EventEmitter<unknown>();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  hasChild = (_index: number, node: T) => {
    return !!this.hasChildren ? this.hasChildren(node) : false;
  };

  /**
   * Получение потомков
   *
   * @param node
   * @returns
   */
  getChilds = (node: TTreeNode<T>) => {
    return !!this.getChildren
      ? this.getChildren(node).pipe(
          map((nodes) => {
            return nodes.map((item) => ({
              ...(item as TTreeNode<T>),
              level: node.level + one,
              parent: node,
            }));
          }),
          tap((nodes) => {
            node.children = nodes;
          })
        )
      : of([]);
  };

  /**
   * Получение уровень
   *
   * @param node
   * @returns
   */
  getLevel = (node: TTreeNode<T>) => node.level;

  @Input()
  getNodeText: TGetNodeText<T> = (node) => (node as IStringify).toString();

  @Input()
  getNodeValue: TGetNodeValue<T> = (node) => node;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  treeControl = new NestedTreeControl<TTreeNode<T>>(this.getChilds);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  dataSource = new MatTreeNestedDataSource<TTreeNode<T>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (Array.isArray(changes.data?.currentValue)) {
      this.dataSource.data = changes.data.currentValue.map((node) => ({
        ...node,
        level: 1,
      }));
    }
  }

  /**
   * Выбранный элемент
   *
   * @param node
   * @returns
   */
  isSelected(node: T): boolean {
    return this.selectedNodes.isSelected(this.getNodeValue(node));
  }

  /**
   * Получение потомков
   *
   * @param node
   * @returns
   */
  getDescendants(node: TTreeNode<T>): TTreeNode<T>[] {
    if (!Array.isArray(node.children)) {
      return [];
    }

    return node.children.concat(
      ...node.children.map((item) => this.getDescendants(item))
    );
  }

  /**
   * Выбор части потомков
   *
   * @param node
   * @returns
   */
  descendantsPartiallySelected(node: TTreeNode<T>): boolean {
    const descendants = this.getDescendants(node);
    const result = descendants.some((child) => this.isSelected(child));
    return result && !this._descendantsAllSelected(node);
  }

  /**
   * Переключите выбор листа списка. Проверьте всех родителей на изменения
   *
   * @param node
   */
  todoLeafItemSelectionToggle(node: TTreeNode<T>) {
    // Проверка на возможность выбора нескольких элементов
    if (!this.multiselect) {
      this.selectedNodes.clear();
    }

    this._setSelectionState(node, !this.isSelected(node));
    // Расскоментировать если потребуется выделять все жлементы родителя
    // this._checkAllParentsSelection(node);
    this.selectedChange.next(this.selectedNodes.selected);
  }

  /**
   * Изменение состояния соседних элементов узла
   */
  toggleSibling(node: TTreeNode<T>, nodes: TTreeNode<T>[]) {
    const childNodes = nodes
      .map((item) => {
        return this.getNodeValue(item);
      })
      .filter((code) => !this.isAll(code as string));
    if (this.isSelected(node)) {
      this.selectedNodes.select(...childNodes);
    } else {
      this.selectedNodes.deselect(...childNodes);
    }
  }

  /**
   * Проверка на код All
   *
   * @param value
   */
  isAll(value: string) {
    return value.startsWith('All.');
  }

  /**
   * Установить состояние выбора
   *
   * @param node
   * @param state
   */
  private _setSelectionState(node: TTreeNode<T>, state: boolean) {
    const value = this.getNodeValue(node);
    if (state) {
      this.selectedNodes.select(value);
    } else {
      this.selectedNodes.deselect(value);
    }

    // Расскоментировать если потребуется выделять все жлементы родителя
    // if (Array.isArray(node.children)) {
    //   node.children.forEach((item) => {
    //     this._setSelectionState(item, state);
    //   });
    // }
  }

  /**
   * Проверка выбора всех родителей
   *
   * @param node
   */
  private _checkAllParentsSelection(node: TTreeNode<T>): void {
    let parent: TTreeNode<T> | undefined = node.parent;
    while (parent) {
      this._checkRootNodeSelection(parent);
      parent = parent.parent;
    }
  }

  /**
   * Проверка выбора корнего узла
   *
   * @param node
   */
  private _checkRootNodeSelection(node: TTreeNode<T>) {
    const nodeSelected = this.isSelected(node);
    const descendants = this.getDescendants(node);
    const descAllSelected =
      descendants.length > zero &&
      descendants.every((child) => this.isSelected(child));

    const value = this.getNodeValue(node);
    if (nodeSelected && !descAllSelected) {
      this.selectedNodes.deselect(value);
    } else if (!nodeSelected && descAllSelected) {
      this.selectedNodes.select(value);
    }
  }

  /**
   * Отметить всех потомков
   *
   * @param node
   * @returns
   */
  private _descendantsAllSelected(node: TTreeNode<T>): boolean {
    const descendants = this.getDescendants(node);
    const descAllSelected =
      descendants.length > zero &&
      descendants.every((child) => this.isSelected(child));
    return descAllSelected;
  }
}

export interface IStringify {
  toString: () => string;
}

@NgModule({
  declarations: [TreeComponent],
  imports: [CommonModule, MatTreeModule, MatCheckboxModule, MatIconModule],
  exports: [TreeComponent],
  providers: [],
})
export class TreeModule {}
