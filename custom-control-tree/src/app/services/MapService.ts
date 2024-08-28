import {HttpClient} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {IconModel} from "../models/IconModel";
import {Observable, of} from "rxjs";


@Injectable({providedIn : "root"})
export class MapService {

  http : HttpClient;
  /**
   * Endpoint данных ТС
   */
  vehicleUrl : string = "";

  constructor(http:HttpClient){
    this.http = http;
    this.http.options('');
  }

  /**
   * Получение данных о ТС
   */
  getVehicles() : Observable<IconModel[]> {
      return this.http.get<IconModel[]>(this.vehicleUrl).pipe();
  }
}