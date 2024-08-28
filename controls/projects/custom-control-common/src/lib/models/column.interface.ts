export interface Column {
  FieldName: string;
  Label: string;
  Type: ColumnType;
  Filterable: boolean;
  Sortable: boolean;
  Resizable?: boolean;
  Align: ColumnAlign;
  Format?: string;
  Sticky?: ColumnSticky;
  css?: string;
  Width?: string;
  MinWidth?: string;
  MaxWidth?: string;
}

export enum ColumnAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}

export enum ColumnType {
  Date = 'date',
  String = 'string',
  Number = 'number',
  Bool = 'bool'
}

export enum ColumnSticky {
  Left = 'Left',
  Right = 'Right',
  No = 'No'
}
