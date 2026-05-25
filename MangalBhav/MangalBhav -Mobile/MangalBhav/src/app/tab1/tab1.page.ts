import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';



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

  language: any;
  FullName: any;
  sloganName: any;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  pendingPanditServiceID: any;
  constructor(private alertCtrl: AlertController, private storage: Storage, public apinu: ApiNU,
    public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider,
    private datePipe: DatePipe, public routerCtrl: NavController, private http: HttpClient
  ) { }


  toggleLanguage() {

  }




  async ngOnInit() {
    this.getSlogan();

    this.userDetails = await this.storage.get("account");

    this.language = this.userDetails.Languages;
    this.FullName = this.userDetails.FullName;
    console.log('ACCOUNT OBJECT:', this.userDetails);
    this.loadProfilePhoto();

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

    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'PANDIT'
    ) {
      this.routerCtrl.navigateForward('/login');
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
      // await this.storage.remove('pendingPanditUserID');
      // await this.storage.remove('pendingPanditCategoryID');
      this.router.navigate(['/book-pooja'], {
        queryParams: { id: -1 }
      });
    }




  }


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
      facebook:  'https://www.facebook.com/mangalbhav',   // 🔁 your page URL
      instagram: 'https://www.instagram.com/mangalbhav',  // 🔁 your handle
      linkedin:  'https://www.linkedin.com/company/mangalbhav' // 🔁 your company page
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

      const dataUrl = canvas.toDataURL('image/png');

      await Share.share({
        title: `Book ${this.FullName} on Mangal Bhav`,
        text: `🙏 Book Pandit Ji directly via Mangal Bhav App!\nScan the QR or use this link: ${this.APP_DOWNLOAD_LINK}`,
        url: dataUrl,          // shares image on native share sheet
        dialogTitle: 'Share via WhatsApp',
      });

    } catch (err) {
      console.error('Share failed', err);
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

}
