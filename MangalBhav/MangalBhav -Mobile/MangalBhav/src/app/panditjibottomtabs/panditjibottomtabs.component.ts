import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonicModule, NavController, Platform, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommunityService } from '../services/community';
import { BottomNavBarComponent, BottomNavTab } from '../bottom-nav-bar/bottom-nav-bar.component';

@Component({
  selector: 'app-panditjibottomtabs',
  templateUrl: './panditjibottomtabs.component.html',
  styleUrls: ['./panditjibottomtabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavBarComponent]
})
export class PanditjibottomtabsComponent implements OnInit {
  userDetails: any;
  profilePhotoUrl: string = 'assets/user.png';
  isLoggedIn = false;
  adminloggedin: boolean = false;
  currentUrl = '';

  constructor(
    private alertCtrl: AlertController, private toastCtrl: ToastController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private communityService: CommunityService
  ) { }

  get tabs(): BottomNavTab[] {
    return [
      { id: 'pooja', icon: '/assets/pooja.png', label: 'Pooja', matches: () => this.isPoojaActive() },
      { id: 'temple', icon: '/assets/temple.png', label: 'Temple', matches: (url) => url.includes('openfindmandir') },
      { id: 'community', icon: '/assets/swastik.png', round: true, matches: (url) => url.includes('open-community-page') },
      { id: 'pandit', icon: '/assets/pandit.png', label: 'Pandit ji', matches: (url) => url.includes('find-pandit') || url.includes('open-find-pandit') },
      this.adminloggedin
        ? { id: 'profile', icon: '/assets/user.png', label: 'Admin', matches: () => this.isAdminDashboardActive() }
        : {
          id: 'profile', icon: '/assets/user.png',
          label: this.isLoggedIn ? (this.userDetails?.FullName?.split(' ')[0] || 'Me') : 'Signup',
          matches: () => this.isProfileActive()
        },
    ];
  }

  onTabSelected(id: string) {
    switch (id) {
      case 'pooja': this.openPooja(); break;
      case 'temple': this.openPage('openfindmandir'); break;
      case 'community': this.communityAction(); break;
      case 'pandit': this.action4(); break;
      case 'profile': this.adminloggedin ? this.openAdminDashboard() : this.openProfile(); break;
    }
  }

  communityAction() {
    if (this.isActive('open-community-page')) {
      // this.communityService.openFeedForm$.next();
      this.openFeedForm();
    } else {
      this.openPage('open-community-page');
    }
  }

  async ngOnInit() {
    await this.storage.create();
    this.userDetails = await this.storage.get('account');
    this.adminloggedin = await this.storage.get('adminloggedin') == 'true';
    this.isLoggedIn = !!this.userDetails?.UserID;
    this.currentUrl = this.router.url;

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(async (e: any) => {
      this.currentUrl = e.urlAfterRedirects;
      this.userDetails = await this.storage.get('account');
      this.isLoggedIn = !!this.userDetails?.UserID;
    });

    if (!this.userDetails?.UserID) return;

    this.apinu.postUrlData(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.ProfileList && res.ProfileList.length > 0) {
        const rawUrl = res.ProfileList[0].ProfilePhotoUrl;
        if (rawUrl) {
          // this.loadProfileImage(rawUrl);
        }
      }
    });
  }


  loadProfileImage(imageName: string) {
    this.api.getImage('DownloadImages', {
      imageName: imageName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          this.profilePhotoUrl = URL.createObjectURL(blob);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.profilePhotoUrl = 'assets/user.png';
      }
    });
  }

  openPage(pageName: string) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  isActive(page: string): boolean {
    return this.currentUrl?.includes(page) ?? false;
  }

  async action4() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }



  openPooja() {
    if (this.isLoggedIn || this.adminloggedin) {
      this.routerCtrl.navigateForward('/tabs/tab3');
    } else {
      this.routerCtrl.navigateForward('/guest-home');
    }
  }

  openProfile() {
    if (!this.isLoggedIn) {
      this.routerCtrl.navigateForward('/login');
      return;
    }
    this.routerCtrl.navigateForward('/tabs/tab1');
  }


  isPoojaActive(): boolean {
    return this.currentUrl.includes('loggedin-home') || this.currentUrl.includes('guest-home');
  }

  isProfileActive(): boolean {
    return this.currentUrl.includes('jajmandashboard') || this.currentUrl.includes('/login');
  }


  openAdminDashboard() {
    this.router.navigateByUrl('/admindashboard');
  }

  isAdminDashboardActive(): boolean {
    return this.router.url.startsWith('/admindashboard');
  }


  // ── Feed / Post (create form) ──────────────────────────
  showFeedForm = false;
  isSubmittingFeed = false;

  Feed: any = {};

  feedMediaFile: File | null = null;
  feedMediaPreview: string | null = null;
  feedMediaKind: 'image' | 'video' | null = null;
  isUploadingFeedMedia = false;

  async openFeedForm() {
    const userID = this.adminloggedin ? 0 : this.userDetails?.UserID;

    if (!userID && !this.adminloggedin) {
      this.showToast('कृपया पहले लॉगिन करें');
      return;
    }

    this.Feed = {
      FeedID: -1,
      TenantID: this.userDetails?.TenantID || 1,
      UserID: userID,
      Title: '',
      Description: '',
      MediaType: '',
      PostType: 'Post',
      MediaURL: '',
      ThumbnailURL: '',
      Duration: 0,
      DisplayOrder: 1,
      PublishDate: new Date(),
      IsActive: true,
      IsDeleted: false,
      IsAdminPost: !!this.adminloggedin,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: String(userID),
      SourceTable: 'Feed',
      SourceID: 0,
      UserName: this.userDetails?.FullName || this.userDetails?.UserName || '',
      UserPhoto: this.userDetails?.ProfilePhoto || '',
      FeedCategory: 'Feed',
      Location: '',
      Amount: 0,
      IsAutoGenerated: false,
    };

    this.feedMediaFile = null;
    this.feedMediaPreview = null;
    this.feedMediaKind = null;
    this.showFeedForm = true;
  }

  onFeedMediaSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.feedMediaFile = file;
    this.feedMediaKind = file.type.startsWith('video') ? 'video' : 'image';
    this.Feed.MediaType = this.feedMediaKind;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.feedMediaPreview = e.target.result;
      this.uploadFeedMedia();
    };
    reader.readAsDataURL(file);
  }

  removeFeedMedia() {
    this.feedMediaFile = null;
    this.feedMediaPreview = null;
    this.feedMediaKind = null;
    this.Feed.MediaURL = '';
    this.Feed.MediaType = '';
  }

  uploadFeedMedia() {
    if (!this.feedMediaFile) return;
    this.isUploadingFeedMedia = true;

    this.api.uploadImage([this.feedMediaFile], 'feed', 'feed', 'feed').subscribe({
      next: (res: any) => {
        this.isUploadingFeedMedia = false;
        const ok = res?.Status === 'Success';
        if (ok) {
          this.Feed.MediaURL = res.FileName;
          this.feedMediaFile = null;
          this.showToast(this.feedMediaKind === 'video' ? 'वीडियो अपलोड हुआ ✅' : 'फ़ोटो अपलोड हुई ✅');
        } else {
          this.showToast('अपलोड विफल, पुनः प्रयास करें');
        }
      },
      error: () => {
        this.isUploadingFeedMedia = false;
        this.showToast('अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }

  submitFeed() {
    if (!this.Feed.Title?.trim()) { this.showToast('शीर्षक दर्ज करें'); return; }
    if (this.feedMediaFile) { this.showToast('मीडिया पहले अपलोड करें ⬆'); return; }

    this.isSubmittingFeed = true;
    this.Feed.DateModified = new Date();

    this.apinu.postUrlData('FeedInsert', this.Feed).subscribe({
      next: () => {
        this.isSubmittingFeed = false;
        this.showFeedForm = false;
        this.showToast('पोस्ट जमा हुई! Admin अनुमोदन के बाद दिखेगी 🙏');

        if (this.isActive('open-community-page')) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }

      },
      error: () => {
        this.isSubmittingFeed = false;
        this.showToast('कुछ गलत हुआ, पुनः प्रयास करें');
      }
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'bottom' });
    toast.present();
  }
}