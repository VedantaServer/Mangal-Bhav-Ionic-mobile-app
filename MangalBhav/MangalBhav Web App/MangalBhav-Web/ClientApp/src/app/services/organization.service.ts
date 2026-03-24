import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {


  private currentOrgSubject: BehaviorSubject<GlobalSelectedOrg>;
  public currentOrg: Observable<GlobalSelectedOrg>;
  

  constructor() {
    //todo: may be we can set what is available in local storage 
    var gOrg = new GlobalSelectedOrg(localStorage.getItem('currentOrgID'),localStorage.getItem('currentOrgName')
                                    ,localStorage.getItem('currentLocationID'), localStorage.getItem('currentLocationName'),
                                    localStorage.getItem('currentFYID'), localStorage.getItem('currentFYIdentifier'));
    this.currentOrgSubject = new BehaviorSubject<GlobalSelectedOrg>(gOrg);
    this.currentOrg = this.currentOrgSubject.asObservable();
  }

  setGlobalOrganization(orgID: any, orgName: any, locationID: any, locationName: any, financialYearID: any, financialYear: any) {
    var gOrg = new GlobalSelectedOrg(orgID, orgName, locationID, locationName, financialYearID, financialYear);
    this.currentOrgSubject.next(gOrg);
  } 

  removeGlobalOrganization() {
    this.currentOrgSubject.next(null);
  } 

}

export class GlobalSelectedOrg {
  public organizationID: any;
  public organizationName: any;
  public orgLocationID: any;
  public orgLocationName: any;
  public orgYearID: any;
  public orgYear: any;

  constructor(orgID: any, orgName: any, locationID: any, locationName: any,financialYearID: any, financialYear: any) {
    this.organizationID = orgID;
    this.organizationName = orgID ? orgName : 'NoOrganization';
    this.orgLocationID = locationID;
    this.orgLocationName = locationID ? locationName : 'NoLocation';
    this.orgYearID = financialYearID;
    this.orgYear = financialYear;
  }
}
