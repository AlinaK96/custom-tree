import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injectable, Input, Renderer2, ViewChild } from '@angular/core';
import { BaseFormControlWebComponent, WebComponentDatasource } from 'custom-control-common';
import { MapService } from '../../services/MapService';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
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
  AggregateImageId: string | null;
  'GroupId.Id': number;
  "GroupId.Name": string;
  "GroupId.EnterpriseId": number;
  "GroupId.ParentId": number | null;
}

export interface TreeNode {
  id: number;
  type: string;
  name: string;
}

export interface ReturnModelItemGroup {
  type: 'group';
  id: number;
  ParentId: number | null; 
}

export interface ReturnModelItemType {
  type: 'type';
  id: number;
  GroupId: number; 
}

export type ReturnModelItem = ReturnModelItemGroup | ReturnModelItemType;

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'inka-ui-custom-tree',
  templateUrl: './custom-control.component.html',
  styleUrls: ['./custom-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapCustomControl extends BaseFormControlWebComponent<string> {
  

  itemsGroup: WebComponentDatasource<unknown>;
  itemsTypes: WebComponentDatasource<unknown>;

  httpClient:HttpClient

  @ViewChild('treeContainer') treeContainer: ElementRef | undefined;

  groups = []

  types = []
  
  tree: any[] = [];
  selectedId: number | null = null;
  returnModel: ReturnModelItem[] = [];

  constructor(elementRef: ElementRef, renderer: Renderer2, mapService: MapService, private http: HttpClient, private cdr: ChangeDetectorRef) {
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

    combineLatest([
      this.itemsGroup.data$,
      this.itemsTypes.data$
    ]).subscribe(([groupsData, typesData]) => {

      if (groupsData && typesData) {
        this.groups = groupsData.Items;
        this.types = typesData.Items;

        console.log(this.types)
        console.log(this.groups)

        this.buildTree();
        this.cdr.detectChanges();
      }
    });
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
  this.returnModel = [{ type: 'group', id: id, ParentId: group.ParentId }];
  this.emit("ClickItem", this.returnModel[0]);
  group.isExpanded = !group.isExpanded;
}

handleTypeClick(id: number) {
  const type = this.types.find(t => t.Id === id);
  if (type) {
    this.selectedId = id;
    this.returnModel = [{ type: 'type', id: id, GroupId: type.GroupId }];
    this.emit("ClickItem", this.returnModel[0]);
  }
}
  isSelected(id: number, type: 'group' | 'type'): boolean {
    return this.returnModel.some(item => item.type === type && item.id === id);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.treeContainer && !this.treeContainer.nativeElement.contains(event.target)) {
      this.clearSelection();
      this.emit('OutsideClick', this.returnModel[0])
    }
  }

  clearSelection() {
    this.selectedId = null;
    this.returnModel = [];
  }
  

}
