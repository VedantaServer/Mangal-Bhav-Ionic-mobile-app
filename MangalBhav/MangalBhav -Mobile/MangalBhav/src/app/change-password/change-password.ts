import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../../providers'; // adjust path

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.html',  // keep your old HTML file
  styleUrls: ['./change-password.scss'],  // optional
  standalone: true,                       // ⚡ important
  imports: [CommonModule, FormsModule, IonicModule] // modules it uses
})
export class ChangePasswordPage {
  txtUserName: any;
  txtpassword: any;
  txtname: any;
  isenabled = true;
  lblMessage = '';
  changepassword: any;
  confirmchangepassword: any;
  personDetails: any;
  accountValue: any;

  constructor(private storage: Storage, private api: Api) {}

  async ngOnInit() {
   // await this.storage.create();
   // this.txtname = await this.storage.get('chatUsername');
   this.personDetails = await this.storage.get('person');
   this.txtname = this.personDetails.Name;
    this.accountValue = await this.storage.get('account');
    if (this.accountValue) {
      this.txtUserName = this.accountValue.username;
    }
  }

  async doclick() {
    if (this.changepassword !== this.confirmchangepassword) {
      this.lblMessage = 'Password & confirm password not matched, Please try again';
      return;
    }

    const accountValue = await this.storage.get('account');
    if (!accountValue) {
      this.lblMessage = 'Account not found in storage';
      return;
    }


    const body = {
    userDetailID : Number ( this.accountValue.userDetailID ?? 0),
		tenantID : Number ( this.accountValue.tenantID  ?? 0),
		orgnanizationID : Number ( this.accountValue.orgnanizationID ?? 0),
		vendorID: Number ( this.accountValue.vendorID  ?? 0),
		personID: Number ( this.accountValue.personID ?? 0),
		userName: this.accountValue.username,
		passwaord: this.changepassword,
		isActive: Boolean(1),
		dateAdded: new Date(this.accountValue.dateAdded),
		dateModified: new Date(),
		updatedByUser: this.accountValue.username
    }

    console.log(body)


    if (this.txtpassword === accountValue.password) {
      this.api.post('UserDetailUpdate', body ).subscribe((resp: any) => {
        if (resp) {
          this.isenabled = false;
          this.lblMessage = 'Password Updated Successfully...';
          
        } else {
          this.lblMessage = 'Error occurred';
        }
      });
    } else {
      this.lblMessage = 'Previous Password not match.';
    }
  }
}
