export interface IVehicleModel {
  /**
   * Идентификатор ТС
   */
  vehicleId: number;
  /**
   * 	Время последнего сообщения
   */
  msgTime: string;
  /**
   * Наименование ТС
   */
  name: string;
  /**
   * Координата широты
   */
  lat : number;
  /**
   * Координата долготы
   */
  lon : number;
  /**
   * Скорость
   */
  speed : number;
  /**
   * Курс
   */
  course : number;
  /**
   * Количество спутников
   */
  numberOfSatellites : number;
}
export interface IPointModel{
  Lon: number;
  Lat:number;
}
export interface IPolygonModel {
  /**
   * Наименование полигона
   */
  name: string;
  /**
   * Координаты полигона
   */
  wkt: string;
  /**
   * Цвет границы полигона
   */
  borderColor: string;
  /**
   * Цвет заливки полигона
   */
  fillColor: string;
  /**
   * Толщина границы полигона
   */
  borderThickness: number;
}
export interface IDataSourceModel {
  vehicles: IVehicleModel[];
  polygons: IPolygonModel[];
}
export const vehicleItems: IVehicleModel[] = [
      {
        vehicleId: 0,
        name: "ATestVehicle1",
        lat: 86.10487,
        lon: 55.60702,
        speed: 13,
        course: 16,
        numberOfSatellites: 4,
        msgTime: "05.10.2023 04.20"
      },
      {
        vehicleId: 1,
        name: "BTestVehicle2",
        lat: 86.07487,
        lon: 55.60702,
        speed: 50,
        course: 16,
        numberOfSatellites: 2,
        msgTime: "05.10.2023 04.21"
      },
      {
        vehicleId: 2,
        name: "CTestVehicle3",
        lat: 86.05487,
        lon: 55.60702,
        speed: 70,
        course: 16,
        numberOfSatellites: 3,
        msgTime: "05.10.2023 04.22"
      },
      {
        vehicleId: 3,
        name: "DTestVehicle4",
        lat: 86.03487,
        lon: 55.60702,
        speed: 20,
        course: 16,
        numberOfSatellites: 5,
        msgTime: "05.10.2023 04.23"
      }
    ];
export const pointItems: IPointModel = {
  Lon : 55.60702, Lat : 86.10487
};
export const polygonItems: IPolygonModel[] = [
  {
    "name" : "Polygon 1",
    "borderColor":"rgba(0, 0, 0, 0.5)",
    "fillColor": "rgba(0, 0, 255, 0.5)",
    "borderThickness": 1,
    "wkt": 'POLYGON ((86.8782520294189595 54.2586536487657014, 86.8790674209594869 54.2592302090763496, 86.8799954652786255 54.2593806147880429, 86.8810254335403442 54.2593054120007707, 86.8807625770568990 54.2587382532290334, 86.8796467781067037 54.2582494250448804, 86.8787294626236104 54.2585157744534996, 86.8782520294189595 54.2586536487657014))'
  }
];
