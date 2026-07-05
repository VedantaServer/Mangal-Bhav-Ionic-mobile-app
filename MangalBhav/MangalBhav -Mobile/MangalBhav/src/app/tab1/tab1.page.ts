import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,

})
export class Tab1Page {
  userDetails!: any;
  showIdCard = false;
  profileImageUrl: string | null = null;

  @ViewChild('qrCode', { read: ElementRef }) qrCodeRef!: ElementRef;

  labels = {
    en: {
      appTitle: '🕉️ Mangal Bhav',
      logoTitle: 'Mangal.Bhav',
      logoSub: '✦ Peace · Prosperity · Protection ✦',

      greetingTitle: 'Namaste 🙏, ',
      greetingSubtitle: 'Ready for today’s seva?',

      addSeva: 'Add Service',
      bookings: 'Yajman Bookings',
      profile: 'Pandit Profile',
      followUs: 'Follow us on social media',
      mySeva: 'My Seva',
      bookedSeva: 'Booked Seva',
      myBookings: 'My Bookings',
      status: 'Status',

      scanToBook: 'Scan to Book',

      currentLocation: 'Current Location',
      available: 'Available',

      changeLang: 'Change Language'
    },

    hi: {
      appTitle: '🕉️ मंगल भाव',
      logoTitle: 'मंगल.भाव:',
      logoSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      followUs: 'सोशल मीडिया पर फॉलो करें',
      greetingTitle: 'नमस्ते 🙏, ',
      greetingSubtitle: 'क्या आप आज की सेवा के लिए तैयार हैं?',

      addSeva: 'सेवा जोड़ें',
      bookings: 'यजमान बुकिंग',
      profile: 'पंडित जी प्रोफाइल',

      mySeva: 'मेरी सेवा',
      bookedSeva: 'बुक की गई सेवा',
      myBookings: 'मेरी बुकिंग्स',
      status: 'स्थिति',

      scanToBook: 'बुक करने के लिए स्कैन करें',

      currentLocation: 'वर्तमान स्थान',
      available: 'उपलब्ध',

      changeLang: 'भाषा बदलें'
    }
  };
  showBroadcastModal = false;
  broadcastMessage = '';
  private broadcastDateStr = '';
  language: any;
  FullName: any;
  sloganName: any;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  pendingPanditServiceID: any;
  currentMobileAppVersion: string = '';
  mobileAppVersion: any;
  unreadCount: any;
  referralCode: string = '';
  constructor(private alertCtrl: AlertController, private storage: Storage, public apinu: ApiNU,
    public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider,
    private datePipe: DatePipe, public routerCtrl: NavController, private http: HttpClient
  ) { }


  toggleLanguage() {

  }


  async initializePushNotifications() {

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    await PushNotifications.register();

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

  async ngOnInit() {
    this.getSlogan();

    this.userDetails = await this.storage.get("account");

    this.fetchUnreadCount();
    this.checkMobileAppVersion();

    this.language = this.userDetails.Languages;
    this.FullName = this.userDetails.FullName;
    this.loadProfilePhoto();
    this.loadReferralCode();
    this.checkAndShowBroadcast();   // ← add this

    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'PANDIT'
    ) {
      this.routerCtrl.navigateForward('/login');
    }

    if (this.FullName == null) {
      const alert = await this.alertCtrl.create({
        header: '🙏 Profile Incomplete',
        subHeader: 'Your sacred profile awaits',
        message: 'Please complete your profile before proceeding. You will not be able to create service and get bookings.',
        cssClass: 'sacred-alert',
        buttons: [
          {
            text: 'Complete Profile →',
            cssClass: 'alert-btn-confirm',
            handler: () => {
              this.routerCtrl.navigateForward('/user-profile');
            }
          }
        ]
      });

      await alert.present();
      return;
    }
    console.log(this.userDetails);

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
  }

  // ── Broadcast message: check storage first, only hit API if not yet seen today ──
  private async checkAndShowBroadcast() {
    const today = new Date();
    this.broadcastDateStr =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const seenKey = `broadcast_seen_${this.broadcastDateStr}`;
    const alreadySeen = await this.storage.get(seenKey);
    if (alreadySeen) return; // already dismissed today's broadcast — skip API entirely

    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`Domain='BroadcastMessage' AND Identifier='${this.broadcastDateStr}'`)}`,
      null
    ).subscribe({
      next: (res: any) => {
        const list = typeof res.MasterDataList === 'string'
          ? JSON.parse(res.MasterDataList)
          : (res.MasterDataList || []);

        if (!list.length) return; // no broadcast configured for today

        this.broadcastMessage = list[0].Description || '';
        if (this.broadcastMessage.trim()) {
          this.showBroadcastModal = true;
        }
      },
      error: (err:any) => console.error('Broadcast fetch failed:', err)
    });
  }

  async dismissBroadcast() {
    this.showBroadcastModal = false;
    await this.storage.set(`broadcast_seen_${this.broadcastDateStr}`, true);
  }



  // async ngOnInit() {
  //   this.getSlogan();


  //   this.userDetails = await this.storage.get("account");


  //   this.fetchUnreadCount();
  //   this.checkMobileAppVersion();

  //   this.language = this.userDetails.Languages;
  //   this.FullName = this.userDetails.FullName;
  //   // console.log('ACCOUNT OBJECT:', this.userDetails);
  //   this.loadProfilePhoto();
  //   this.loadReferralCode();
  //   if (
  //     await this.storage.get("IsUserLoggedIn") &&
  //     this.userDetails?.Role !== 'PANDIT'
  //   ) {
  //     this.routerCtrl.navigateForward('/login');
  //   }




  //   if (this.FullName == null) {
  //     const alert = await this.alertCtrl.create({
  //       header: '🙏 Profile Incomplete',
  //       subHeader: 'Your sacred profile awaits',
  //       message: 'Please complete your profile before proceeding. You will not be able to create service and get bookings.',
  //       cssClass: 'sacred-alert',
  //       buttons: [
  //         {
  //           text: 'Complete Profile →',
  //           cssClass: 'alert-btn-confirm',
  //           handler: () => {
  //             this.routerCtrl.navigateForward('/user-profile');
  //           }
  //         }
  //       ]
  //     });

  //     await alert.present();
  //     return;
  //   }
  //   console.log(this.userDetails);



  //   if (
  //     await this.storage.get("languageChange")
  //   ) {
  //     await this.storage.remove('languageChange');
  //     this.routerCtrl.navigateForward('/languagechange');
  //   }






  //   this.pendingPanditUserID = await this.storage.get('pendingPanditUserID');
  //   this.pendingPanditCategoryID = await this.storage.get('pendingPanditCategoryID');


  //   this.pendingPanditServiceID = await this.storage.get('pendingPanditServiceID');


  //   if (Number(this.pendingPanditServiceID) > 0) {
  //     this.router.navigate(['/book-pooja'], {
  //       queryParams: { id: this.pendingPanditServiceID }
  //     });
  //   }



  //   if (this.pendingPanditCategoryID && this.pendingPanditUserID) {
  //     // await this.storage.remove('pendingPanditUserID');
  //     // await this.storage.remove('pendingPanditCategoryID');
  //     this.router.navigate(['/book-pooja'], {
  //       queryParams: { id: -1 }
  //     });
  //   }

  //   await this.initializePushNotifications();


  // }


  // ── Share modal ───────────────────────────────────────────────
  showShareModal = false;
  selectedPlatform: 'android' | 'ios' | null = null;
  copied = false;

  // ✅ Replace these with your real store links
  androidLink = 'https://play.google.com/store/apps/details?id=mobile.mangalbhav.com';
  iosLink = 'https://apps.apple.com/app/mangalbhav/id000000000';

  openShare() {
    this.selectedPlatform = null;
    this.showShareModal = true;
    this.copied = false;
  }

  closeShare() {
    this.showShareModal = false;
    this.selectedPlatform = null;
    this.copied = false;
  }

  selectPlatform(platform: 'android' | 'ios') {
    this.selectedPlatform = platform;
    this.copied = false;
  }


  followOn(platform: 'facebook' | 'instagram' | 'linkedin') {
    const urls: any = {
      facebook: 'https://www.facebook.com/profile.php?id=61575446319952',   // 🔁 your page URL
      instagram: 'https://www.instagram.com/mangal_bhav_official/',  // 🔁 your handle
      linkedin: 'https://www.youtube.com/@mangal_bhav_official' // 🔁 your company page
    };
    Browser.open({ url: urls[platform] });
  }

  getAppLink(): string {
    return this.selectedPlatform === 'android' ? this.androidLink : this.iosLink;
  }

  getQrUrl(): string {
    const link = encodeURIComponent(this.getAppLink());
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${link}&color=E07B00&bgcolor=FFFBF0`;
  }

  copyLink() {
    navigator.clipboard.writeText(this.getAppLink()).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
    });
  }
  // ── Share message (beautiful, used by all share channels) ─────────────────
  private getShareMessage(): string {
    return (
      `🙏 *Mangal Bhav* — Book Verified Pandits for Sacred Rituals\n\n` +
      `✨ Find trusted Pandits for Puja, Havan, Vivah & more\n` +
      `📿 Authentic Vedic rituals at your doorstep\n` +
      `⭐ Verified, experienced & multilingual Pandits\n\n` +
      `📱 Download now:\n` +
      `🤖 Android: https://play.google.com/store/apps/details?id=com.mangalbhav.app\n` +
      `🍎 iPhone: https://apps.apple.com/app/mangalbhav/id000000000\n\n` +
      `✦ ॐ Mangal Bhav ✦`
    );
  }

  // ── WhatsApp share ────────────────────────────────────────────────────────
  shareOnWhatsApp() {
    const message = encodeURIComponent(this.getShareMessage());
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  }

  // ── Native share (mobile share sheet) ────────────────────────────────────
  async shareNative() {
    const shareData = {
      title: '🙏 Mangal Bhav — Book Verified Pandits',
      text: this.getShareMessage(),
      url: 'https://play.google.com/store/apps/details?id=com.mangalbhav.app'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled — do nothing
      }
    } else {
      // Fallback: copy to clipboard if Web Share API not supported
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        this.copied = true;
        setTimeout(() => (this.copied = false), 2500);
      } catch {
        console.warn('Clipboard write failed');
      }
    }
  }



  async openWhatsApp() {
    await Browser.open({
      url: 'https://wa.me/918796917944?text=' + encodeURIComponent('Need help')
    });
  }



  loadProfilePhoto() {
    const photoFileName = this.userDetails?.ProfilePhotoUrl;

    console.log('Photo filename:', photoFileName); // → should print "639101418926498179.png"

    if (!photoFileName) return;

    this.api.getImage('DownloadImages', {
      imageName: photoFileName,
      imagePurpose: 'ProfilePhoto'   // ✅ check if your API expects a different value here
    }).subscribe({
      next: (blob: Blob) => {
        console.log('Blob size:', blob?.size, 'Type:', blob?.type);
        if (blob && blob.size > 0) {
          this.profileImageUrl = URL.createObjectURL(blob);
        }
      },
      error: (err) => console.error('getImage failed:', err)
    });
  }

  getSlogan() {
    const randomIndex = Math.floor(Math.random() * 40);
    this.sloganName = this.api.getChalisaLine(randomIndex);
    //alert(this.sloganName)
  }


  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  openPageee(pageName: any) {
    this.router.navigate([`/${pageName}`], {
      queryParams: { id: 0 }
    });
  }


  onImgError(event: any) {
    event.target.src = 'assets/default-pandit.png'; // your fallback image
  }

  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateForward('/login');
  }


  // ✅ Share QR as image on WhatsApp



  async shareQROnWhatsApp() {
    try {

      const canvas = this.qrCodeRef.nativeElement.querySelector('canvas');
      if (!canvas) return;

      const base64Data = canvas
        .toDataURL('image/png')
        .replace('data:image/png;base64,', '');

      const fileName = `qr_${Date.now()}.png`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: `Book ${this.FullName} on Mangal Bhav`,
        text:
          `🙏 Book ${this.FullName} directly via Mangal Bhav.\n\n` +
          `${this.APP_DOWNLOAD_LINK}`,
        url: savedFile.uri
      });

    } catch (err) {
      console.error(err);
    }
  }


  APP_DOWNLOAD_LINK = 'https://play.google.com/store/apps/details?id=com.mangalbhav.app';


  // ✅ Share App download link directly on WhatsApp (web fallback)
  shareAppLinkOnWhatsApp() {
    const message = encodeURIComponent(
      `🙏 Book *${this.FullName}* (Verified Pandit Ji) on *Mangal Bhav App*!\n\n` +
      `📲 Download here: ${this.APP_DOWNLOAD_LINK}\n\n` +
      `✦ Easy booking | Trusted Pandits ✦`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
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

  async action4() {
    console.log('Location clicked');
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');

    this.routerCtrl.navigateForward(`/find-pandit`);

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


  fetchUnreadCount() {
    this.apinu.postUrlData('GetUnreadNotificationCount?userID=' + Number(this.userDetails.UserID), null)
      .subscribe((res: any) => {
        this.unreadCount = res[0]?.UnreadCount ?? 0;
      });
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

}
