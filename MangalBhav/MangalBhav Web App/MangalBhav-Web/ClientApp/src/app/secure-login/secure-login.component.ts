import { Component, ViewChild, OnInit, AfterViewInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { Smart } from 'smart-webcomponents-angular/validator';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user'
import { BehaviorSubject} from 'rxjs';
import { Api, keys } from '../services/api';

import { EncoderService } from '../encoder.service';
import { isBoolean } from 'util';

@Component({
  selector: 'app-secure-login',
  templateUrl: './secure-login.component.html',
  styleUrls: ['./secure-login.component.css']
})
export class SecureLoginComponent implements AfterViewInit, OnInit {
  successfullyMsg: string = '';
  showForm = true;
  ShowRegtemplate: boolean = false;
  validator: any;
  loading = false;
  errorMessage: string;
  Validationmsg: string = '';
  username: string = '';
  showValidationmsg: boolean = false;
  invalidCaption: string = '';
  showLoginLink: boolean = false;
  showLoginpage: boolean = false;
  message: string = '';
  password: string = '';
  currentUser: User;
  val: boolean =false;
  private currentUserSubject: BehaviorSubject<User>;
  rules = [
    { input: '#userInput', message: 'Username is required!</br>', action: 'keyup, blur', type: 'required' },
    { input: '#userInput', message: 'Your username must be between 3 and 12 characters!</br>', action: 'keyup, blur', type: 'stringLength', min: 3, max: 100 },
    { input: '#accessPassword', message: 'Password field is required</br>', action: 'keyup', type: 'required' },
    { input: '#accessPassword', message: 'Your password must be between at least 3 characters!</br>', action: 'keyup, blur', type: 'stringLength', min: 3, },
    { input: '#terms', action: 'change', type: 'required', message: 'You must agree to the Terms and Conditions</br>' },
  ];
  UserInfo = {
    //loop all columns here.
    UserInfoID: "-1",
    SystemInfoID: '',
    Name: '',
    PhoneNumber: '',
    Email: '',
    Password: '',
    IsActive: true,
    IsAdminUser: true,
    IPAddress: '',
    DateAdded: new Date(),
    DateModified: new Date(),
    UpdatedByUser: localStorage.getItem(keys.updatedByUser)
  }
     
  constructor(private route: ActivatedRoute, private router: Router, private authenticationService: AuthService, private api: Api, private encoder: EncoderService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  registerClick() {
    this.ShowRegtemplate = true;
    this.showForm = false;
  }

  Loginpage() {
    this.showLoginpage = false;
    this.showForm = true;

  }

  loginOnClick() {
    //console.log(this.validator.validate());
    if (!this.validator.validate()) return;  //keep trying untill data is validated..

    localStorage.removeItem('isUserLoggedIn');
    this.loading = true;
    this.authenticationService.login(this.username, this.encoder.base64Encode(this.password))
      .subscribe(
        data => {
          console.log(data);
          if (data.token) {
            localStorage.setItem('jwttoken', data.token);
            localStorage.setItem('UserID', data.userID);
            localStorage.setItem('PersonID', data.personID);
            localStorage.setItem('fK_RoleID', data.fK_RoleID);
            localStorage.setItem('isUserLoggedIn', 'True');
            localStorage.setItem('IsActive', data.isActive);
            localStorage.setItem('tenantID', data.tenantID);
            localStorage.setItem('collegeID', data.collegeID);
            localStorage.setItem('IsAdminUser', 'True');
            localStorage.setItem('CollegeID', data.collegeID);
            localStorage.setItem('TenantID', data.tenantID);
            
            if (Boolean(data.isActive) === true) {
              localStorage.setItem('IsActive', 'True');


              


              this.api.postUrlData("CollegeSelect?collegeID=" + data.collegeID + "&tenantID=" + data.tenantID, null).subscribe((collegedetail: any) => {
                console.log(collegedetail)
                if (collegedetail.CollegeList.length > 0) {
                  localStorage.setItem('CollegeName', collegedetail.CollegeList[0].Name);
                  localStorage.setItem('IsHeadOffice', collegedetail.CollegeList[0].IsHeadOffice);
                  var queryacademic = " AcademicSessionID= " + collegedetail.CollegeList[0].PanNumber;
                  this.api.postUrlData("AcademicSessionSelectAllByQuery?tenantID=" + data.tenantID + "&collegeID=" + data.collegeID + "&Query=" + queryacademic, null).subscribe((academicsessiondetail: any) => {
                    if (academicsessiondetail.AcademicSessionList.length > 0) {
                      console.log(academicsessiondetail.AcademicSessionList[0].AcademicSessionID);
                      localStorage.setItem('AcademicSessionID', academicsessiondetail.AcademicSessionList[0].AcademicSessionID);
                    }
                  });
                }
              });
             
              this.api.postUrlData("PersonSelect?personID=" + data.personID + "&tenantID=" + data.tenantID, null).subscribe((persondetail: any) => {
                console.log(persondetail)
                if (persondetail.PersonList.length > 0) {
                  console.log(persondetail.PersonList[0].StaffID);
                  localStorage.setItem('StaffID', persondetail.PersonList[0].StaffID);
                  this.api.postUrlData("StaffSelect?staffID=" + persondetail.PersonList[0].StaffID + "&tenantID=" + data.tenantID, null).subscribe((staffdetail: any) => {
                    if (staffdetail.StaffList.length > 0) {
                      localStorage.setItem('UserName', staffdetail.StaffList[0].FirstName + " " + staffdetail.StaffList[0].LastName);
                      this.router.navigate(['/dashboard']);
                    }
                  });
                  
                }
              });
              
             
            }
            else if ((Boolean(data.isActive) === true && data.userID)) {
             
              this.api.postUrlData("GetMappedListData?CollegeID=" + data.collegeID +
                "&UserID=" + data.userID + "&EntityType=UserCollegeMapping", null).subscribe((result: any) => {
                  if (result.MappedListDataList.length > 0) {
                    localStorage.setItem('MappedData', JSON.stringify(result.MappedListDataList));
                  }
                });
            
              this.router.navigate(['/dashboard']);
            } else if ((Boolean(data.isActive) === false && data.userID)) {
              this.router.navigate(['/access-denied']);
            } else if ((data.userID === null || Boolean(data.isActive) === false)) {
              //Redirect to access denied page
              this.router.navigate(['/access-denied']);
            }
          }
          else {
            this.authenticationService.clearSession(); 
            this.errorMessage = "Unable to login, Try again or contact administrator.."
          }
        },
        error => {
          this.errorMessage = "Unable to login, Try again or contact administrator.."
        }).add(() => {
          //Called when operation is complete (both success and error)
          this.loading = false;
        });;

  }

  ngOnInit(): void {
    // onInit code.
    this.val = Boolean(localStorage.getItem("isUserLoggedIn"));

    if (this.val) { // If user is not logged in
      this.router.navigate(['/dashboard']); // Redirect to login for other routes
    }
  }


  ngAfterViewInit(): void {
    // afterViewInit code.
    this.init();
  }

  RegisterCancel() {
    this.showForm = true;
    this.ShowRegtemplate = false;
  }

  init(): void {
    // init code.
    const that = this;
    that.validator = new Smart.Utilities.Validator(that.rules, '#validationsummary');
  }
}
