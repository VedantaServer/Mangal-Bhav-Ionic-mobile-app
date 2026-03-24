
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ExcelDownloadService {

  public baseURL: string;
  httpClient: any;
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {

    this.baseURL = baseUrl;
    this.httpClient = http;

  }

  uploadFile(file: File, spName: string):any {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `ImportToExcel/${spName}`;

    return this.httpClient.post(this.baseURL + uploadUrl, formData);
  }

  //uploadFile(file: File,spName): any {
  //  const formData = new FormData();
  //  formData.append('file', file);

  //  return this.httpClient.post(this.baseURL + 'ExportExcel', formData, {
  //    reportProgress: true,
  //    observe: 'events'
  //  })
  //}


  downloadSchoolSampleExcel(): void {
    // 
    const sampleData = [
      [
        "TenantID",
        "ConnectSchoolID",
        "SchoolName",
        "ShortName",
        "AddressLine1",
        "City",
        "ZipPostal",
        "State",
        "Country",
        "Telephone",
        "EmailID",
        "Website",
        "AffiliationNumber",
        "UdiseNo",
        "PrincipalName",
        "SchoolCode",
        "IsHeadOffice",
        "DateAdded",
        "DateModified",
        "UpdatedByUser",
      ]
     
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sampleData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SampleSheet");

  
    const excelBuffer: any = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Sample_Schools.xlsx");

   
  }



 downloadSampleExcel(sampleData: any[][], filename: string): void {
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sampleData);

  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SampleSheet");

  
  const excelBuffer: ArrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  saveAs(blob, filename);
}



  exportToExcel(data: any, filename:string): void {
   
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate Excel file buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from buffer and save
    const detail: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(detail,`${filename}.xlsx`);
  }

  



}
