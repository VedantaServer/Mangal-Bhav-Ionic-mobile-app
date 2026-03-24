import { HttpClient,HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { BreadcrumbService } from '../breadcrum/breadcrumbService';


@Injectable({
  providedIn: 'root',
})
export class Api {
    
  //public ApiUrl:string='https://collegenu.vedantaerpserver.com/';
  systemInfoID: any = '1';
  objectArr: any = []
  private getCountbaseUrl = 'https://api1.balbharati.org/common/getattcount/';
  prepareImagePath(imageName: string, imagePurpose: string) {
    return this.baseURL + "api/VedantaLogin/DownloadImages?imageName=" + imageName + "&imagePurpose=" + imagePurpose;
  }


  public baseURL: string;
  httpClient: any;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private breadcrumbService: BreadcrumbService) {
   // this.baseURL = this.ApiUrl;
    this.baseURL = baseUrl;
    this.httpClient = http;
  }
  getQRCode(entityType: string, entityName: string, entityID: string): any {
    
     //explain.. for purchase self by customer this will build as http://216.48.181.17/customerselfpurchase/5 .. ID=5 is block ID
    // http://216.48.181.17/ViewDetails/Block/Canteen/5 - 3 params tell us about, EntiryType (Object name), Entity Name : Canteen, EntityID. RowID in DB
     
    var componentType = entityType == 'Block' ? 'customerselfpurchase/' + entityID
      : 'ViewDetails/' + entityType + '/' + entityName + '/' + entityID; //here we can preprare how do we want to handle the QR code URL

    return this.baseURL + componentType; 
  }



  postUrlData(urlextension: any, body: any): any {
    console.log(this.baseURL + urlextension, body);
    return this.httpClient.post(this.baseURL + urlextension, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });

  }


  uploadImage(urlextension: any, body: any): any {
    return this.httpClient.post(this.baseURL + urlextension, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'

      }),
    });

  }

  uploadFiles(files: File[], entityType: string, entityID: number, filePurpose: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file, file.name));
    formData.append('entityType', entityType);
    formData.append('entityID', entityID.toString());
    formData.append('filePurpose', filePurpose);

    return this.httpClient.post(this.baseURL + 'UploadFile', formData);
  }


  getAttendanceCount(className: string, sectionName: string, schoolId: number, fromDate: string, toDate: string) {
    const url = this.getCountbaseUrl + "?ClassName=" + className + "&SectionName=" + sectionName + "&SchoolId=" + schoolId + "&FromDate=" + fromDate + "&ToDate=" + toDate;
    return this.httpClient.get(url);
  }

  postUrlDataByImage(urlextension: any, body: any): any {
    return this.httpClient.post(this.baseURL + urlextension, body);
  }

  getForeignKeyData(tableName: string, keyColumn: string, nameColumns: string, filter: string): Observable<any[]> {
    let params = new HttpParams()
      .set('tableName', tableName)
      .set('keyColumn', keyColumn)
      .set('nameColumns', nameColumns)
      .set('filter', filter);

    return this.httpClient.get(this.baseURL + "FetchForeignKeyData", { params });
  }



  getCommonMappingKeyData(tableName: string, keyColumn: string, nameColumns: string, filter: string): Observable<any[]> {
    let params = new HttpParams()
      .set('tableName', tableName)
      .set('keyColumn', keyColumn)
      .set('nameColumns', nameColumns)
      .set('filter', filter);

    return this.httpClient.get(this.baseURL + "CommonMappingKeyData", { params });
  }

  setbreadCrumb(Indexlevel: any, clabel: any, clink: any, ckeyId: any): any {
    var breadArr = [] 
    breadArr = this.breadcrumbService.getBreadcrumbs();
    var itemFound = breadArr.length > 0 ? breadArr.filter(ad => ad.label == clabel).length : 0;
    //lets ensure that the item is not exiss in the breadcrum already.. add only if Zero
    if (itemFound == 0) {
      breadArr.push({ 'Indexlevel': Indexlevel, 'label': clabel, 'link': clink, 'keyId': ckeyId });
      this.breadcrumbService.setBreadcrumbs(breadArr);
    }
  }

  SetObjectValueArray(objectname: any, cvalue: any, cname: any): any { 
    var indexOfObject: any;
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter(ad => ad.objectname == objectname).length : 0;
    if (itemFound != 0) {
      indexOfObject = this.objectArr.findIndex(item => item.objectname === objectname);
      this.objectArr.splice(indexOfObject, 1);
    }
    this.objectArr.push({ 'objectname': objectname, 'cvalue': cvalue,'cname':cname });
  }

  getObjectID(objectname: any): any {
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter(ad => ad.objectname == objectname) : 0;
    if (itemFound.length != 0) {
      return itemFound[0].cvalue;
    }
  }

  getObjectName(objectname: any): any {
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter(ad => ad.objectname == objectname) : 0;
    if (itemFound.length != 0) {
      return itemFound[0].cname;
    }
    else
      return "";
  }




  // Format ISO date or Date object to dd-MM-yyyy
  formatDateToDisplay(date: string): string {
    if (!date) return '';
    const parsedDate = new Date(date); // Convert to Date object
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Convert dd-MM-yyyy back to ISO format
  formatDateToModel(date: string): string {
    if (!date) return '';
    const [day, month, year] = date.split('-'); // Split by -
    return new Date(`${year}-${month}-${day}`).toISOString(); // Convert to ISO
  }

}

export class GlobalKeys {

  constructor() { }

  public currentOrgID = "currentOrgID";
  public currentOrgName = "currentOrgName";

  public currentLocationID = "currentLocationID";
  public currentLocationName = "currentLocationName";

  public currentFYID = "currentFYID";
  public currentFYYear = "currentFYYear";
  public currentFYIdentifier = "currentFYIdentifier";

}
 
export class LocalStorage {

  constructor() { }

  public saveData(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public getData(key: string) {
    return localStorage.getItem(key)
  }
  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }

}


export enum OperationType {
  list,
  add,
  edit,
  delete,
}

export enum keys {
  tenantName = "GradeBook",
  SystemInfoID = 'SystemInfoID',
  userInfoID = 'UserInfoID',
  updatedByUser = 'LoggedInUser',
  StaffID = 'StaffID',
  TenantID = 'TenantID',
  SchoolID = 'SchoolID',
  UserName = 'UserName',
  AcademicSessionID = 'AcademicSessionID'
};

export enum Tables {
  SystemInfo = "SystemInfo"

}




