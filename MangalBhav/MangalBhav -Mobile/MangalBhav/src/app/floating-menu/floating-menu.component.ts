import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FloatingMenuComponent implements OnInit {
  userDetails: any;
  floatingMenuVisible: boolean = false;


  constructor(public routerCtrl: NavController, private router: Router, private storage: Storage) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async () => {
        await this.checkLogin();
      });

  }

  async checkLogin() {
    await this.storage.create();

    this.userDetails = await this.storage.get("account");

    //   console.log('USER DETAILS:', this.userDetails);

    this.floatingMenuVisible = !!this.userDetails?.LoginID;
  }

  openPage(route: string) {
    this.router.navigate([`/${route}`]);
  }

  async action4() {
    console.log('Location clicked');
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');

    this.routerCtrl.navigateForward(`/find-pandit`);

  }

  async action5() {
    await localStorage.setItem('openfindPanditThroghtFloating', 'openfindPanditThroghtFloating');

    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }



  async ngOnInit() {
    await this.checkLogin();
  }

  fabOpen = false;

  toggleFab() {
    this.fabOpen = !this.fabOpen;
  }

  closeFab() {
    this.fabOpen = false;
  }

  // Wrapper methods — one per menu item
  openChats() { this.openPage('allchats'); this.closeFab(); }
  openMandir() { this.openPage('openfindmandir'); this.closeFab(); }
  openLanguage() { this.openPage('languagechange'); this.closeFab(); }
  openSearch() { this.action4(); this.closeFab(); }
  openFestivals() { this.openPage('india-festival'); this.closeFab(); }


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
      `🤖 Android: https://play.google.com/store/apps/details?id=mobile.mangalbhav.com\n` +
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

}
