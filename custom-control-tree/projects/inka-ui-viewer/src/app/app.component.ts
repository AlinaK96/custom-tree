import { AfterViewInit, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { ActionsManagerService } from './shared/actions-manager.service';
import { FormControlErrorChecker } from './shared/form-control-error-checker';
import { LazyLoadService } from './shared/lazy-load.service';
import { errorsMessages } from './shared/validation-error.constant';
import { DatasourceService } from './shared/datasource/datasource.service';
import {pointItems, polygonItems, vehicleItems} from "./mock/vehicle-datasource.mock";
import { LocalDatasource } from "./shared/datasource/local-datasource";
import { IUiConstructorDatasource } from "./shared/datasource/datasource.interface";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'custom-select';
  isDark = false;
  menaces = [1,2,3]
  readonly errorsMessages = errorsMessages;

  private readonly _viewInit$ = new Subject<void>();
  readonly webComponentLoaded$ = this._loadWebcomponent();

  inputControl = new FormControl('57', [Validators.required]);
  inputControlChecker = new FormControlErrorChecker(this.inputControl);

  readonly selectDatasource = {
    ItemsDataSourceName: 'mapData',
    VehicleIdField: 'vehicleId',
    MsgTimeField: 'msgTime',
    NameField: 'name',
    LatField : 'lat',
    LonField : 'lon',
    SpeedField : 'speed',
    CourseField : 'course',
    NumberOfSatellitesField : 'numberOfSatellites'
  };

  constructor(
    private readonly _lazyLoadService: LazyLoadService,
    private _actionsManager: ActionsManagerService,
    private _datasourceService: DatasourceService,
    // private _polygonSourceService: DatasourceService
  ) {
    this._datasourceService.registry(
      this.selectDatasource.ItemsDataSourceName,
      new LocalDatasource([pointItems], []) as IUiConstructorDatasource<unknown>
    );
  }

  ngAfterViewInit() {
    this._viewInit$.next();
  }


  runAction() {
    const data = {
      name: 'someEvent',
      params: { name: 'test' },
    };
    this._actionsManager.runAction(data);
  }

  private _loadWebcomponent() {
    return combineLatest([
      this._viewInit$,
      this._lazyLoadService.loadScript('assets/web-components/custom-control-components.js'),
    ]);
  }
}
