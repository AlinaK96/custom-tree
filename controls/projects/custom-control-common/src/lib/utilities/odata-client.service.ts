import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import buildQuery, { QueryOptions } from 'odata-query';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OdataResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OdataClientService {
  private _odataBaseUrl = '/odata/v1';

  constructor(private _httpClient: HttpClient) {}

  odataGet<T>(
    entity: string,
    queryOptions: Partial<QueryOptions<unknown>>,
    customUrl: string = null
  ): Observable<T[]> {
    const query = buildQuery(queryOptions);
    return this._httpClient
      .get<{ '@odata.context': string; value: T[] }>(
        `${customUrl ?? this._odataBaseUrl}/${entity}${query}`
      )
      .pipe(map((response) => response.value));
  }

  odataGetCount(
    entity: string,
    queryOptions: Partial<QueryOptions<unknown>>,
    customUrl: string = null
  ): Observable<number> {
    const query = buildQuery(queryOptions);
    return this._httpClient.get<number>(
      `${customUrl ?? this._odataBaseUrl}/${entity}/$count/${query}`
    );
  }

  odataGetFull<T>(
    entity: string,
    queryOptions: Partial<QueryOptions<unknown>>,
    customUrl: string = null
  ): Observable<OdataResponse<T>> {
    const query = buildQuery(queryOptions);
    return this._httpClient.get<OdataResponse<T>>(
      `${customUrl ?? this._odataBaseUrl}/${entity}${query}`
    );
  }
}
