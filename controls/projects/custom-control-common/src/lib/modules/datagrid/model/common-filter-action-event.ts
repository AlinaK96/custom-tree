export interface CommonFilterActionEvent {
  type: CommonFilterActionEventTypes,
  payload?: unknown
}

export enum CommonFilterActionEventTypes {
  Close = 'CLOSE',
  Apply = 'APPLY'
}
