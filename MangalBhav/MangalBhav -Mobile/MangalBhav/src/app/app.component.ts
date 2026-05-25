import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../providers';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

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
    public routerCtrl: NavController,private router: Router
  ) {
    this.initializeApp();
    this.handleDeepLinks();
  }


  handleDeepLinks() {

    App.addListener('appUrlOpen', (event: any) => {

      console.log('URL OPENED', event.url);

      const slug = event.url.split('.com').pop();

      if (slug) {
        this.router.navigateByUrl(slug);
      }

    });

  }

  async initializeApp() {
    await this.platform.ready();
    // Initialize Ionic Storage
    await this.storage.create();
    const accountValue = await this.storage.get('account');
    // Decide the first page before navigation ever happens
    //console.log(accountValue);
    /*
    if (accountValue) {
      this.lblMessage = 'Login Found.. Opening Dashboard';
      this.routerCtrl.navigateForward('/tabs/tab1', { replaceUrl: true });
    } else {
      this.routerCtrl.navigateForward('/login', { replaceUrl: true });
    }
      */
  }
}
