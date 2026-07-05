import { Component, NgZone } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../providers';
import { NavigationEnd, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { filter } from 'rxjs';

declare let gtag: Function;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  lblMessage: string = 'Please waiting, setting up!';


  // constructor(
  //   private platform: Platform,
  //   private storage: Storage,
  //   public routerCtrl: NavController,private router: Router
  // ) {
  //   this.initializeApp();
  //   this.handleDeepLinks();
  // }

  constructor(
    private router: Router,
    private platform: Platform,
    private storage: Storage,
    public routerCtrl: NavController,  private ngZone: NgZone
  ) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects,
          send_to: ['G-TPZZLB33ZY', 'G-WMGSH5QEPF']
        });

      });
    this.initializeApp();

    this.setupDeepLinks();

    this.initAnalytics();
  }



  async setupDeepLinks() {

    // App already running
    App.addListener('appUrlOpen', (event) => {
      console.log('Deep Link:', event.url);
      this.ngZone.run(() => this.handleIncomingUrl(event.url));
    });

    // App opened from closed state
    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      console.log('Launch URL:', launchUrl.url);
      this.ngZone.run(() => this.handleIncomingUrl(launchUrl.url));
    }
  }

  private handleIncomingUrl(rawUrl: string) {
    const url = new URL(rawUrl);
    // Keep BOTH path and query string, not just pathname
    const target = url.pathname + url.search;
    this.router.navigateByUrl(target);
  }



  async initAnalytics() {
    await FirebaseAnalytics.setEnabled({
      enabled: true
    });

    await FirebaseAnalytics.logEvent({
      name: 'app_started'
    });

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
