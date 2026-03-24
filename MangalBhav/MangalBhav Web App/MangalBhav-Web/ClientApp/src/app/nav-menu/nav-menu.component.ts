import { Component, AfterViewInit, OnInit , ViewChild } from '@angular/core';
import { Api, LocalStorage } from '../services/api';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { DropDownListComponent } from 'smart-webcomponents-angular/dropdownlist';
import { GlobalSelectedOrg, OrganizationService } from '../services/organization.service';
 

declare function showHide()

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements AfterViewInit, OnInit {
  @ViewChild('dropdownlist', { read: DropDownListComponent, static: false }) dropdownlist!: DropDownListComponent;

  Selectedvalue: string;
  Location = [];
  Organization = [];
  AcademicSession = [];
  tenantID: any;
  SchoolID: any;
  FYValue: any;
  isExpanded = false;
  currentUser: User;
  systemInfo: any;
  isUserLoggedIn: boolean = false;


  constructor(private api: Api, private authenticationService: AuthService, private router: Router, private orgService: OrganizationService) {
    this.authenticationService.currentUser.subscribe(loggedUser => {
      this.currentUser = loggedUser;
      if (loggedUser)
        this.FillOrganizationDropDown();

      this.displaySystemInfo();
    }); //subscribe to user
  }
  displaySystemInfo() {
    this.tenantID = localStorage.getItem('TenantID');
    this.SchoolID = localStorage.getItem('SchoolID');
    this.FYValue = localStorage.getItem('currentFYID');
    //console.log(this.currentUser);
    //first of all get data from storage,


    this.systemInfo = localStorage.getItem('SystemInfo') !== null ? JSON.parse(localStorage.getItem('SystemInfo')) : '';
    //console.log(localStorage.getItem('SystemInfo'));

    if (this.systemInfo == '') //if not found then fill it for first time and set in local storage.
    {

      this.api.postUrlData("SystemInfoSelect?SystemInfoID=" + this.api.systemInfoID, null)
        .subscribe(
          data => {
            //console.log(data)
            //console.log('first time only and then get from in storage');
            this.systemInfo = data.SystemInfoList[0];
            localStorage.setItem('SystemInfo', JSON.stringify(this.systemInfo));

          });
    }
    localStorage.setItem('SystemInfoID', this.systemInfo.SystemInfoID);
     
  }

  FillOrganizationDropDown() {
    if (this.currentUser) {

      this.api.postUrlData("TenantSelect?tenantID=" + this.currentUser.tenantID, null)
        .subscribe(result => {
          this.Organization = result.TenantList;
          if (this.Organization.length > 0) {
            this.tenantID = localStorage.getItem('TenantID');
          }
        });
      this.FillLocationDropDown();
    }
    
  }

  FillLocationDropDown() {
    if (!this.tenantID) return; //nothing to fill when there is not location.
    this.SchoolID = null;
    
      this.api.postUrlData("GetMappedListData?SchoolID=" + this.currentUser.schoolID +
        "&UserID=" + this.currentUser.userID + "&EntityType=UserSchoolMapping", null).subscribe((result: any) => {
          if (result.MappedListDataList.length > 0) {
            this.Location = result.MappedListDataList;
            this.SchoolID = result.MappedListDataList[0].ID;
          };
        });
  }
  FillDropDownYear() {

    this.api.postUrlData("AcademicSessionSelectAllByTenantID?tenantID=" + this.currentUser.tenantID, null)
      .subscribe((data: any) => {
        this.AcademicSession = data.AcademicSessionList
        this.FYValue = localStorage.getItem('currentFYID');
      })
  }

  setCurrent() {

    //becauase this is two binding so on every change in selected items.. this.ogrvalue will change so when come on button but
    //it is already set.  then will find and use the name of the original arr with which we filled the drop down.
    let orgIndex = this.Organization.findIndex((item) => item.TenantID == this.tenantID);

    localStorage.setItem('currentOrgID', this.Organization[orgIndex].TenantID);
    localStorage.setItem('currentOrgName', this.Organization[orgIndex].TenantDescription);

    let locIndex = this.Location.findIndex((item) => (Boolean(this.currentUser.isActive) == true) ? (item.ID == this.SchoolID) : (item.ID == this.SchoolID));
    var locationName = 'Not Found';
    if (locIndex >= 0) {
      localStorage.setItem('currentLocationID', (this, Boolean(this.currentUser.isActive) == true) ? (this.Location[locIndex].ID) : this.Location[locIndex].ID);
      localStorage.setItem('currentLocationName', (Boolean(this.currentUser.isActive) == true) ? (this.Location[locIndex].MappedName) : this.Location[locIndex].MappedName);
      locationName = (Boolean(this.currentUser.isActive) == true) ? (this.Location[locIndex].MappedName) : this.Location[locIndex].MappedName;
    }
    else
      this.SchoolID = null;

    let fyIndex = this.AcademicSession.findIndex((item) => item.AcademicSessionID == this.FYValue);
    localStorage.setItem('currentFYID', this.AcademicSession[fyIndex].AcademicSessionID);
    localStorage.setItem('currentFYYear', this.AcademicSession[fyIndex].SessionYear);
    localStorage.setItem('currentFYIdentifier', this.AcademicSession[fyIndex].Identifier);

    this.orgService.setGlobalOrganization(this.Organization[orgIndex].OrganizationID, this.Organization[orgIndex].Name,
      this.SchoolID, locationName, this.AcademicSession[fyIndex].FinancialYearID,
      this.AcademicSession[fyIndex].Year);

  }

  ngOnInit(): void {
       
    this.FillOrganizationDropDown();
    this.FillDropDownYear();
    this.FillLocationDropDown();
  }

  ngAfterViewInit(): void {
    
  }


  collapse() {
    this.isExpanded = false;
  }
  toggle() {
    this.isExpanded = !this.isExpanded;
  }
  gotoPage(pageName) {
    showHide();
    //console.log(pageName);
    this.router.navigate(['/' + pageName]);
    // if (pageName==1)
    //  this.router.navigate(['/dashboard']);
    //if (pageName == 2)
    //  this.router.navigate(['/userinstallation']);
  }
}
