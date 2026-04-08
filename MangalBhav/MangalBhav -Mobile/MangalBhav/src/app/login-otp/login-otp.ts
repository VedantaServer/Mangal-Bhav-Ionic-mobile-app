import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';   
import { Api,ApiNU } from '../../providers';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { CommonProvider } from '../../providers/common/common';
import { FcmService } from '../../providers/fcm/fcm';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'page-login-otp',
  templateUrl: 'login-otp.html',
   standalone: true,  // 👈 makes it standalone
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginOtpPage {
  ShowStudents: boolean = false;
  optTitle: string = 'Registered Phone Number'
  LoginTitle!: string;
  lblSchoolName: any;
  schoolLogo: any;
  account: { phonenumber: string } = {
    phonenumber: ''
  };
  data: any;
  lblMessage: string = '';
  OTPNumber!: string;
  showInput: boolean = true;
  showGetOTP: boolean = true;
  showConfimOTP: boolean = false;
  loadingData!: boolean;


  constructor(
    public routerCtrl: NavController,
    private router: Router,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private common: CommonProvider,
    private fcm: FcmService
  ) {
    this.schoolLogo = this.api.getSchoolLogo();
    /*
    this.data = [{ "schoolName": "The Oberai School Of Integrated Studies", "studentName": "MONU SAKLANI", "admissionNumber": "TOS/19/0546", "standardName": "I - Aster", "personid": "29361", "schoolID": "12", "tenantID": "3" }];
    this.ShowStudents = true;
    this.showConfimOTP = false;
    this.showGetOTP = false;
    this.showInput = false;
    this.lblMessage = "Congratulation, OTP Match, Proceed to Login";
  */
  }

  doCancel() {
     this.router.navigate(['/login']);
  }

  sendOTP() {
    this.storage.clear();
    this.loadingData = true;
    this.OTPNumber = this.common.generateOTP();
    if (this.account.phonenumber.length != 10) {
      this.lblMessage = "PhoneNumber Must be 10 digit ";
      return;
    } 
    var Params1 = "SMSType=SMSOTPLogin&TenantID="+ this.api.tenantID +"&SchoolID=0&PhoneNumber=" + this.account.phonenumber + "&OTP=" + this.OTPNumber;
    console.log(this.api.OTPUrl + Params1);
    this.api.getOTPPlainUrl(this.api.OTPUrl + Params1)
      .subscribe((resp: any) => {  
        if (resp) {
          console.log(resp);
          //console.log(resp.toString().indexOf('schoolName'));
          //this.lblMessage = resp;  
          if (resp.toString().indexOf('schoolName')>0) {
            console.log(resp);
            this.showGetOTP = false;
            this.showConfimOTP = true;
            this.data = JSON.parse(resp);
            this.account.phonenumber = '';
            this.optTitle = "OTP Number";
            this.lblMessage = "The SMS has been dispatched, Please confirm!";
          }
          else
          {
            this.lblMessage="Record not found or OTP not configured!";
          }
        }
        else {
          this.lblMessage = "Unable to send OTP right now, Try Later!!!";
        }
        this.loadingData = false;
      },
        error => this.lblMessage = error.message.toString());

  }

  ConfirmOTP() {
    console.log(this.OTPNumber, this.account.phonenumber);
    if (this.OTPNumber == this.account.phonenumber) {
      this.ShowStudents = true;
      this.lblMessage = "Congratulation, OTP Match, Proceed to Login";
      this.showInput = false;
      this.showGetOTP = false;
      this.showConfimOTP = false;
    }
    else {
      this.lblMessage = "OTP Not Match!!!"
    }
  }

  doLogin(personID: any, tenantID: any) {
    this.storage.clear();
    this.loadingData = true;
    //console.log(MainPage);    
    var sqlQueryData = 'PersonID=' + personID + ' and TenantID=' + tenantID;
    console.log(sqlQueryData);
    this.api.get('UserSelectAllByQuery', { tenantID: tenantID, sqlQuery: sqlQueryData, secureCode: '1' })
      .subscribe((resp: any) => {
        console.log(resp.Result[0]);
        if (resp != null) {
          this.data = resp.Result[0];
          console.log(this.data);
          if (resp.Status == 'Success' && this.data.length == 1) {
            this.data = resp.Result[0];
            this.storage.set("account", this.data[0]);
            this.fcm.getToken(this.data[0].UserID);//the userdevice token is stored from inside this fuction
             this.routerCtrl.navigateRoot('/tabs/tab1');
          }
          else {
            this.lblMessage = "Invalid Username and password..";
          }
        }
        else {
          this.lblMessage = "Invalid Username and password. Invalid Response";
        }
        this.loadingData = false;
      },
        error => this.lblMessage = "Unable to connect.. Check Internet Connection .." + error.message.toString());

  }

}

