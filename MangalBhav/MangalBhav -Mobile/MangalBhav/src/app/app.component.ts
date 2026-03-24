import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../providers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  lblMessage: string = 'Please waiting, setting up!';


  constructor(
    private platform: Platform,
    private storage: Storage,
    public routerCtrl: NavController,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    // Initialize Ionic Storage
    await this.storage.create();
    const accountValue = await this.storage.get('account');
    // Decide the first page before navigation ever happens
    //console.log(accountValue);
    if (accountValue) {
      this.lblMessage = 'Login Found.. Opening Dashboard';
      this.routerCtrl.navigateRoot('/tabs/tab1', { replaceUrl: true });
    } else {
      this.routerCtrl.navigateRoot('/login', { replaceUrl: true });
    } 
  }
}
