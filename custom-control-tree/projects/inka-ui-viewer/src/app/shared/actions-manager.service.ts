import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActionsManagerService {
  private action = new Subject<IAction>();

  get action$() {
    return this.action.asObservable();
  }

  constructor() { }

  runAction(data: IAction) {
    this.action.next(data);
  }
}

export interface IAction {
  name: string;
  params: Record<string, unknown>
}