import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ElementRef, ViewChild } from '@angular/core';
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


@Component({
  selector: 'app-tabscommonheader',
  templateUrl: './tabscommonheader.component.html',
  styleUrls: ['./tabscommonheader.component.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, CommonModule]
})
export class TabscommonheaderComponent implements OnInit {
  userDetails: any;
  language: any;
  labels = {
    en: {
      appTitle: '🕉️ Mangal Bhav',
      logoTitle: 'Mangal.Bhav',
      logoSub: '✦ Peace·Prosperity·Protection ✦',

      greetingTitle: 'Namaste 🙏, ',
      greetingSubtitle: 'Ready for today’s seva?',

      addSeva: 'Add Service',
      bookings: 'Yajman Bookings',
      profile: 'Pandit Profile',

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
      appTitle: '🕉️ मंगल भव:',
      logoTitle: 'मंगल.भव:',
      logoSub: '✦ शांति·समृद्धि·सुरक्षा ✦',

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

  constructor(public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {
    // this.lblSchoolName = this.api.SchoolName;
    // this.forgetPassword = this.api.getForgetPasswordLink();
    // this.schoolLogo = this.api.getSchoolLogo();

  }

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }


  async ngOnInit() {
    this.userDetails = await this.storage.get("account");

    this.language = this.userDetails?.Languages;
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




}
