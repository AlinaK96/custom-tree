export interface OdataResponse<T> {
  '@odata.count': number;
  value: T;
}
