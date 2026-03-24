import { HttpClient,HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";


@Injectable({
  providedIn: 'root'   // ✅ Add this line
})
export class ApiNU {
  
      
  systemInfoID: any = '1';
   objectArr:any = []
  prepareImagePath(imageName: string, imagePurpose: string) {
    return this.baseURL + "api/VedantaLogin/DownloadImages?imageName=" + imageName + "&imagePurpose=" + imagePurpose;
  }


  //public baseURL: string='https://nu.vedantaerpserver.com/';
   public baseURL: string='https://faceupai.vedantaerpserver.com/';
  // public baseURL: string='https://localhost:44305/';

  httpClient: any;
  constructor(http: HttpClient) {
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

  postEmail(urlextension: string, body: any): Observable<any> {
    return this.httpClient.post(this.baseURL + urlextension, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  //sendEmail(emailTo: string, subject: string, body: string, fileUrl:string): Observable<any> {
  //  const url = `${this.baseURL}SendEmail`;

  //  const emailData = {
  //    emailToAddress: emailTo,
  //    subject: subject,
  //    body: body,
  //    fileUrl: fileUrl
  //  };

  //  return this.httpClient.post(url, emailData, {
  //    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //  });
  //}

  sendEmail(fromEmail: string, emailTo: string, subject: string, body: string, ccEmail?: string, fileUrl?: string): Observable<any> {
    const url = `${this.baseURL}SendEmail`;

    const emailData = {
      FromAddress: fromEmail,   // Sender's Email (Now required)
      EmailToAddress: emailTo,  // Recipient's Email
      Subject: subject,
      Body: body,
      CcAddress: ccEmail || '', // Optional CC Emails (empty if not provided)
      FileUrl: fileUrl || ''    // Optional File Attachment
    };

    return this.httpClient.post(url, emailData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }


  uploadFiles(files: File[], entityType: string, entityID: number, filePurpose: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file, file.name));
    formData.append('entityType', entityType);
    formData.append('entityID', entityID.toString());
    formData.append('filePurpose', filePurpose);

    return this.httpClient.post(this.baseURL +'UploadFile', formData);
  }

  downloadFile(filePurpose: string, fileName: string): Observable<Blob> {
    const params = new HttpParams()
      .set('filePurpose', filePurpose)
      .set('fileName', fileName);

    return this.httpClient.get(this.baseURL + 'DownloadFile', {
      params: params,
      responseType: 'blob' // Important for handling file downloads
    });
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

  

  SetObjectValueArray(objectname: any, cvalue: any, cname: any): any { 
    var indexOfObject: any;
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter((ad: { objectname: any; }) => ad.objectname == objectname).length : 0;
    if (itemFound != 0) {
      indexOfObject = this.objectArr.findIndex((item: { objectname: any; }) => item.objectname === objectname);
      this.objectArr.splice(indexOfObject, 1);
    }
    this.objectArr.push({ 'objectname': objectname, 'cvalue': cvalue,'cname':cname });
  }

  getObjectID(objectname: any): any {
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter((ad: { objectname: any; }) => ad.objectname == objectname) : 0;
    if (itemFound.length != 0) {
      return itemFound[0].cvalue;
    }
  }

  getObjectName(objectname: any): any {
    var itemFound = this.objectArr.length > 0 ? this.objectArr.filter((ad: { objectname: any; }) => ad.objectname == objectname) : 0;
    if (itemFound.length != 0) {
      return itemFound[0].cname;
    }
    else
      return "";
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
  tenantName = "CAPS-AI",
  SystemInfoID = 'SystemInfoID',
  userInfoID = 'UserInfoID',
  updatedByUser = 'LoggedInUser'
};

export enum Tables {
  SystemInfo = "SystemInfo"

}
