import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Injectable, Input, Renderer2, ViewChild } from '@angular/core';
import { BaseFormControlWebComponent, WebComponentDatasource } from 'custom-control-common';
import { MapService } from '../../services/MapService';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface IItemsDatasourceSetting {
  ItemsDataSourceName: string;
}

export interface Group {
  Id: number;
  Name: string;
  EnterpriseId: number;
  ParentId: number | null;
}

export interface Type {
  Id: number;
  Name: string;
  EnterpriseId: number;
  GroupId: number;
}

export interface TreeNode {
  id: number;
  type: string;
  name: string;
}

interface ReturnModelItem {
  type: 'group' | 'type';
  id: number;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'inka-ui-custom-pmdl-my-example',
  templateUrl: './custom-control.component.html',
  styleUrls: ['./custom-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapCustomControl extends BaseFormControlWebComponent<string> {
  

  itemsGroup: WebComponentDatasource<unknown>;
  itemsTypes: WebComponentDatasource<unknown>;

  httpClient:HttpClient

  @ViewChild('treeContainer') treeContainer: ElementRef | undefined;

  groups: Group[] = [
    { "Id": 1, "Name": "string", "EnterpriseId": 0, "ParentId": null },
    { "Id": 2, "Name": "группа 1", "EnterpriseId": 0, "ParentId": null },
    { "Id": 3, "Name": "группа 1", "EnterpriseId": 0, "ParentId": null },
    { "Id": 7, "Name": "Группа №1", "EnterpriseId": 4, "ParentId": null },
    { "Id": 8, "Name": "Группа №2", "EnterpriseId": 4, "ParentId": 7 },
    { "Id": 9, "Name": "Группа №3", "EnterpriseId": 4, "ParentId": 8 },
    { "Id": 10, "Name": "Группа №4", "EnterpriseId": 4, "ParentId": 9 },
    { "Id": 11, "Name": "Группа №5", "EnterpriseId": 4, "ParentId": 10 },
  ];

  types: Type[] = [
    { "Id": 1, "Name": "string", "EnterpriseId": 4, "GroupId": 1 },
    { "Id": 2, "Name": "string", "EnterpriseId": 4, "GroupId": 2 },
    { "Id": 3, "Name": "string", "EnterpriseId": 4, "GroupId": 3 },
    { "Id": 4, "Name": "string", "EnterpriseId": 4, "GroupId": 3 },
    { "Id": 5, "Name": "string", "EnterpriseId": 4, "GroupId": 11 },
    { "Id": 6, "Name": "Test", "EnterpriseId": 4, "GroupId": 11 }
  ];
  
  tree: any[] = [];
  selectedId: number | null = null;
  returnModel: ReturnModelItem[] = [];

  constructor(elementRef: ElementRef, renderer: Renderer2, mapService: MapService, private http: HttpClient) {
    super(elementRef, renderer);
    this.httpClient = http
    this.itemsGroup = new WebComponentDatasource<unknown>(elementRef.nativeElement, renderer);
    this.itemsTypes = new WebComponentDatasource<unknown>(elementRef.nativeElement, renderer);
  }

  @Input()
  set ItemsGroup(itemsSetting: IItemsDatasourceSetting) {
    this.itemsGroup.subscribe(itemsSetting.ItemsDataSourceName);
  }

  @Input()
  set ItemsTypes(itemsSetting: IItemsDatasourceSetting) {
    this.itemsTypes.subscribe(itemsSetting.ItemsDataSourceName);
  }


  ngOnInit(): void {
    this.itemsGroup.data$.subscribe((value) => {
      if (value) {
        console.log(value.Items)
      }
    });

    this.itemsTypes.data$.subscribe((value) => {
      if (value) {
        console.log(value.Items)
      }
    });

    this.buildTree();

  }

  buildTree() {
    const groupMap = new Map<number, Group>();
    this.groups.forEach(group => groupMap.set(group.Id, group));

    this.tree = this.groups
      .filter(group => group.ParentId === null)
      .map(group => this.buildGroupTree(group, groupMap));

    this.attachTypesToGroups();
  }

  buildGroupTree(group: Group, groupMap: Map<number, Group>): any {
    return {
      ...group,
      children: this.groups
        .filter(child => child.ParentId === group.Id)
        .map(child => this.buildGroupTree(child, groupMap))
    };
  }

  attachTypesToGroups() {
    const groupMap = new Map<number, any>();
    this.flattenTree(this.tree).forEach(group => {
      groupMap.set(group.Id, group);
    });

    this.types.forEach(type => {
      const group = groupMap.get(type.GroupId);
      if (group) {
        if (!group.types) {
          group.types = [];
        }
        group.types.push(type);
      }
    });
  }

  flattenTree(tree: any[]): any[] {
    return tree.reduce((acc, node) => {
      const children = node.children ? this.flattenTree(node.children) : [];
      return acc.concat(node, children);
    }, []);
  }


  handleGroupClick(id: number, group: any) {
    this.selectedId = id;
    this.returnModel = [{ type: 'group', id: id }];
    this.emit("ClickItem", this.returnModel[0]);
    group.isExpanded = !group.isExpanded;
  }

  handleTypeClick(id: number) {
    this.selectedId = id;
    this.returnModel = [{ type: 'type', id: id }];
    this.emit("ClickItem", this.returnModel[0]);
  }

  isSelected(id: number, type: 'group' | 'type'): boolean {
    return this.returnModel.some(item => item.type === type && item.id === id);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.treeContainer && !this.treeContainer.nativeElement.contains(event.target)) {
      this.clearSelection();
    }
  }

  clearSelection() {
    this.selectedId = null;
    this.returnModel = [];
  }
  

}
