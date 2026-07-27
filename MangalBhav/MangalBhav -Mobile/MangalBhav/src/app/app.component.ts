import { Component, NgZone, OnDestroy } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Capacitor } from '@capacitor/core';
import { Router, NavigationEnd } from '@angular/router';
import { App } from '@capacitor/app';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { filter } from 'rxjs';
import { NotificationSoundService } from './services/notification-sound.service';
import { ApiNU } from '../providers';   // ← adjust path to match your project structure
import { LocationTrackingService } from 'src/providers/api/locationservice';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  lblMessage: string = 'Please waiting, setting up!';

  showAppBanner = false;
  storeUrl = '';

  readonly PLAY_URL = 'https://play.google.com/store/apps/details?id=mobile.mangalbhav.com';
  readonly APPSTORE_URL = 'https://apps.apple.com/in/app/mangal-bhav/id6764030842';

  // ── Global unread-count polling ──
  private unreadPollHandle: any = null;
  private readonly UNREAD_POLL_MS = 5000;
  private prevUnreadCount: number | null = null; // null = not fetched yet
  private userDetails: any;

  constructor(
    private locationTrackingService: LocationTrackingService,
    private router: Router,
    private platform: Platform,
    private storage: Storage,
    public routerCtrl: NavController,
    private ngZone: NgZone,
    private soundService: NotificationSoundService,
    private apinu: ApiNU
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects,
          send_to: ['G-TPZZLB33ZY', 'G-WMGSH5QEPF']
        });
      });

  }
  ngOnInit() {
    this.initializeApp();
    this.setupDeepLinks();
    this.initAnalytics();
    this.checkAppBanner();
  }

  // NEW — polls unread count app-wide (any screen), rings on increase
  private async startGlobalUnreadPolling() {
    this.userDetails = await this.storage.get('account');
    if (!this.userDetails?.UserID) return; // not logged in, nothing to poll

    this.stopGlobalUnreadPolling();
    this.checkUnreadCount(); // initial fetch, sets baseline (no sound on first check)
    this.unreadPollHandle = setInterval(() => this.checkUnreadCount(), this.UNREAD_POLL_MS);
    this.locationTrackingService.start(Number(this.userDetails.UserID));
  }

  private checkUnreadCount() {
    this.apinu.postUrlData(
      'GetUnreadNotificationCount?userID=' + Number(this.userDetails.UserID), null
    ).subscribe((res: any) => {
      const currentCount = res[0]?.UnreadCount ?? 0;

      if (this.prevUnreadCount !== null && currentCount > this.prevUnreadCount) {
        this.ngZone.run(() => this.soundService.play());
      }

      this.prevUnreadCount = currentCount;
    });
  }

  private stopGlobalUnreadPolling() {
    if (this.unreadPollHandle) {
      clearInterval(this.unreadPollHandle);
      this.unreadPollHandle = null;
    }
  }

  ngOnDestroy() {
    this.stopGlobalUnreadPolling();
    this.locationTrackingService.stop(); // add

  }

  // NEW
  private checkAppBanner() {
    if (Capacitor.isNativePlatform()) return;

    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isiOS = /iPhone|iPad|iPod/i.test(ua);

    if (!isAndroid && !isiOS) return;
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
    if (!Capacitor.isNativePlatform()) return; // skip on web
    await FirebaseAnalytics.setEnabled({ enabled: true });
    await FirebaseAnalytics.logEvent({ name: 'app_started' });
  }

  async initializeApp() {
    await this.platform.ready();
    await this.storage.create();
    const accountValue = await this.storage.get('account');

    this.startGlobalUnreadPolling();
  }
}