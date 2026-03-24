import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginOtpPage } from './login-otp';

@NgModule({
  declarations: [
    LoginOtpPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginOtpPage),
  ],
})
export class LoginOtpPageModule {}
