import { Component, NgZone } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Capacitor } from '@capacitor/core';
import { Router, NavigationEnd } from '@angular/router';
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

  // NEW
  showAppBanner = false;
  storeUrl = '';

  readonly PLAY_URL = 'https://play.google.com/store/apps/details?id=mobile.mangalbhav.com';
  readonly APPSTORE_URL = 'https://apps.apple.com/in/app/mangal-bhav/id6764030842';

  constructor(
    private router: Router,
    private platform: Platform,
    private storage: Storage,
    public routerCtrl: NavController,
    private ngZone: NgZone
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
    this.checkAppBanner(); // NEW
  }

  // NEW
  private checkAppBanner() {
    // Only show on real mobile browsers, never inside the installed native app
    if (Capacitor.isNativePlatform()) return;

    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isiOS = /iPhone|iPad|iPod/i.test(ua);

    if (!isAndroid && !isiOS) return; // desktop browser, skip
    if (sessionStorage.getItem('appBannerDismissed')) return;

    this.storeUrl = isAndroid ? this.PLAY_URL : this.APPSTORE_URL;
    this.showAppBanner = true;
  }

  // NEW
  dismissAppBanner() {
    this.showAppBanner = false;
    sessionStorage.setItem('appBannerDismissed', '1');
  }

  async setupDeepLinks() {
    App.addListener('appUrlOpen', (event) => {
      console.log('Deep Link:', event.url);
      this.ngZone.run(() => this.handleIncomingUrl(event.url));
    });

    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      console.log('Launch URL:', launchUrl.url);
      this.ngZone.run(() => this.handleIncomingUrl(launchUrl.url));
    }
  }

  private handleIncomingUrl(rawUrl: string) {
    const url = new URL(rawUrl);
    const target = url.pathname + url.search;
    this.router.navigateByUrl(target);
  }

  async initAnalytics() {
    await FirebaseAnalytics.setEnabled({ enabled: true });
    await FirebaseAnalytics.logEvent({ name: 'app_started' });
  }

  async initializeApp() {
    await this.platform.ready();
    await this.storage.create();
    const accountValue = await this.storage.get('account');
  }
}