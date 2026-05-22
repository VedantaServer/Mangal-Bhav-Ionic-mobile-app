import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed
} from '@capacitor/push-notifications';

import { Device } from '@capacitor/device';

import { Router } from '@angular/router';
import { ApiNU } from '../api/apinu';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private router: Router,
    public apinu: ApiNU,
  ) { }

  async initPush(userID: number) {

    // Request permission
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    // Register FCM
    await PushNotifications.register();

    // TOKEN RECEIVED / REFRESHED
    PushNotifications.addListener(
      'registration',
      async (token: Token) => {

        console.log('FCM TOKEN:', token.value);

        // Get Device Info
        const deviceId = await this.getDeviceID();

        // Save in backend
        this.saveToken(
          userID,
          deviceId,
          token.value
        );
      }
    );

    // Error
    PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.log('FCM ERROR', error);
      }
    );

    // Foreground notification
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotification) => {

        console.log('Notification Received', notification);

      }
    );

    // Notification click
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {

        console.log('Notification Clicked', notification);

        const data = notification.notification.data;

        if (data.route) {
          this.router.navigateByUrl(data.route);
        }

      }
    );
  }

  async getDeviceID() {

    const id = await Device.getId();

    return id.identifier;
  }

  getToken(id:any){}
  async saveToken(
    userID: number,
    deviceID: string,
    token: string
  ) {

    const payload = {
      UserID: userID,
      DeviceID: deviceID,
      FCMToken: token,
      Platform: 'android',
      IsActive: Boolean(1),
      DateAdded: new Date(),
      DateModified: new Date()
    };

    console.log('SAVE TOKEN PAYLOAD', payload);

    this.apinu.postUrlData(`UserDeviceInsert`, payload).subscribe((res: any) => {
      console.log(res)
    })

  }
}