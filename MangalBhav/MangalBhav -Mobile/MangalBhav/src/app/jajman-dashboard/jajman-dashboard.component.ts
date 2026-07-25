import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValueLookUpComponent } from 'src/components/value-look-up/value-look-up';
import { IndiaDateComponent } from 'src/components/india-date/india-date';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-jajman-dashboard',
  templateUrl: './jajman-dashboard.component.html',
  styleUrls: ['./jajman-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CommonBottomTabsComponent, TabscommonheaderComponent]
})
export class JajmanDashboardComponent implements OnInit {
  userDetails: any;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  sloganName!: any;
  pendingPanditServiceID: any;
 

  labels = {
    en: {
      myFamily: 'My Family',
      greeting: 'Namaste 🙏',
      greetingTitle: "Let's Plan Your Next Puja",
      followUs: 'Follow us on social media',
      quickActions: 'Quick Actions',
      logoTitle: 'Mangal.Bhav',
      myBookings: 'My Bookings',
      profile: 'Profile',
      festivals: 'Dainik Panchang',
      logoSub: '✦ Peace · Prosperity · Protection ✦',
      explore: 'Explore Life',
      me: 'Me',
      myTransactions: 'My Transactions',
      myMandirs: 'My Mandirs',
      chatSupport: 'Chat & Support',
      askPanditJi: 'Ask Pandit Ji',
      mangalMart: 'Mangal Mart',
    },
  
    hi: {
      myFamily: 'मेरा परिवार',
      myMandirs: 'मेरे मंदिर',
      myTransactions: 'मेरे लेन-देन',
      greeting: 'नमस्ते 🙏',
      greetingTitle: 'अपनी अगली पूजा की योजना बनाएं',
      logoSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      quickActions: 'त्वरित कार्य',
      myBookings: 'मेरी बुकिंग्स',
      profile: 'प्रोफ़ाइल',
      logoTitle: 'मंगल.भाव:',
      festivals: 'दैनिक पंचांग',
      followUs: 'सोशल मीडिया पर फॉलो करें',
      explore: 'जीवन देखें',
      me: 'मैं',
      chatSupport: 'चैट व सहायता',
      askPanditJi: 'पंडित जी से पूछें',
      mangalMart: 'मंगल मार्ट',
    }
  };


  language: any;
  currentMobileAppVersion: string = '';
  mobileAppVersion: any;
  unreadCount: any;
  FullName: any;
  referralCode: string = '';
  showBroadcastModal = false;
  broadcastMessage = '';
  private broadcastDateStr = '';



  async openWhatsApp() {
    await Browser.open({
      url: 'https://wa.me/918796917944?text=' + encodeURIComponent('Need help')
    });
  }

  async initializePushNotifications() {

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    //await PushNotifications.register();
    await PushNotifications.register();

    await PushNotifications.createChannel({
      id: 'general',
      name: 'General Notifications',
      description: 'General app notifications',
      importance: 5,
      visibility: 1,
      sound: 'default'
    });
    
    PushNotifications.addListener(
      'registration',
      (token) => {

        console.log('FCM TOKEN:', token.value);

        this.saveFCMToken(token.value);
      }
    );

    PushNotifications.addListener(
      'registrationError',
      (error) => {

        console.log('FCM Error:', error);

      }
    );
  }

  saveFCMToken(token: string) {

    const body = {
      UserID: this.userDetails.UserID,
      FCMToken: token,
      Platform: Capacitor.getPlatform()
    };

    console.log(body);

    this.api.post(
      'SaveFCMToken',
      body
    ).subscribe(
      (res: any) => {

        console.log(
          'FCM Token Saved',
          res
        );

      },
      (err: any) => {

        console.log(
          'FCM Save Failed',
          err
        );

      }
    );
  }


  constructor(private alertCtrl: AlertController, private storage: Storage, public apinu: ApiNU,
    public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider, public routerCtrl: NavController, private http: HttpClient) { }

  async ngOnInit() {

    this.userDetails = await this.storage.get("account");

    this.FullName = this.userDetails.FullName;

    this.fetchUnreadCount();
    this.language = this.userDetails?.Languages || 'English';
    this.checkMobileAppVersion();
    this.loadReferralCode();
    this.checkAndShowBroadcast();   // ← add this

    console.log('IsUserLoggedIn:', await this.storage.get("IsUserLoggedIn"));
    console.log('Role:', this.userDetails?.Role);

    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'BHAKT'
    ) {
      console.log('Redirecting...');
      this.routerCtrl.navigateForward('/login');
    }

    if (
      await this.storage.get("languageChange")
    ) {
      await this.storage.remove('languageChange');
      this.routerCtrl.navigateForward('/languagechange');
    }

    this.pendingPanditUserID = await this.storage.get('pendingPanditUserID');
    this.pendingPanditCategoryID = await this.storage.get('pendingPanditCategoryID');
    this.pendingPanditServiceID = await this.storage.get('pendingPanditServiceID');

    if (Number(this.pendingPanditServiceID) > 0) {
      this.router.navigate(['/book-pooja'], {
        queryParams: { id: this.pendingPanditServiceID }
      });
    }

    if (this.pendingPanditCategoryID && this.pendingPanditUserID) {
      this.router.navigate(['/book-pooja'], {
        queryParams: { id: -1 }
      });
    }

    await this.initializePushNotifications();

    this.getSlogan();

  }

  // ── Broadcast message: check storage first, only hit API if not yet seen today ──
 
  private async checkAndShowBroadcast() {
    const today = new Date();
    this.broadcastDateStr =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const seenKey = `broadcast_seen_${this.broadcastDateStr}`;
    const alreadySeen = await this.storage.get(seenKey);
    if (alreadySeen) return;

    const role ='Yajman' ; // e.g. 'Pandit'
    const genericDomain = 'BroadcastMessage';
    const roleDomain = role ? `BroadcastMessage-${role}` : null;

    const domainFilter = roleDomain
      ? `(Domain='${genericDomain}' OR Domain='${roleDomain}')`
      : `Domain='${genericDomain}'`;

    const query = `${domainFilter} AND Identifier='${this.broadcastDateStr}'`;

    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(query)}`,
      null
    ).subscribe({
      next: (res: any) => {
        const list = typeof res.MasterDataList === 'string'
          ? JSON.parse(res.MasterDataList)
          : (res.MasterDataList || []);

        if (!list.length) return;

        // Prefer role-specific entry over generic if both came back
        const roleEntry = roleDomain ? list.find((x: any) => x.Domain === roleDomain) : null;
        const chosen = roleEntry || list.find((x: any) => x.Domain === genericDomain) || list[0];

        this.broadcastMessage = chosen?.Description || '';
        if (this.broadcastMessage.trim()) {
          this.showBroadcastModal = true;
        }
      },
      error: (err: any) => console.error('Broadcast fetch failed:', err)
    });
  }

  async dismissBroadcast() {
    this.showBroadcastModal = false;
    await this.storage.set(`broadcast_seen_${this.broadcastDateStr}`, true);
  }


  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }

  @ViewChild(IonContent) content!: IonContent;

  scrollToTop() {
    this.content.scrollToTop(500);
  }
  getSlogan() {
    const randomIndex = Math.floor(Math.random() * 40);
    this.sloganName = this.api.getChalisaLine(randomIndex);
  }

  toggleLanguage() {

  }


  goToLoggedInHomePage() {
    this.routerCtrl.navigateForward(`/loggedin-home`);
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  openPageBookPooja() {
    this.router.navigate(['/book-pooja'], {
      queryParams: { id: 0 }
    });
  }


  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateForward('/login');
  }


  action1() {
    console.log('Call clicked');
  }

  action2() {
    console.log('Chat clicked');
  }

  action3() {
    console.log('Mail clicked');
  }

  action4() {
    console.log('Location clicked');
  }

  followOn(platform: 'facebook' | 'instagram' | 'linkedin') {


    const urls: any = {
      facebook: 'https://www.facebook.com/profile.php?id=61575446319952',   // 🔁 your page URL
      instagram: 'https://www.instagram.com/mangal_bhav_official/',  // 🔁 your handle
      linkedin: 'https://www.youtube.com/@mangal_bhav_official' // 🔁 your company page
    };
    Browser.open({ url: urls[platform] });
  }


  fetchUnreadCount() {
    this.apinu.postUrlData('GetUnreadNotificationCount?userID=' + Number(this.userDetails.UserID), null)
      .subscribe((res: any) => {
        this.unreadCount = res[0]?.UnreadCount ?? 0;
      });
  }


  async shareReferralOnWhatsApp(event: Event) {
    event.stopPropagation();   // prevent navigating to profile
    const name = this.FullName || 'A friend';
    const message =
      `🙏 *Jai Shri Ram* 🙏\n\n` +
      `${name} ne aapko *Mangal Bhav* par aane ka nimantran diya hai!\n\n` +
      `Sign up karte waqt yeh referral code use karein:\n` +
      `🎟️ *${this.referralCode}*\n\n` +
      `📱 Download: https://play.google.com/store/apps/details?id=mobile.mangalbhav.com\n\n` +
      `✦ ॐ Mangal Bhav ✦`;

    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
  }


  checkMobileAppVersion() {
    this.currentMobileAppVersion = this.api.appVersion;

    // console.log(this.mobileAppVersion)
    this.api.post(`MasterDataSelectByQuery?Query=masterDataID=13&tenantID=1`, null)
      .subscribe(async (res: any) => {
        console.log(res.MasterDataList[0].Description);
        this.mobileAppVersion = res.MasterDataList[0].Description;

        const result = this.compareVersions(
          this.currentMobileAppVersion,
          this.mobileAppVersion
        );

        if (result === -1) {
          console.log('🚨 App is outdated — update required');

          alert(`New version available (${this.mobileAppVersion}). Please update.`);
          await this.showForceUpdateAlert(this.mobileAppVersion);
          return;
        }
      })
  }


  async showForceUpdateAlert(latestVersion: string) {

    const alert = await this.alertCtrl.create({
      header: 'Update Required',
      message: `Your app version is outdated. Please update to version ${latestVersion} to continue.`,
      backdropDismiss: false, // 🔒 cannot close by clicking outside
      // buttons: [
      //   {
      //     text: 'Update Now',
      //     handler: () => {
      //       this.openStoreLink();
      //     }
      //   }
      // ]
    });

    await alert.present();
  }



  compareVersions(current: string, latest: string): number {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    const maxLength = Math.max(currentParts.length, latestParts.length);

    for (let i = 0; i < maxLength; i++) {
      const c = currentParts[i] || 0;
      const l = latestParts[i] || 0;

      if (c > l) return 1;   // current is newer
      if (c < l) return -1;  // current is older
    }

    return 0; // equal
  }


  loadReferralCode() {
    this.apinu.postUrlData(
      `UserReferralCodeSelectByQuery?Query=UserID=${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.UserReferralCodeList?.length > 0) {
        this.referralCode = res.UserReferralCodeList[0].ReferralCode;
      }
    });
  }

  async copyReferralCode(event: Event) {
    event.stopPropagation();   // prevent navigating to profile
    try {
      await navigator.clipboard.writeText(this.referralCode);
      // reuse your existing alertCtrl for a quick toast
      const alert = await this.alertCtrl.create({
        message: '✅ Referral code copied!',
        duration: 1500,
      } as any);
      alert.present();
    } catch { }
  }



}
