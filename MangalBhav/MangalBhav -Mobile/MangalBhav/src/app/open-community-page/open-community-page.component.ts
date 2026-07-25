import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
import { CommunityService } from '../services/community';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

interface AartiStep { icon: string; label: string; sub: string; sub2?: string; }
interface FeedItem {
  FeedID: number;
  Title: string;
  Description: string;
  MediaType: string;
  MediaURL: string;
  ThumbnailURL: string;
  PublishDate: string;
  DateAdded: string;
  UserName: string;
  UserPhoto: string;
  FeedCategory: string;
  Location: string;
  SourceTable: string;
  SourceID?: number;
  mediaBlobUrl?: string;

  // ── Engagement ──
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  myFeedLikeID?: number;
  isLikeInFlight?: boolean;   // guards double-taps
  hasBeenViewed?: boolean;    // guards duplicate FeedViewInsert calls
}

interface FeedDateGroup {
  dateKey: string;      // yyyy-MM-dd
  dateLabel: string;    // display label e.g. "आज", "19 जुलाई 2026"
  items: FeedItem[];
  panchangImage?: string;
  panchangLoading?: boolean;
}

@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    TabscommonheaderComponent,
    PanditjibottomtabsComponent, CommonBottomTabsComponent
  ]
})
export class OpenCommunityPageComponent implements OnInit, OnDestroy {

  userDetails: any;
  userLoggedIn = false;
  language = 'English';

  // ── Family Active Mandir (hero display) ───────────────
  familyActiveMandir: any = null;
  familyMandirPhotoUrl: string | null = null;
  familyMandirPhoto2Url: string | null = null;
  familyMandirPhoto3Url: string | null = null;
  familyMandirSlideIndex = 0;
  private familyMandirSlideTimer: any;

  // ── Toast ──────────────────────────────────────────────
  toastVisible = false;
  toastIcon = '🙏';
  toastMessage = '';
  private toastTimer: any;

  // ── Family Mandir (add/edit form) ─────────────────────
  showFamilyMandirForm = false;
  isSubmittingFamilyMandir = false;

  familyMandir = {
    TenantID: 1, FamilyID: 0,
    MandirName: '', MandirDescription: '', GodName: '',
    MandirPhoto1: '', MandirPhoto2: '', MandirPhoto3: '',
    AartiName1: '', AartiName2: '', AartiName3: '',
    IsActive: false,
    DateAdded: new Date(), DateModified: new Date(),
    UpdatedByUser: ''
  };

  showbottomAndHeader = true;

  fmPhoto1File: File | null = null; fmPhoto1Preview: string | null = null; fmUploading1 = false;
  fmPhoto2File: File | null = null; fmPhoto2Preview: string | null = null; fmUploading2 = false;
  fmPhoto3File: File | null = null; fmPhoto3Preview: string | null = null; fmUploading3 = false;

  fmAudio1File: File | null = null; fmAudio1Name: string | null = null; fmUploadingA1 = false;
  fmAudio2File: File | null = null; fmAudio2Name: string | null = null; fmUploadingA2 = false;
  fmAudio3File: File | null = null; fmAudio3Name: string | null = null; fmUploadingA3 = false;

  // ── Feed reels ─────────────────────────────────────────
  feedGroups: FeedDateGroup[] = [];
  feedLoading = false;
  feedAllLoaded = false;
  private feedWindowDays = 3;
  private feedWindowEnd: Date | null = null;   // exclusive upper bound for the NEXT fetch
  private feedEmptyWindowStreak = 0;
  private readonly feedMaxEmptyWindows = 6;    // give up after 6 empty windows (~30 days w/ nothing)


  onFeedInfiniteScroll(event: any) {
    // alert('l')
    this.loadMoreFeed().then(() => {
      event.target.complete();
      if (this.feedAllLoaded) {
        event.target.disabled = true;
      }
    });
  }

  /** Fires continuously on every scroll frame (since [scrollEvents]="true").
   * Triggers loadMoreFeed() proactively once the user is within
   * feedScrollThresholdPx of the bottom, instead of waiting for
   * ion-infinite-scroll's own threshold/visibility detection. */
  async onContentScroll(event: any) {
    if (this.feedLoading || this.feedAllLoaded) return;

    const scrollEl = await event.target.getScrollElement();
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight;
    const clientHeight = scrollEl.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    if (distanceFromBottom <= this.feedScrollThresholdPx) {
      this.loadMoreFeed();
    }
  }

  private readonly feedScrollThresholdPx = 600; // start fetching this many px before the true bottom
  // ── Panchang (per-date, rendered inline as image) ──────
  PANCHANG_ICON_MAP: Record<string, string> = {
    'सूर्योदय': '🌅', 'सूर्यास्त': '🌇',
    'श्री संवत्': '📿', 'मास': '🗓️', 'अयन': '🧭', 'पक्ष': '🌓', 'ऋतु': '🍃',
    'तिथि': '📆', 'नक्षत्र': '⭐', 'योग': '🕉️', 'करण': '🤝',
    'अभिजीत मुहूर्त': '✅', 'राहुकाल': '⚠️',
    'सूर्य': '☀️', 'चंद्र': '🌙', 'मंगल': '♂️', 'बुध': '☿️', 'गुरु': '♃',
    'शुक्र': '♀️', 'शनि': '♄', 'राहु': '☊', 'केतु': '☋',
  };
  TWO_COL_SECTIONS = ['ग्रह स्थिति', 'संवत्सर एवं काल'];
  private panchangKeyOrder: Map<string, number> = new Map();

  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public http: HttpClient, private communityService: CommunityService, private cdr: ChangeDetectorRef,
  ) { }


  // async ngOnInit() {
  //   await this.refreshUserDetails();
  //   this.language = this.userDetails?.Languages || 'English';
  //   this.loadFamilyActiveMandir();
  //   this.loadMoreFeed();
  //   this.loadMangalMudraPoints();

  //   this.communityService.openFeedForm$.subscribe(() => {
  //     this.openFeedForm();
  //   });
  // }



  // class property
  private feedFormSub?: Subscription;

  async ngOnInit() {
    this.feedFormSub = this.communityService.openFeedForm$.subscribe(() => {
      this.openFeedForm();
    });

    await this.refreshUserDetails();
    this.language = this.userDetails?.Languages || 'English';
    this.loadFamilyActiveMandir();
    this.loadMoreFeed();
    this.loadMangalMudraPoints();
  }

  ngOnDestroy() {
    clearInterval(this.familyMandirSlideTimer);
    clearTimeout(this.toastTimer);
    this.viewObserver?.disconnect();

    clearInterval(this.aartiSeqInterval);
    clearInterval(this.blessingCDInterval);
    clearTimeout(this.flowersAutoStopTimer);
    clearTimeout(this.miniToastTimer);
    this.aartiTimers.forEach(t => clearTimeout(t));
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.stopAllAudio();

    this.feedFormSub?.unsubscribe();
  }


  // async ngOnInit() {
  //   this.userDetails = await this.storage.get('account');
  //   if (this.userDetails?.LoginID) this.userLoggedIn = true;
  //   this.language = this.userDetails?.Languages || 'English';
  //   this.loadFamilyActiveMandir();
  //   this.loadMoreFeed();
  //   this.loadMangalMudraPoints();

  //   this.communityService.openFeedForm$.subscribe(() => {

  //     this.openFeedForm();

  //   });
  // }

  // ngOnDestroy() {
  //   clearInterval(this.familyMandirSlideTimer);
  //   clearTimeout(this.toastTimer);
  //   this.feedGroups.forEach(g => g.items.forEach(i => {
  //     if (i.mediaBlobUrl) URL.revokeObjectURL(i.mediaBlobUrl);
  //   }));
  // }

  goBack() { this.routerCtrl.back(); }
  openPage(p: any) { this.routerCtrl.navigateForward(`/${p}`); }

  // ── Toasts ─────────────────────────────────────────────
  showToast(icon: string, message: string) {
    this.toastIcon = icon;
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  ionViewWillEnter() {
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'none';

    // refresh login state every time the tab is entered
    this.refreshUserDetails();
  }

  private async refreshUserDetails() {
    this.userDetails = await this.storage.get('account');
    this.userLoggedIn = !!this.userDetails?.LoginID;
    this.cdr.markForCheck();
  }
  ionViewWillLeave() {
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }

  // ══════════════════════════════════════════════════════
  // FAMILY MANDIR (top hero + add-your-own form)
  // ══════════════════════════════════════════════════════

  async openFamilyMandirForm() {
    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');


      return;
    }

    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.FamilyMemberList || [];
        if (!list.length) {
          this.showToast('🏠', 'पहले परिवार बनाएं या जॉइन करें');
          this.routerCtrl.navigateForward('/myfamily');
          return;
        }
        this.familyMandir = {
          TenantID: this.userDetails?.TenantID || 1,
          FamilyID: list[0].FamilyID,
          MandirName: '', MandirDescription: '', GodName: '',
          MandirPhoto1: '', MandirPhoto2: '', MandirPhoto3: '',
          AartiName1: '', AartiName2: '', AartiName3: '',
          IsActive: false,
          DateAdded: new Date(), DateModified: new Date(),
          UpdatedByUser: String(userID)
        };
        this.fmPhoto1File = null; this.fmPhoto1Preview = null;
        this.fmPhoto2File = null; this.fmPhoto2Preview = null;
        this.fmPhoto3File = null; this.fmPhoto3Preview = null;
        this.fmAudio1File = null; this.fmAudio1Name = null;
        this.fmAudio2File = null; this.fmAudio2Name = null;
        this.fmAudio3File = null; this.fmAudio3Name = null;
        this.showFamilyMandirForm = true;
      }
    });
  }

  onFmPhotoSelected(event: any, slot: 1 | 2 | 3) {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if (slot === 1) { this.fmPhoto1File = file; this.familyMandir.MandirPhoto1 = ''; reader.onload = (e: any) => this.fmPhoto1Preview = e.target.result; }
    else if (slot === 2) { this.fmPhoto2File = file; this.familyMandir.MandirPhoto2 = ''; reader.onload = (e: any) => this.fmPhoto2Preview = e.target.result; }
    else { this.fmPhoto3File = file; this.familyMandir.MandirPhoto3 = ''; reader.onload = (e: any) => this.fmPhoto3Preview = e.target.result; }
  }

  uploadFmPhoto(slot: 1 | 2 | 3) {
    const file = slot === 1 ? this.fmPhoto1File : slot === 2 ? this.fmPhoto2File : this.fmPhoto3File;
    if (!file) return;
    if (slot === 1) this.fmUploading1 = true;
    else if (slot === 2) this.fmUploading2 = true;
    else this.fmUploading3 = true;

    this.api.uploadImage([file], 'ProfilePhoto', 'mandir', 'ProfilePhoto').subscribe({
      next: (res: any) => {
        const ok = res?.Status === 'Success';
        if (slot === 1) { this.fmUploading1 = false; if (ok) { this.familyMandir.MandirPhoto1 = res.FileName; this.fmPhoto1File = null; this.showToast('📷', 'फ़ोटो 1 अपलोड हुई ✅'); } }
        else if (slot === 2) { this.fmUploading2 = false; if (ok) { this.familyMandir.MandirPhoto2 = res.FileName; this.fmPhoto2File = null; this.showToast('📷', 'फ़ोटो 2 अपलोड हुई ✅'); } }
        else { this.fmUploading3 = false; if (ok) { this.familyMandir.MandirPhoto3 = res.FileName; this.fmPhoto3File = null; this.showToast('📷', 'फ़ोटो 3 अपलोड हुई ✅'); } }
      },
      error: () => {
        if (slot === 1) this.fmUploading1 = false;
        else if (slot === 2) this.fmUploading2 = false;
        else this.fmUploading3 = false;
        this.showToast('❌', 'अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }

  uploadFmAudio(slot: 1 | 2 | 3) {
    const file = slot === 1 ? this.fmAudio1File : slot === 2 ? this.fmAudio2File : this.fmAudio3File;
    if (!file) return;
    if (slot === 1) this.fmUploadingA1 = true;
    else if (slot === 2) this.fmUploadingA2 = true;
    else this.fmUploadingA3 = true;

    this.api.uploadImage([file], 'AartiAudio', 'aarti', 'AartiAudio').subscribe({
      next: (res: any) => {
        const ok = res?.Status === 'Success';
        if (slot === 1) { this.fmUploadingA1 = false; if (ok) { this.familyMandir.AartiName1 = res.FileName; this.fmAudio1File = null; this.showToast('🎵', 'आरती 1 ऑडियो अपलोड हुआ ✅'); } }
        else if (slot === 2) { this.fmUploadingA2 = false; if (ok) { this.familyMandir.AartiName2 = res.FileName; this.fmAudio2File = null; this.showToast('🎵', 'आरती 2 ऑडियो अपलोड हुआ ✅'); } }
        else { this.fmUploadingA3 = false; if (ok) { this.familyMandir.AartiName3 = res.FileName; this.fmAudio3File = null; this.showToast('🎵', 'आरती 3 ऑडियो अपलोड हुआ ✅'); } }
      },
      error: () => {
        if (slot === 1) this.fmUploadingA1 = false;
        else if (slot === 2) this.fmUploadingA2 = false;
        else this.fmUploadingA3 = false;
        this.showToast('❌', 'ऑडियो अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }

  onFmAudioSelected(event: any, slot: 1 | 2 | 3) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (slot === 1) { this.fmAudio1File = file; this.fmAudio1Name = file.name; this.familyMandir.AartiName1 = ''; }
    else if (slot === 2) { this.fmAudio2File = file; this.fmAudio2Name = file.name; this.familyMandir.AartiName2 = ''; }
    else { this.fmAudio3File = file; this.fmAudio3Name = file.name; this.familyMandir.AartiName3 = ''; }
  }

  submitFamilyMandir() {
    if (!this.familyMandir.MandirName.trim()) { this.showToast('⚠️', 'मंदिर का नाम दर्ज करें'); return; }
    if (!this.familyMandir.GodName.trim()) { this.showToast('⚠️', 'देवता का नाम दर्ज करें'); return; }
    if (this.fmPhoto1File) { this.showToast('⚠️', 'फ़ोटो 1 पहले अपलोड करें ⬆'); return; }
    if (this.fmPhoto2File) { this.showToast('⚠️', 'फ़ोटो 2 पहले अपलोड करें ⬆'); return; }
    if (this.fmPhoto3File) { this.showToast('⚠️', 'फ़ोटो 3 पहले अपलोड करें ⬆'); return; }
    if (this.fmAudio1File) { this.showToast('⚠️', 'आरती 1 ऑडियो पहले अपलोड करें ⬆'); return; }
    if (this.fmAudio2File) { this.showToast('⚠️', 'आरती 2 ऑडियो पहले अपलोड करें ⬆'); return; }
    if (this.fmAudio3File) { this.showToast('⚠️', 'आरती 3 ऑडियो पहले अपलोड करें ⬆'); return; }

    this.isSubmittingFamilyMandir = true;
    this.familyMandir.DateModified = new Date();

    this.apinu.postUrlData('FamilyMandirInsert', this.familyMandir).subscribe({
      next: () => {
        this.isSubmittingFamilyMandir = false;
        this.showFamilyMandirForm = false;
        this.showToast('🛕', 'मंदिर जमा हुआ! Admin अनुमोदन के बाद दिखेगा 🙏');
        this.loadFamilyActiveMandir();
      },
      error: () => {
        this.isSubmittingFamilyMandir = false;
        this.showToast('❌', 'कुछ गलत हुआ, पुनः प्रयास करें');
      }
    });
  }

  loadFamilyActiveMandir() {
    const userID = this.userDetails?.UserID;
    if (!userID) return;

    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.FamilyMemberList || [];
        if (!list.length) return;

        const familyID = list[0].FamilyID;
        this.apinu.postUrlData(
          `FamilyMandirSelectByQuery?Query=FamilyID=${familyID} AND IsActive=1`, null
        ).subscribe({
          next: (r: any) => {
            const mandirs = r.FamilyMandirList || [];
            if (!mandirs.length) return;

            this.familyActiveMandir = mandirs[0];
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto1, 1);
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto2, 2);
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto3, 3);
            this.startFamilyMandirSlideshow();
          }
        });
      }
    });
  }

  private loadFamilyMandirPhotoSlot(filename: string, slot: 1 | 2 | 3) {
    if (!filename) return;
    this.api.getImage('DownloadImages', {
      imageName: filename, imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (!blob?.type?.startsWith('image/')) return;
        const url = URL.createObjectURL(blob);
        if (slot === 1) this.familyMandirPhotoUrl = url;
        else if (slot === 2) this.familyMandirPhoto2Url = url;
        else this.familyMandirPhoto3Url = url;
      }
    });
  }

  private startFamilyMandirSlideshow() {
    clearInterval(this.familyMandirSlideTimer);
    this.familyMandirSlideTimer = setInterval(() => {
      const count = [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
        .filter(p => !!p).length;
      if (count > 1) {
        this.familyMandirSlideIndex = (this.familyMandirSlideIndex + 1) % count;
      }
    }, 4000);
  }

  get currentFamilyMandirPhoto(): string | null {
    const photos = [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
      .filter(p => !!p);
    return photos[this.familyMandirSlideIndex] || null;
  }

  get familyMandirPhotoCount(): number {
    return [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
      .filter(p => !!p).length;
  }

  // ══════════════════════════════════════════════════════
  // FEED REELS — date-grouped, infinite scroll
  // ══════════════════════════════════════════════════════

  // onFeedInfiniteScroll(event: any) {
  //   this.loadMoreFeed().then(() => {
  //     event.target.complete();
  //     if (this.feedAllLoaded) {
  //       event.target.disabled = true;
  //     }
  //   });
  // }


  async loadMoreFeed() {
    if (this.feedLoading || this.feedAllLoaded) return;
    this.feedLoading = true;
    try {
      if (!this.feedWindowEnd) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.feedWindowEnd = tomorrow;
      }

      const windowEnd = this.feedWindowEnd;
      const windowStart = new Date(windowEnd);
      windowStart.setDate(windowStart.getDate() - this.feedWindowDays);

      const startStr = this.toDateKey(windowStart.toISOString());
      const endStr = this.toDateKey(windowEnd.toISOString());

      const langCondition = this.buildLanguageCondition();

      // Mirrors: CAST(DateAdded as date) >= startStr AND CAST(DateAdded as date) < endStr
      const query =
        `IsActive=1 AND IsDeleted=0 ` +
        `AND CAST(PublishDate as date) >= '${startStr}' AND CAST(PublishDate as date) < '${endStr}' ` +
        `AND (SourceTable='Feed' OR (${langCondition}))`;

      const res: any = await firstValueFrom(
        this.apinu.postUrlData(`FeedSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      );
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const list: FeedItem[] = parsed?.FeedList || [];
      list.sort((a, b) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime());

      this.appendFeedBatch(list);
      this.feedWindowEnd = windowStart;

      if (!list.length) {
        this.feedEmptyWindowStreak++;
        if (this.feedEmptyWindowStreak >= this.feedMaxEmptyWindows) {
          this.feedAllLoaded = true;
        }
      } else {
        this.feedEmptyWindowStreak = 0;
      }
    } catch (e) {
      console.error('loadMoreFeed failed:', e);
    } finally {
      this.feedLoading = false;
    }
  }

  /** Builds a SQL fragment that filters Title/Description by script,
   * based on this.language ('Hindi' vs everything else = English).
   * Uses a Devanagari Unicode range check with a binary collation so the
   * range comparison is by raw code point, not linguistic sort order. */
  private buildLanguageCondition(): string {
    const isHindi = this.language === 'Hindi' || this.language === 'हिंदी';

    return isHindi
      ? `(Title LIKE N'%[ऀ-ॿ]%' COLLATE Latin1_General_100_BIN2 OR Description LIKE N'%[ऀ-ॿ]%' COLLATE Latin1_General_100_BIN2)`
      : `(Title NOT LIKE N'%[ऀ-ॿ]%' COLLATE Latin1_General_100_BIN2 AND Description NOT LIKE N'%[ऀ-ॿ]%' COLLATE Latin1_General_100_BIN2)`;
  }


  // async loadMoreFeed() {
  //   if (this.feedLoading || this.feedAllLoaded) return;
  //   this.feedLoading = true;
  //   try {
  //     if (!this.feedWindowEnd) {
  //       // First window: include today, so the exclusive upper bound is tomorrow.
  //       // e.g. today=19 Jul, feedWindowDays=5 -> covers 15 Jul (inclusive) .. 20 Jul (exclusive)
  //       const tomorrow = new Date();
  //       tomorrow.setDate(tomorrow.getDate() + 1);
  //       this.feedWindowEnd = tomorrow;
  //     }

  //     const windowEnd = this.feedWindowEnd;
  //     const windowStart = new Date(windowEnd);
  //     windowStart.setDate(windowStart.getDate() - this.feedWindowDays);

  //     const startStr = this.toDateKey(windowStart.toISOString());
  //     const endStr = this.toDateKey(windowEnd.toISOString());

  //     // Mirrors: CAST(DateAdded as date) >= startStr AND CAST(DateAdded as date) < endStr
  //     const query =
  //       `(MediaURL <> '' OR ThumbnailURL <> '') AND IsActive=1 AND IsDeleted=0 AND CAST(DateAdded as date) >= '${startStr}' AND CAST(DateAdded as date) < '${endStr}'`;

  //     const res: any = await firstValueFrom(
  //       this.apinu.postUrlData(`FeedSelectByQuery?Query=${encodeURIComponent(query)}`, null)
  //     );
  //     const parsed = typeof res === 'string' ? JSON.parse(res) : res;
  //     const list: FeedItem[] = parsed?.FeedList || [];
  //     list.sort((a, b) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime());

  //     this.appendFeedBatch(list);

  //     // Move the window back for the next scroll trigger.
  //     this.feedWindowEnd = windowStart;

  //     if (!list.length) {
  //       this.feedEmptyWindowStreak++;
  //       if (this.feedEmptyWindowStreak >= this.feedMaxEmptyWindows) {
  //         this.feedAllLoaded = true;
  //       }
  //     } else {
  //       this.feedEmptyWindowStreak = 0;
  //     }
  //   } catch (e) {
  //     console.error('loadMoreFeed failed:', e);
  //   } finally {
  //     this.feedLoading = false;
  //   }
  // }

  // private appendFeedBatch(batch: FeedItem[]) {
  //   batch.forEach(item => {
  //     const dateKey = this.toDateKey(item.PublishDate || item.DateAdded);
  //     let group = this.feedGroups.find(g => g.dateKey === dateKey);
  //     if (!group) {
  //       group = { dateKey, dateLabel: this.toDateLabel(dateKey), items: [] };
  //       this.feedGroups.push(group);
  //       this.feedGroups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  //       this.loadPanchangImageForGroup(group);
  //     }
  //     group.items.push(item);
  //     this.loadFeedMedia(item);
  //   });
  // }

  private appendFeedBatch(batch: FeedItem[]) {
    batch.forEach(item => {
      const dateKey = this.toDateKey(item.PublishDate || item.DateAdded);
      let group = this.feedGroups.find(g => g.dateKey === dateKey);
      if (!group) {
        group = { dateKey, dateLabel: this.toDateLabel(dateKey), items: [] };
        this.feedGroups.push(group);
        this.feedGroups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
        this.loadPanchangImageForGroup(group);
      }
      group.items.push(item);
      this.loadFeedEngagementCounts(item);
    });
    this.observeFeedCards();
  }

  private loadFeedEngagementCounts(item: FeedItem) {
    const userID = this.userDetails?.UserID || 0;
    this.apinu.postUrlData(
      `FeedEngagementCount_Select?FeedID=${item.FeedID}&UserID=${userID}`, null
    ).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        const row = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!row) return;
        item.likeCount = row.LikeCount ?? 0;
        item.commentCount = row.CommentCount ?? 0;
        item.shareCount = row.ShareCount ?? 0;
        item.viewCount = row.ViewCount ?? 0;
        item.isLiked = !!row.IsLikedByUser;
        item.myFeedLikeID = row.MyFeedLikeID || undefined;
      },
      error: () => { /* leave counts undefined; template shows 0 */ }
    });
  }


  toggleLike(item: FeedItem) {
    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');

      return;
    }
    if (item.isLikeInFlight) return;
    item.isLikeInFlight = true;

    if (item.isLiked && item.myFeedLikeID) {
      // Optimistic UI first
      const prevCount = item.likeCount ?? 0;
      item.isLiked = false;
      item.likeCount = Math.max(0, prevCount - 1);
      const likeIDToDelete = item.myFeedLikeID;
      item.myFeedLikeID = undefined;

      this.apinu.postUrlData(
        `FeedLikeDelete?feedLikeID=${likeIDToDelete}&tenantID=${this.userDetails?.TenantID || 1}`, null
      ).subscribe({
        next: () => { item.isLikeInFlight = false; },
        error: () => {
          // revert on failure
          item.isLiked = true;
          item.likeCount = prevCount;
          item.myFeedLikeID = likeIDToDelete;
          item.isLikeInFlight = false;
        }
      });
    } else {
      const prevCount = item.likeCount ?? 0;
      item.isLiked = true;
      item.likeCount = prevCount + 1;

      const feedLike = { FeedID: item.FeedID, UserID: userID, DateAdded: new Date() };
      this.apinu.postUrlData('FeedLikeInsert', feedLike).subscribe({
        next: (res: any) => {
          item.myFeedLikeID = res.FeedLikeID;
          item.isLikeInFlight = false;
        },
        error: () => {
          item.isLiked = false;
          item.likeCount = prevCount;
          item.isLikeInFlight = false;
        }
      });
    }
  }

  // shareFeed(item: FeedItem, shareType: string = 'WhatsApp') {
  //   const userID = this.userDetails?.UserID || 0;
  //   const feedShare = { FeedID: item.FeedID, UserID: userID, ShareType: shareType, SharedOn: new Date() };
  //   this.apinu.postUrlData('FeedShareInsert', feedShare).subscribe({
  //     next: () => { item.shareCount = (item.shareCount ?? 0) + 1; },
  //     error: () => { /* silent — share UI already happened via native share sheet */ }
  //   });

  //   // Trigger the actual OS share sheet / WhatsApp deep link here, e.g.:
  //   const shareUrl = `https://app.mangalbhav.com/feed/${item.FeedID}`;
  //   if ((navigator as any).share) {
  //     (navigator as any).share({ title: item.Title, url: shareUrl }).catch(() => { });
  //   } else {
  //     window.open(`https://wa.me/?text=${encodeURIComponent(item.Title + ' ' + shareUrl)}`, '_blank');
  //   }
  // }

  private viewObserver?: IntersectionObserver;

  ngAfterViewInit() {
    this.viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const feedID = Number(entry.target.getAttribute('data-feed-id'));
            const item = this.findFeedItemById(feedID);
            if (item && !item.hasBeenViewed && this.userDetails?.UserID) {
              item.hasBeenViewed = true;
              this.recordFeedView(item);
            }
          }
        });
      },
      { threshold: 0.5 }   // fires once at least 50% of the card is visible
    );

    // Observe cards as they render; re-run this after each appendFeedBatch too
    this.observeFeedCards();
    this.initCanvas();
  }



  private observeFeedCards() {
    setTimeout(() => {
      document.querySelectorAll('.reel-card[data-feed-id]').forEach(el => {
        this.viewObserver?.observe(el);
      });
    }, 100); // slight delay so *ngFor has rendered the new cards
  }

  private findFeedItemById(feedID: number): FeedItem | undefined {
    for (const group of this.feedGroups) {
      const found = group.items.find(i => i.FeedID === feedID);
      if (found) return found;
    }
    return undefined;
  }

  private recordFeedView(item: FeedItem) {
    const userID = this.userDetails?.UserID || 0;
    if (!userID) return;
    const feedView = { FeedID: item.FeedID, UserID: userID, ViewedOn: new Date() };
    this.apinu.postUrlData('FeedViewInsert', feedView).subscribe({
      next: () => { item.viewCount = (item.viewCount ?? 0) + 1; },
      error: () => { item.hasBeenViewed = false; /* allow retry on error */ }
    });
  }

  // ngOnDestroy() {
  //   clearInterval(this.familyMandirSlideTimer);
  //   clearTimeout(this.toastTimer);
  //   this.viewObserver?.disconnect();

  //   // ── added back for Mangal Aarti ──
  //   clearInterval(this.aartiSeqInterval);
  //   clearInterval(this.blessingCDInterval);
  //   clearTimeout(this.flowersAutoStopTimer);
  //   clearTimeout(this.miniToastTimer);
  //   this.aartiTimers.forEach(t => clearTimeout(t));
  //   if (this.animationId) cancelAnimationFrame(this.animationId);
  //   this.stopAllAudio();
  // }


  loadMangalMudraPoints() {
    if (this.userDetails?.UserID) {
      this.apinu.postUrlData(`FamilyMangalMudraPointsSelectByQuery?Query=UserID=${this.userDetails?.UserID}`, null)
        .subscribe((res: any) => {
          const result = res.FamilyMangalMudraPointList || [];
          this.MangalMudraPoints = 0;
          result.forEach((item: any) => {
            this.MangalMudraPoints += Number(item.PointsCount || 0);
          });
        });
    }
  }

  // ── Audio helper ───────────────────────────────────────
  private playAudio(currentRef: HTMLAudioElement | null, src: string, onEnded?: () => void): HTMLAudioElement {
    if (currentRef) { currentRef.pause(); currentRef.currentTime = 0; currentRef.onended = null; }
    const audio = new Audio(src);
    if (onEnded) audio.onended = onEnded;
    audio.play()?.catch(() => { });
    return audio;
  }

  private stopAllAudio() {
    [this.shankhAudio, this.bellAudio, this.aartiBhajan].forEach(a => {
      if (a) { a.pause(); a.onended = null; }
    });
    this.shankhAudio = null; this.bellAudio = null; this.aartiBhajan = null;
    this.bellRinging = false;
  }

  // ── Canvas / flowers ────────────────────────────────────
  initCanvas() {
    this.canvas = document.getElementById('flowerCanvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    const container = document.querySelector('.hanuman-container') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width);
    this.canvas.height = Math.round(rect.height);
    this.ctx = this.canvas.getContext('2d');
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private startFlowers(type: 'flowers' | 'petals' = 'flowers') {
    this.initCanvas();
    if (!this.canvas || !this.ctx) return;
    const emojis = type === 'flowers' ? ['🌸', '🌺', '🌼', '🌻', '🪷', '🌹'] : ['🌸', '🪷', '🌸', '🌺'];
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = 0; }
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20 - Math.random() * 120,
        size: 16 + Math.random() * 12,
        speed: 1.8 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: 1,
      });
    }
    this.animateCanvas();
  }

  private animateCanvas() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter(p => p.y < this.canvas!.height + 30 && p.opacity > 0.05);
    for (const p of this.particles) {
      p.y += p.speed; p.x += p.drift; p.rotation += p.rotSpeed;
      if (p.y > this.canvas.height * 0.65) p.opacity -= 0.012;
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.font = `${p.size}px serif`;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillText(p.emoji, 0, 0);
      this.ctx.restore();
    }
    this.ctx.globalAlpha = 1;
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animateCanvas());
    } else {
      this.animationId = 0;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private stopFlowers() {
    clearTimeout(this.flowersAutoStopTimer);
    this.particles.forEach(p => { p.opacity = Math.min(p.opacity, 0.25); });
    this.flowersAutoStopTimer = setTimeout(() => {
      this.particles = [];
      if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = 0; }
      if (this.canvas && this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, 700);
  }

  // ── 21-Second Mangal Aarti ─────────────────────────────
  // startMangalAarti() {
  //   if (this.aartiPhase !== 'idle') return;
  //   this.hideChrome();
  //   this.aartiPhase = 'running';
  //   this.isGlowing = true;
  //   this.aartiProgress = 0;
  //   this.aartiTimers = [];

  //   const startTime = Date.now();
  //   const TOTAL_MS = 34000;

  //   this.aartiSeqInterval = setInterval(() => {
  //     const elapsed = Date.now() - startTime;
  //     this.aartiProgress = Math.min(100, (elapsed / TOTAL_MS) * 100);
  //   }, 100);

  //   this.aartiSequence.forEach(item => {
  //     const t = setTimeout(() => {
  //       if (this.aartiPhase !== 'running') return;
  //       if (item.action !== 'complete') this.currentAartiStepData = item.step;

  //       switch (item.action) {
  //         case 'bell':
  //           this.bellRinging = true;
  //           this.bellAudio = this.playAudio(this.bellAudio, 'assets/audio/bell.mp3', () => { this.bellAudio = null; });
  //           setTimeout(() => { this.bellRinging = false; }, 1800);
  //           break;
  //         case 'shankh':
  //           if (this.bellAudio) { this.bellAudio.pause(); this.bellAudio = null; }
  //           this.shankhAudio = this.playAudio(null, 'assets/audio/shankh.mp3', () => { this.shankhAudio = null; });
  //           break;
  //         case 'bhajan':
  //           if (this.shankhAudio) { this.shankhAudio.pause(); this.shankhAudio = null; }
  //           this.aartiBhajan = this.playAudio(null, 'assets/audio/aarti_bhajan.mp3', () => { this.aartiBhajan = null; });
  //           break;
  //         case 'stop_bhajan':
  //           if (this.aartiBhajan) {
  //             const fadeOut = setInterval(() => {
  //               if (!this.aartiBhajan) { clearInterval(fadeOut); return; }
  //               this.aartiBhajan.volume = Math.max(0, this.aartiBhajan.volume - 0.1);
  //               if (this.aartiBhajan.volume <= 0) {
  //                 this.aartiBhajan.pause();
  //                 this.aartiBhajan = null;
  //                 clearInterval(fadeOut);
  //               }
  //             }, 80);
  //           }
  //           break;
  //         case 'flowers':
  //           this.startFlowers('flowers');
  //           break;
  //         case 'petals':
  //           this.startFlowers('petals');
  //           break;
  //         case 'complete':
  //           this.completeAarti();
  //           break;
  //       }
  //     }, item.time);
  //     this.aartiTimers.push(t);
  //   });
  // }


  startMangalAarti() {
    if (this.aartiPhase !== 'idle') return;

    this.showbottomAndHeader = false;   // Hide header & bottom

    this.hideChrome();
    this.aartiPhase = 'running';
    this.isGlowing = true;
    this.aartiProgress = 0;
    this.aartiTimers = [];

    const startTime = Date.now();
    const TOTAL_MS = 34000;

    this.aartiSeqInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.aartiProgress = Math.min(100, (elapsed / TOTAL_MS) * 100);
    }, 100);

    this.aartiSequence.forEach(item => {
      const t = setTimeout(() => {
        if (this.aartiPhase !== 'running') return;
        if (item.action !== 'complete') this.currentAartiStepData = item.step;

        switch (item.action) {
          case 'bell':
            this.bellRinging = true;
            this.bellAudio = this.playAudio(this.bellAudio, 'assets/audio/bell.mp3', () => {
              this.bellAudio = null;
            });
            setTimeout(() => {
              this.bellRinging = false;
            }, 1800);
            break;

          case 'shankh':
            if (this.bellAudio) {
              this.bellAudio.pause();
              this.bellAudio = null;
            }
            this.shankhAudio = this.playAudio(null, 'assets/audio/shankh.mp3', () => {
              this.shankhAudio = null;
            });
            break;

          case 'bhajan':
            if (this.shankhAudio) {
              this.shankhAudio.pause();
              this.shankhAudio = null;
            }
            this.aartiBhajan = this.playAudio(null, 'assets/audio/aarti_bhajan.mp3', () => {
              this.aartiBhajan = null;
            });
            break;

          case 'stop_bhajan':
            if (this.aartiBhajan) {
              const fadeOut = setInterval(() => {
                if (!this.aartiBhajan) {
                  clearInterval(fadeOut);
                  return;
                }
                this.aartiBhajan.volume = Math.max(0, this.aartiBhajan.volume - 0.1);
                if (this.aartiBhajan.volume <= 0) {
                  this.aartiBhajan.pause();
                  this.aartiBhajan = null;
                  clearInterval(fadeOut);
                }
              }, 80);
            }
            break;

          case 'flowers':
            this.startFlowers('flowers');
            break;

          case 'petals':
            this.startFlowers('petals');
            break;

          case 'complete':
            this.completeAarti();
            break;
        }
      }, item.time);

      this.aartiTimers.push(t);
    });
  }

  stopMangalAarti() {
    if (this.aartiPhase !== 'running') return;
    this.aartiTimers.forEach(t => clearTimeout(t));
    this.aartiTimers = [];
    clearInterval(this.aartiSeqInterval);
    this.aartiProgress = 0;
    this.aartiPhase = 'idle';
    this.isGlowing = false;
    this.bellRinging = false;
    this.stopFlowers();
    this.stopAllAudio();
    this.showChrome();
    this.showMiniToast('आरती रोकी गई');
    this.showbottomAndHeader = true;
  }

  private completeAarti() {
    this.aartiTimers = [];
    clearInterval(this.aartiSeqInterval);
    this.aartiProgress = 100;
    this.aartiPhase = 'blessed';
    this.isGlowing = false;
    this.stopAllAudio();
    this.stopFlowers();
    this.showChrome();

    this.saveMangalMudraPoints();

    this.blessingCountdown = 30;
    this.blessingCDInterval = setInterval(() => {
      this.blessingCountdown--;
      if (this.blessingCountdown <= 0) {
        clearInterval(this.blessingCDInterval);
        this.aartiPhase = 'idle';
        this.aartiProgress = 0;
        this.showbottomAndHeader = true;
      }
    }, 1000);
  }

  saveMangalMudraPoints() {
    const userID = this.userDetails?.UserID;
    const tenantID = this.userDetails?.TenantID || 1;

    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.FamilyMemberList || [];
        const payload = {
          TenantID: tenantID,
          FamilyID: list.length > 0 ? list[0].FamilyID : 0,
          UserID: userID,
          PointsCount: String(21),
          IsActive: true,
          DateAdded: new Date(),
          DateModified: new Date(),
          UpdatedByUser: userID.toString()
        };
        this.apinu.postUrlData('FamilyMangalMudraPointsInsert', payload).subscribe({
          next: () => this.loadMangalMudraPoints(),
          error: () => this.loadMangalMudraPoints()
        });
      }
    });
  }

  showMiniToast(message: string) {
    this.miniToastMessage = message;
    this.miniToastVisible = true;
    clearTimeout(this.miniToastTimer);
    this.miniToastTimer = setTimeout(() => { this.miniToastVisible = false; }, 2000);
  }


  @ViewChild(IonContent)
  pageContent!: IonContent;

  scrollToTop() {
    this.pageContent.scrollToTop(500);
  }

  private hideChrome() {
    this.chromeHidden = true;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'none';
  }

  private showChrome() {
    this.chromeHidden = false;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }

  /** Maps a Feed row's SourceTable to the imagePurpose the backend's
   * getServerPathByPurpose() expects, so the file is looked up in the
   * right assets subfolder. */
  private getImagePurposeForFeedItem(item: FeedItem): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Mandir': return 'ProfilePhoto';
      case 'Profile': return 'ProfilePhoto';
      case 'Service': return 'PoojaPhoto';
      case 'Booking': return 'PoojaPhoto';
      case 'Feed': return 'feed';
      default: return 'feed';
    }
  }

  private loadFeedMedia(item: FeedItem) {
    if (!item.MediaURL || item.mediaBlobUrl) return;
    const imagePurpose = this.getImagePurposeForFeedItem(item);
    this.api.getImage('DownloadImages', {
      imageName: item.MediaURL, imagePurpose
    }).subscribe({
      next: (blob: any) => { item.mediaBlobUrl = URL.createObjectURL(blob); },
      error: () => { /* leave placeholder */ }
    });
  }

  private toDateKey(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private toDateLabel(dateKey: string): string {
    const today = this.toDateKey(new Date().toISOString());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = this.toDateKey(yesterday.toISOString());

    if (dateKey === today) return '🪔 आज';
    if (dateKey === yKey) return 'कल';

    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ══════════════════════════════════════════════════════
  // PANCHANG — rendered inline as an image per feed date
  // ══════════════════════════════════════════════════════

  async loadPanchangImageForGroup(group: FeedDateGroup) {
    if (group.panchangImage || group.panchangLoading) return;
    group.panchangLoading = true;
    try {
      if (this.panchangKeyOrder.size === 0) {
        await this.loadPanchangMasterOrder();
      }
      const list = await this.fetchPanchangListForDate(group.dateKey);
      if (!list.length) return;

      const html = await this.buildPanchangHtmlFromList(list);
      if (!html) return;

      group.panchangImage = await this.rasterizePanchangHtml(html);
    } catch (e) {
      console.error('panchang image load failed:', e);
    } finally {
      group.panchangLoading = false;
    }
  }

  private fetchPanchangListForDate(dateKey: string): Promise<any[]> {
    return new Promise((resolve) => {
      const query =
        `PanchangDate >= '${dateKey} 00:00:00.000' AND PanchangDate < '${this.nextDateKey(dateKey)} 00:00:00.000'`;
      this.apinu.postUrlData(
        `DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`, null
      ).subscribe({
        next: (res: any) => {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          resolve(parsed?.DailyPanchangList || parsed || []);
        },
        error: () => resolve([])
      });
    });
  }

  private nextDateKey(dateKey: string): string {
    const d = new Date(dateKey + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return this.toDateKey(d.toISOString());
  }

  private loadPanchangMasterOrder(): Promise<void> {
    return new Promise((resolve) => {
      this.apinu.postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`Domain='Panchang'`)}`,
        null
      ).subscribe({
        next: (res: any) => {
          const list = typeof res.MasterDataList === 'string'
            ? JSON.parse(res.MasterDataList)
            : res.MasterDataList;

          const sections = list.filter((m: any) => !m.ParentItemID);
          const keysAll = list.filter((m: any) => !!m.ParentItemID);

          let idx = 0;
          sections.forEach((s: any) => {
            keysAll
              .filter((k: any) => k.ParentItemID === s.MasterDataID)
              .forEach((k: any) => {
                this.panchangKeyOrder.set(`${s.Identifier}|${k.Identifier}`, idx++);
              });
          });
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  /** Builds the panchang HTML (from assets/panchang/index.html template) for a given data list. */
  private async buildPanchangHtmlFromList(list: any[]): Promise<string | null> {
    try {
      const templateHtml = await firstValueFrom(
        this.http.get('assets/panchang/index.html', { responseType: 'text' })
      );
      if (!templateHtml) return null;

      const doc = new DOMParser().parseFromString(templateHtml, 'text/html');
      const sectionMap = new Map<string, Array<{ key: string, value1: string }>>();

      list.forEach((item: any) => {
        const section = (item.SectionHeading || '').trim();
        const key = (item.Key1 || '').trim();
        const value = item.Value1 != null ? String(item.Value1).trim() : '';
        if (!section) return;
        if (!sectionMap.has(section)) sectionMap.set(section, []);
        if (key || value) sectionMap.get(section)!.push({ key, value1: value });
      });

      const first = list[0];
      if (first) {
        const dateEl = doc.getElementById('panchang-date');
        const locEl = doc.getElementById('panchang-location');
        if (dateEl && first.PanchangDate) {
          dateEl.textContent = new Date(first.PanchangDate).toLocaleDateString('hi-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
          });
        }
        if (locEl) locEl.textContent = first.Location || '';
      }

      const sectionContainers = doc.querySelectorAll<HTMLElement>('[data-section]');
      sectionContainers.forEach(container => {
        const sectionName = container.getAttribute('data-section')?.trim();
        if (!sectionName || !sectionMap.has(sectionName)) return;

        const items = sectionMap.get(sectionName)!
          .slice()
          .sort((a, b) => {
            const ai = this.panchangKeyOrder.get(`${sectionName}|${a.key}`) ?? 9999;
            const bi = this.panchangKeyOrder.get(`${sectionName}|${b.key}`) ?? 9999;
            return ai - bi;
          });

        if (container.hasAttribute('data-key')) {
          const key = container.getAttribute('data-key')?.trim();
          const match = items.find(i => i.key === key);
          container.textContent = match?.value1 || '—';
          return;
        }

        container.innerHTML = '';
        const makeRow = (item: { key: string; value1: string }) => {
          const row = doc.createElement('div');
          row.className = 'kv-row';
          const labelDiv = doc.createElement('div');
          labelDiv.className = 'label';
          if (item.key) {
            const icon = this.PANCHANG_ICON_MAP[item.key] || '◆';
            const sep = sectionName === 'ग्रह स्थिति' ? ' —' : ':';
            labelDiv.innerHTML = `<span class="ico">${icon}</span>${item.key}${sep}`;
          }
          const valDiv = doc.createElement('div');
          valDiv.className = 'val';
          valDiv.textContent = item.value1 || '—';
          row.appendChild(labelDiv);
          row.appendChild(valDiv);
          return row;
        };

        if (this.TWO_COL_SECTIONS.includes(sectionName)) {
          container.style.display = 'flex';
          container.style.flexDirection = 'row';
          container.style.gap = '18px';
          const half = Math.ceil(items.length / 2);
          const leftCol = doc.createElement('div');
          leftCol.style.cssText = 'flex:1; display:flex; flex-direction:column;';
          const rightCol = doc.createElement('div');
          rightCol.style.cssText = 'flex:1; display:flex; flex-direction:column;';
          items.slice(0, half).forEach(item => leftCol.appendChild(makeRow(item)));
          items.slice(half).forEach(item => rightCol.appendChild(makeRow(item)));
          container.appendChild(leftCol);
          container.appendChild(rightCol);
        } else {
          items.forEach(item => container.appendChild(makeRow(item)));
        }
      });

      doc.querySelectorAll<HTMLImageElement>('img').forEach(img => {
        const src = img.getAttribute('src') || '';
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          img.setAttribute('src', `assets/panchang/${src}`);
        }
      });

      return `<!DOCTYPE html><html>${doc.documentElement.innerHTML}</html>`;
    } catch (err) {
      console.error('Error building panchang html:', err);
      return null;
    }
  }

  /** Renders a panchang HTML string into an image via an offscreen iframe + html2canvas. */
  private async rasterizePanchangHtml(html: string): Promise<string> {
    const CAPTURE_WIDTH = 1100;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = `${CAPTURE_WIDTH}px`;
    iframe.style.height = '1000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow!.document;
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise(resolve => setTimeout(resolve, 800));

    const sheetEl = doc.querySelector('.sheet') as HTMLElement;
    const actualHeight = sheetEl ? sheetEl.getBoundingClientRect().height + 24 : doc.body.scrollHeight;
    iframe.style.height = `${actualHeight}px`;

    const canvas = await html2canvas(doc.body, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      width: CAPTURE_WIDTH, height: actualHeight,
      windowWidth: CAPTURE_WIDTH, windowHeight: actualHeight,
    });

    document.body.removeChild(iframe);
    return canvas.toDataURL('image/png');
  }

  imgBaseUrl = 'https://app.mangalbhav.com/assets';

  /** Maps a Feed row's SourceTable directly to the actual static folder
   * name used on the server (per getServerPathByPurpose), NOT the
   * imagePurpose string — some purposes (e.g. PoojaPhoto -> "img") don't
   * match their folder name 1:1. */
  private getFeedMediaFolder(item: FeedItem): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Mandir': return 'ProfilePhoto';
      case 'Profile': return 'ProfilePhoto';
      case 'Service': return 'img';        // PoojaPhoto purpose -> "img" folder
      case 'Booking': return 'img';        // ⚠️ confirm: should this be 'BookingPhoto' instead?
      case 'Feed': return 'feed';
      default: return 'feed';
    }
  }

  /** Builds a direct static URL for a feed item's media, bypassing the
   * DownloadImages API + blob conversion entirely. */
  brokenMedia = new Set<number>(); // or string, matching item.ID type

  hasFeedMedia(item: FeedItem): boolean {
    return !!item.MediaURL && item.MediaURL.trim() !== '' && item.MediaURL !== 'null';
  }

  getFeedMediaPath(item: FeedItem): string {
    const folder = this.getFeedMediaFolder(item);
    //console.log(`${this.imgBaseUrl}/${folder}/${item.MediaURL}`)
    return `${this.imgBaseUrl}/${folder}/${item.MediaURL}`;
  }


  onMediaError(item: FeedItem): void {
    this.brokenMedia.add(item.FeedID);
    this.cdr.markForCheck();
  }

  // ── Comments (bottom sheet) ────────────────────────────
  showCommentsSheet = false;
  activeCommentFeedID: number | null = null;
  activeCommentFeedTitle = '';
  commentsList: any[] = [];
  commentsLoading = false;
  newCommentText = '';
  isSubmittingComment = false;

  openComments(item: FeedItem) {
    this.activeCommentFeedID = item.FeedID;
    this.activeCommentFeedTitle = item.Title;
    this.commentsList = [];
    this.newCommentText = '';
    this.showCommentsSheet = true;
    this.loadComments(item.FeedID);
  }

  closeComments() {
    this.showCommentsSheet = false;
    this.activeCommentFeedID = null;
    this.commentsList = [];
  }

  loadComments(feedID: number) {
    this.commentsLoading = true;
    const query = `FeedID=${feedID} AND IsDeleted=0`;
    this.apinu.postUrlData(
      `FeedCommentSelectByQuery?Query=${encodeURIComponent(query)}`, null
    ).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        this.commentsList = (parsed?.FeedCommentList || [])
          .sort((a: any, b: any) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime());
        this.commentsLoading = false;
      },
      error: () => { this.commentsLoading = false; }
    });
  }

  async submitComment() {
    const text = this.newCommentText.trim();
    if (!text || !this.activeCommentFeedID) return;

    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');


      return;
    }

    this.isSubmittingComment = true;
    const feedComment = {
      FeedID: this.activeCommentFeedID,
      UserID: userID,
      Comment: text,
      IsDeleted: false,
      DateAdded: new Date(),
      DateModified: new Date()
    };

    this.apinu.postUrlData('FeedCommentInsert', feedComment).subscribe({
      next: (res: any) => {
        this.isSubmittingComment = false;
        this.newCommentText = '';
        // Prepend locally so it shows instantly without a re-fetch
        this.commentsList.unshift({
          FeedCommentID: res.FeedCommentID,
          FeedID: this.activeCommentFeedID,
          UserID: userID,
          UserName: this.userDetails?.Name || 'आप',
          Comment: text,
          DateAdded: new Date().toISOString()
        });
        // Bump the count on the underlying feed item too
        const item = this.findFeedItemById(this.activeCommentFeedID!);
        if (item) item.commentCount = (item.commentCount ?? 0) + 1;
      },
      error: () => {
        this.isSubmittingComment = false;
        this.showToast('❌', 'कमेंट पोस्ट नहीं हुआ, पुनः प्रयास करें');
      }
    });
  }

  // ── Feed / Post (create form) ──────────────────────────
  showFeedForm = false;
  isSubmittingFeed = false;

  Feed = {
    FeedID: -1,
    TenantID: '' as any,
    UserID: '' as any,
    Title: '',
    Description: '',
    MediaType: '',
    PostType: '',
    MediaURL: '',
    ThumbnailURL: '',
    Duration: 0,
    DisplayOrder: 1,
    PublishDate: new Date(),
    IsActive: true,
    IsDeleted: true,
    IsAdminPost: true,
    DateAdded: new Date(),
    DateModified: new Date(),
    UpdatedByUser: '',
    SourceTable: 'Feed',
    SourceID: 0,
    UserName: '',
    UserPhoto: '',
    FeedCategory: 'Feed',
    Location: '',
    Amount: 0,
    IsAutoGenerated: true,
  };

  feedMediaFile: File | null = null;
  feedMediaPreview: string | null = null;
  feedMediaKind: 'image' | 'video' | null = null;
  isUploadingFeedMedia = false;

  // ── Open form — reset Feed model ──────────────────────
  async openFeedForm() {


    const isAdmin = await this.storage.get('adminloggedin') == 'true';
    const userID = isAdmin ? 0 : this.userDetails?.UserID;

    if (!userID && !isAdmin) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');


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
      IsAdminPost: isAdmin ? true : false,
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

  // ── Media select — detect image vs video from file.type ──
  // onFeedMediaSelected(event: any) {
  //   const file: File = event.target.files[0];
  //   if (!file) return;

  //   this.feedMediaKind = file.type.startsWith('video/') ? 'video' : 'image';
  //   this.feedMediaFile = file;
  //   this.Feed.MediaURL = '';
  //   this.Feed.MediaType = this.feedMediaKind === 'video' ? 'Video' : 'Image';

  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = (e: any) => this.feedMediaPreview = e.target.result;
  //   this.uploadFeedMedia();
  // }

  onFeedMediaSelected(event: any) {

    const file: File = event.target.files[0];
    if (!file) return;

    this.feedMediaFile = file;

    this.feedMediaKind = file.type.startsWith('video')
      ? 'video'
      : 'image';

    const reader = new FileReader();

    reader.onload = (e: any) => {

      this.feedMediaPreview = e.target.result;

      // Upload immediately
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

  // ── Upload — same api.uploadImage pattern as photos/audio ─
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
          this.showToast('📷', this.feedMediaKind === 'video' ? 'वीडियो अपलोड हुआ ✅' : 'फ़ोटो अपलोड हुई ✅');
        } else {
          this.showToast('❌', 'अपलोड विफल, पुनः प्रयास करें');
        }
      },
      error: () => {
        this.isUploadingFeedMedia = false;
        this.showToast('❌', 'अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }

  // ── Submit ─────────────────────────────────────────────
  submitFeed() {
    if (!this.Feed.Title || !this.Feed.Title.trim()) { this.showToast('⚠️', 'शीर्षक दर्ज करें'); return; }
    if (this.feedMediaFile) { this.showToast('⚠️', 'मीडिया पहले अपलोड करें ⬆'); return; }

    this.isSubmittingFeed = true;
    this.Feed.DateModified = new Date();

    this.apinu.postUrlData('FeedInsert', this.Feed).subscribe({
      next: () => {
        this.isSubmittingFeed = false;
        this.showFeedForm = false;
        this.showToast('🪔', 'पोस्ट जमा हुई! Admin अनुमोदन के बाद दिखेगी 🙏');
      },
      error: () => {
        this.isSubmittingFeed = false;
        this.showToast('❌', 'कुछ गलत हुआ, पुनः प्रयास करें');
      }
    });
  }

  // async sharePanchangImage(group: FeedDateGroup) {
  //   if (!group.panchangImage) return;
  //   try {
  //     const blob = await (await fetch(group.panchangImage)).blob();
  //     const file = new File([blob], `panchang-${group.dateKey}.png`, { type: 'image/png' });

  //     if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
  //       await (navigator as any).share({ files: [file], title: 'आज का पंचांग' });
  //     } else if ((navigator as any).share) {
  //       await (navigator as any).share({ title: 'आज का पंचांग', url: group.panchangImage });
  //     } else {
  //       const a = document.createElement('a');
  //       a.href = group.panchangImage;
  //       a.download = `panchang-${group.dateKey}.png`;
  //       a.click();
  //     }
  //   } catch (e) {
  //     console.error('sharePanchangImage failed:', e);
  //     this.showToast('❌', 'शेयर नहीं हुआ');
  //   }
  // }

  // ── Mangal Aarti (21-sec sequence) ─────────────────────
  aartiPhase: 'idle' | 'running' | 'blessed' = 'idle';
  currentAartiStepData: AartiStep = { icon: '🪔', label: 'मंगल आरती', sub: '' };
  aartiProgress = 0;
  private aartiTimers: any[] = [];
  private aartiSeqInterval: any;
  blessingCountdown = 60;
  private blessingCDInterval: any;
  MangalMudraPoints: number = 0;
  isGlowing = false;
  bellRinging = false;

  private bellAudio: HTMLAudioElement | null = null;
  private shankhAudio: HTMLAudioElement | null = null;
  private aartiBhajan: HTMLAudioElement | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: any[] = [];
  private animationId = 0;
  private flowersAutoStopTimer: any;

  miniToastVisible = false;
  miniToastMessage = '';
  private miniToastTimer: any;

  chromeHidden = false;

  // ── Collapse toggle for hero + aarti block ─────────────
  mandirSectionCollapsed = false;
  toggleMandirSection() {
    this.mandirSectionCollapsed = !this.mandirSectionCollapsed;
  }

  private readonly aartiSequence: Array<{ time: number; step: AartiStep; action: string }> = [
    { time: 0, action: 'bell', step: { icon: '🔔', label: 'घंटी', sub: 'मंदिर घंटी बजाएं' } },
    { time: 2000, action: 'shankh', step: { icon: '🐚', label: 'शंख नाद', sub: 'शंख ध्वनि' } },
    { time: 4000, action: 'bhajan', step: { icon: '🚩', label: 'हनुमान जी दर्शन', sub: 'ॐ श्री हनुमते नमः' } },
    { time: 6000, action: 'flowers', step: { icon: '🪔', label: 'मंगल आरती', sub: 'मंगल भवन अमंगल हारी,', sub2: 'द्रवहु सो दसरथ अजर बिहारी॥' } },
    { time: 15000, action: 'petals', step: { icon: '🌺', label: 'पुष्प अर्पण', sub: 'भक्ति से पुष्प चढ़ाए' } },
    { time: 18000, action: 'jai', step: { icon: '🙏', label: 'जय श्री राम', sub: 'जय बजरंग बली 🚩' } },
    { time: 33000, action: 'stop_bhajan', step: { icon: '✨', label: 'आशीर्वाद', sub: 'तुम्हारी भक्ति स्वीकार हुई' } },
    { time: 34000, action: 'complete', step: { icon: '✨', label: '', sub: '' } },
  ];



  // shareFeed(item: FeedItem, shareType: string = 'WhatsApp') {
  //   const userID = this.userDetails?.UserID || 0;
  //   const feedShare = { FeedID: item.FeedID, UserID: userID, ShareType: shareType, SharedOn: new Date() };
  //   this.apinu.postUrlData('FeedShareInsert', feedShare).subscribe({
  //     next: () => { item.shareCount = (item.shareCount ?? 0) + 1; },
  //     error: () => { /* silent — share UI already happened via native share sheet */ }
  //   });

  //   const shareUrl = `https://app.mangalbhav.com/feed/${item.FeedID}`;

  //   Share.share({
  //     title: item.Title,
  //     text: item.Title,
  //     url: shareUrl,
  //     dialogTitle: 'शेयर करें'
  //   }).catch((err) => {
  //     console.error('Native share failed:', err);
  //     // fallback for browser/PWA context
  //     if ((navigator as any).share) {
  //       (navigator as any).share({ title: item.Title, url: shareUrl }).catch(() => { });
  //     } else {
  //       window.open(`https://wa.me/?text=${encodeURIComponent(item.Title + ' ' + shareUrl)}`, '_blank');
  //     }
  //   });
  // }


  // async shareFeedAsImage(item: FeedItem) {

  //   const cardEl = document.querySelector(
  //     `.insta-post[data-feed-id="${item.FeedID}"]`
  //   ) as HTMLElement;

  //   if (!cardEl) {
  //     this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
  //     return;
  //   }

  //   const userID = this.userDetails?.UserID || 0;
  //   this.apinu.postUrlData('FeedShareInsert', {
  //     FeedID: item.FeedID,
  //     UserID: userID,
  //     ShareType: 'Image',
  //     SharedOn: new Date()
  //   }).subscribe({
  //     next: () => item.shareCount = (item.shareCount ?? 0) + 1,
  //     error: () => { }
  //   });

  //   // ── Clone the card into a plain, top-level container so html2canvas
  //   // never has to cross Ionic's Shadow DOM boundary to find it ──
  //   const captureHost = document.createElement('div');
  //   captureHost.style.position = 'fixed';
  //   captureHost.style.left = '-9999px';
  //   captureHost.style.top = '0';
  //   captureHost.style.width = `${cardEl.offsetWidth || 400}px`;
  //   captureHost.style.background = '#ffffff';
  //   document.body.appendChild(captureHost);

  //   const clone = cardEl.cloneNode(true) as HTMLElement;
  //   // cloneNode copies attributes (incl. src/crossorigin) but video playback
  //   // state isn't cloned — html2canvas can't render <video> anyway, so swap
  //   // any cloned <video> for an <img> using the same crossorigin src.
  //   clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
  //     const img = document.createElement('img');
  //     img.src = videoEl.currentSrc || videoEl.src;
  //     img.className = videoEl.className;
  //     img.crossOrigin = 'anonymous';
  //     videoEl.replaceWith(img);
  //   });

  //   captureHost.appendChild(clone);

  //   try {
  //     // Wait for all images inside the clone to finish loading
  //     await new Promise(resolve => setTimeout(resolve, 100));
  //     const images = Array.from(captureHost.querySelectorAll('img'));
  //     await Promise.all(images.map(img => {
  //       if (img.complete) return Promise.resolve();
  //       return new Promise<void>(resolve => {
  //         img.onload = () => resolve();
  //         img.onerror = () => resolve();
  //       });
  //     }));

  //     const canvas = await html2canvas(clone, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: false,
  //       backgroundColor: '#ffffff',
  //       logging: false,
  //     });

  //     const imageData = canvas.toDataURL('image/png');

  //     if (Capacitor.isNativePlatform()) {
  //       const base64Data = imageData.split(',')[1];
  //       const fileName = `feed-${item.FeedID}.png`;
  //       const savedFile = await Filesystem.writeFile({
  //         path: fileName,
  //         data: base64Data,
  //         directory: Directory.Cache
  //       });
  //       await Share.share({
  //         title: item.Title || 'Post',
  //         url: savedFile.uri,
  //         dialogTitle: 'पोस्ट शेयर करें'
  //       });
  //     } else {
  //       const blob = await (await fetch(imageData)).blob();
  //       const file = new File([blob], `feed-${item.FeedID}.png`, { type: 'image/png' });

  //       if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
  //         await (navigator as any).share({ files: [file], title: item.Title || 'Post' });
  //       } else if ((navigator as any).share) {
  //         await (navigator as any).share({ title: item.Title || 'Post', url: imageData });
  //       } else {
  //         const a = document.createElement('a');
  //         a.href = imageData;
  //         a.download = `feed-${item.FeedID}.png`;
  //         a.click();
  //       }
  //     }

  //   } catch (e: any) {
  //     console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
  //     if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
  //       this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
  //     } else {
  //       this.showToast('❌', 'शेयर नहीं हुआ');
  //     }
  //   } finally {
  //     // Always clean up the offscreen clone
  //     document.body.removeChild(captureHost);
  //   }
  // }




  // async sharePanchangImage(group: FeedDateGroup) {
  //   if (!group.panchangImage) return;

  //   try {
  //     if (Capacitor.isNativePlatform()) {
  //       // Strip the "data:image/png;base64," prefix — Filesystem wants raw base64
  //       const base64Data = group.panchangImage.split(',')[1];
  //       const fileName = `panchang-${group.dateKey}.png`;

  //       const savedFile = await Filesystem.writeFile({
  //         path: fileName,
  //         data: base64Data,
  //         directory: Directory.Cache
  //       });

  //       await Share.share({
  //         title: 'आज का पंचांग',
  //         url: savedFile.uri,
  //         dialogTitle: 'पंचांग शेयर करें'
  //       });
  //     } else {
  //       // Web/PWA fallback — your existing logic
  //       const blob = await (await fetch(group.panchangImage)).blob();
  //       const file = new File([blob], `panchang-${group.dateKey}.png`, { type: 'image/png' });

  //       if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
  //         await (navigator as any).share({ files: [file], title: 'आज का पंचांग' });
  //       } else if ((navigator as any).share) {
  //         await (navigator as any).share({ title: 'आज का पंचांग', url: group.panchangImage });
  //       } else {
  //         const a = document.createElement('a');
  //         a.href = group.panchangImage;
  //         a.download = `panchang-${group.dateKey}.png`;
  //         a.click();
  //       }
  //     }
  //   } catch (e) {
  //     console.error('sharePanchangImage failed:', e);
  //     this.showToast('❌', 'शेयर नहीं हुआ');
  //   }
  // }


  // async shareFeedAsImage(item: FeedItem) {

  //   const cardEl = document.querySelector(
  //     `.insta-post[data-feed-id="${item.FeedID}"]`
  //   ) as HTMLElement;

  //   if (!cardEl) {
  //     this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
  //     return;
  //   }

  //   const userID = this.userDetails?.UserID || 0;
  //   this.apinu.postUrlData('FeedShareInsert', {
  //     FeedID: item.FeedID,
  //     UserID: userID,
  //     ShareType: 'Image',
  //     SharedOn: new Date()
  //   }).subscribe({
  //     next: () => item.shareCount = (item.shareCount ?? 0) + 1,
  //     error: () => { }
  //   });

  //   const shareLink = this.getFeedShareLink(item);
  //   const shareText = item.Title ? `${item.Title}\n\n${shareLink}` : shareLink;

  //   const captureHost = document.createElement('div');
  //   captureHost.style.position = 'fixed';
  //   captureHost.style.left = '-9999px';
  //   captureHost.style.top = '0';
  //   captureHost.style.width = `${cardEl.offsetWidth || 400}px`;
  //   captureHost.style.background = '#ffffff';
  //   document.body.appendChild(captureHost);

  //   const clone = cardEl.cloneNode(true) as HTMLElement;
  //   clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
  //     const img = document.createElement('img');
  //     img.src = videoEl.currentSrc || videoEl.src;
  //     img.className = videoEl.className;
  //     img.crossOrigin = 'anonymous';
  //     videoEl.replaceWith(img);
  //   });

  //   captureHost.appendChild(clone);

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 100));
  //     const images = Array.from(captureHost.querySelectorAll('img'));
  //     await Promise.all(images.map(img => {
  //       if (img.complete) return Promise.resolve();
  //       return new Promise<void>(resolve => {
  //         img.onload = () => resolve();
  //         img.onerror = () => resolve();
  //       });
  //     }));

  //     const canvas = await html2canvas(clone, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: false,
  //       backgroundColor: '#ffffff',
  //       logging: false,
  //     });

  //     const imageData = canvas.toDataURL('image/png');

  //     // Overlay the sharing user's profile photo (bottom-left avatar),
  //     // same treatment as the panchang share image.
  //     const imageToShare = await this.addUserPhotoOverlay(imageData, 'bottom-right', 0.18);


  //     if (Capacitor.isNativePlatform()) {
  //       const base64Data = imageToShare.split(',')[1];
  //       const fileName = `feed-${item.FeedID}.png`;
  //       const savedFile = await Filesystem.writeFile({
  //         path: fileName,
  //         data: base64Data,
  //         directory: Directory.Cache
  //       });
  //       await Share.share({
  //         title: item.Title || 'Post',
  //         text: shareText,          // ← link goes out with the shared image
  //         url: savedFile.uri,
  //         dialogTitle: 'पोस्ट शेयर करें'
  //       });
  //     } else {
  //       const blob = await (await fetch(imageToShare)).blob();
  //       const file = new File([blob], `feed-${item.FeedID}.png`, { type: 'image/png' });

  //       if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
  //         await (navigator as any).share({
  //           files: [file],
  //           title: item.Title || 'Post',
  //           text: shareText          // ← link included alongside the file
  //         });
  //       } else if ((navigator as any).share) {
  //         await (navigator as any).share({
  //           title: item.Title || 'Post',
  //           text: shareText,
  //           url: shareLink            // ← plain link fallback when file share isn't supported
  //         });
  //       } else {
  //         // No native share API — download the image, and separately copy the link
  //         const a = document.createElement('a');
  //         a.href = imageToShare;
  //         a.download = `feed-${item.FeedID}.png`;
  //         a.click();

  //         try {
  //           await navigator.clipboard.writeText(shareLink);
  //           this.showToast('🔗', 'लिंक कॉपी हो गया');
  //         } catch { /* clipboard may be blocked; ignore silently */ }
  //       }
  //     }

  //   } catch (e: any) {
  //     console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
  //     if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
  //       this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
  //     } else {
  //       this.showToast('❌', 'शेयर नहीं हुआ');
  //     }
  //   } finally {
  //     document.body.removeChild(captureHost);
  //   }
  // }


  openFeedDetail(item: FeedItem) {
    this.routerCtrl.navigateForward(`/feed/${item.FeedID}`);
  }

  openPanchangDetail() {
    this.routerCtrl.navigateForward('/india-festival');
  }

  async sharePanchangImage(group: FeedDateGroup) {
    if (!group.panchangImage) return;

    const shareLink = `${this.shareLinkBaseUrl}/india-festival`;
    const shareText = `आज का पंचांग\n\n${shareLink}`;

    try {
      // Composite the sharing user's photo onto a copy of the base image —
      // group.panchangImage itself stays untouched since it's shared by all viewers
      const imageToShare = await this.addUserPhotoOverlay(group.panchangImage,0.12);

      if (Capacitor.isNativePlatform()) {
        const base64Data = imageToShare.split(',')[1];
        const fileName = `panchang-${group.dateKey}.png`;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'आज का पंचांग',
          text: shareText,
          url: savedFile.uri,
          dialogTitle: 'पंचांग शेयर करें'
        });
      } else {
        const blob = await (await fetch(imageToShare)).blob();
        const file = new File([blob], `panchang-${group.dateKey}.png`, { type: 'image/png' });

        if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: 'आज का पंचांग',
            text: shareText
          });
        } else if ((navigator as any).share) {
          await (navigator as any).share({
            title: 'आज का पंचांग',
            text: shareText,
            url: shareLink
          });
        } else {
          const a = document.createElement('a');
          a.href = imageToShare;
          a.download = `panchang-${group.dateKey}.png`;
          a.click();

          try {
            await navigator.clipboard.writeText(shareLink);
            this.showToast('🔗', 'लिंक कॉपी हो गया');
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('sharePanchangImage failed:', e);
      this.showToast('❌', 'शेयर नहीं हुआ');
    }
  }



  /** Loads the current user's profile photo via the DownloadImages API and
 * resolves to a data URL. Uses the same blob-based approach as other photo
 * loads in this component, so there's no CORS/tainted-canvas concern —
 * the blob is same-origin once created. Resolves to null if unavailable. */
  private loadUserProfilePhotoDataUrl(): Promise<string | null> {
    return new Promise((resolve) => {
      const photoFileName = this.userDetails?.ProfilePhoto || this.userDetails?.ProfilePhotoUrl;
      if (!photoFileName) { resolve(null); return; }

      this.api.getImage('DownloadImages', {
        imageName: photoFileName, imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (!blob?.type?.startsWith('image/')) { resolve(null); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        },
        error: () => resolve(null)
      });
    });
  }



  /** Draws the panchang base image onto a canvas, then overlays the sharing
 * user's profile photo as a circular avatar. `position` picks the corner,
 * `sizeRatio` controls avatar size as a fraction of the base image width. */
  // private async addUserPhotoOverlay(
  //   baseImageDataUrl: string,
  //   position: 'bottom-left' | 'bottom-right' = 'bottom-left',
  //   sizeRatio: number = 0.09
  // ): Promise<string> {
  //   const userPhotoDataUrl = await this.loadUserProfilePhotoDataUrl();
  //   if (!userPhotoDataUrl) return baseImageDataUrl; // nothing to overlay, share as-is

  //   const loadImage = (src: string): Promise<HTMLImageElement> => {
  //     return new Promise((resolve, reject) => {
  //       const img = new Image();
  //       img.onload = () => resolve(img);
  //       img.onerror = reject;
  //       img.src = src;
  //     });
  //   };

  //   try {
  //     const [baseImg, userImg] = await Promise.all([
  //       loadImage(baseImageDataUrl),
  //       loadImage(userPhotoDataUrl)
  //     ]);

  //     const canvas = document.createElement('canvas');
  //     canvas.width = baseImg.width;
  //     canvas.height = baseImg.height;
  //     const ctx = canvas.getContext('2d')!;

  //     // Base image
  //     ctx.drawImage(baseImg, 0, 0);

  //     // Avatar sizing — scale relative to image width so it looks right at any resolution
  //     const avatarSize = Math.round(baseImg.width * sizeRatio);
  //     const margin = Math.round(baseImg.width * 0.03);
  //     const cx = position === 'bottom-right'
  //       ? baseImg.width - margin - avatarSize / 2
  //       : margin + avatarSize / 2;
  //     const cy = baseImg.height - margin - avatarSize / 2;

  //     // White circular border behind the avatar
  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.arc(cx, cy, avatarSize / 2 + 4, 0, Math.PI * 2);
  //     ctx.fillStyle = '#ffffff';
  //     ctx.fill();
  //     ctx.restore();

  //     // Clip to circle and draw the user's photo, cover-fit into the circle
  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
  //     ctx.closePath();
  //     ctx.clip();

  //     const srcSize = Math.min(userImg.width, userImg.height);
  //     const srcX = (userImg.width - srcSize) / 2;
  //     const srcY = (userImg.height - srcSize) / 2;
  //     ctx.drawImage(
  //       userImg,
  //       srcX, srcY, srcSize, srcSize,
  //       cx - avatarSize / 2, cy - avatarSize / 2, avatarSize, avatarSize
  //     );
  //     ctx.restore();

  //     return canvas.toDataURL('image/png');
  //   } catch (e) {
  //     console.error('addUserPhotoOverlay failed:', e);
  //     return baseImageDataUrl; // fall back to the plain image if anything goes wrong
  //   }
  // }



  private readonly shareLinkBaseUrl = 'https://app.mangalbhav.com';

  /** Maps a Feed row's SourceTable to the page it should deep-link to when shared. */
  // private getFeedShareLink(item: FeedItem): string {
  //   switch ((item.SourceTable || '').trim()) {
  //     case 'Profile':
  //       // ⚠️ confirm: SourceID here should be the pandit/profile's UserID
  //       return `${this.shareLinkBaseUrl}/open-find-pandit/${item.SourceID ?? ''}`;
  //     case 'Mandir':
  //       return `${this.shareLinkBaseUrl}/mandirfulldetails/${item.SourceID ?? ''}`;
  //     case 'Service':
  //     case 'Booking':
  //       return `${this.shareLinkBaseUrl}/tabs/tab3`;
  //     case 'Feed':
  //     default:
  //       return `${this.shareLinkBaseUrl}/open-community-page`;
  //   }
  // }

  private getFeedShareLink(item: FeedItem): string {
    return `${this.shareLinkBaseUrl}/feed/${item.FeedID}`;
  }

  // ── Share preview ──────────────────────────────────────
  showSharePreview = false;
  sharePreviewImageUrl: string | null = null;
  isPreparingShare = false;
  private pendingShareItem: FeedItem | null = null;
  private pendingShareText = '';


  async shareFeedAsImage(item: FeedItem) {

    const cardEl = document.querySelector(
      `.insta-post[data-feed-id="${item.FeedID}"]`
    ) as HTMLElement;

    if (!cardEl) {
      this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
      return;
    }

    // Capture only the media itself — not header/caption/actions.
    // Falls back to the whole card for text-only posts.
    const mediaWrapEl = cardEl.querySelector('.ip-media-wrap') as HTMLElement | null;
    const targetEl = mediaWrapEl || cardEl;

    this.isPreparingShare = true;

    const shareLink = this.getFeedShareLink(item);
    const shareText = item.Title ? `${item.Title}\n\n${shareLink}` : shareLink;

    const captureHost = document.createElement('div');
    captureHost.style.position = 'fixed';
    captureHost.style.left = '-9999px';
    captureHost.style.top = '0';
    captureHost.style.width = `${targetEl.offsetWidth || 400}px`;
    captureHost.style.background = '#ffffff';
    document.body.appendChild(captureHost);

    const clone = targetEl.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
      const img = document.createElement('img');
      img.src = videoEl.currentSrc || videoEl.src;
      img.className = videoEl.className;
      img.crossOrigin = 'anonymous';
      videoEl.replaceWith(img);
    });

    captureHost.appendChild(clone);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const images = Array.from(captureHost.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageData = canvas.toDataURL('image/png');
      const imageToShare = await this.addUserPhotoOverlay(imageData, 0.16);

      this.pendingShareItem = item;
      this.pendingShareText = shareText;
      this.sharePreviewImageUrl = imageToShare;
      this.showSharePreview = true;

    } catch (e: any) {
      console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
      if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
        this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
      } else {
        this.showToast('❌', 'शेयर नहीं हुआ');
      }
    } finally {
      document.body.removeChild(captureHost);
      this.isPreparingShare = false;
      this.cdr.markForCheck();
    }
  }

  cancelSharePreview() {
    this.showSharePreview = false;
    this.sharePreviewImageUrl = null;
    this.pendingShareItem = null;
    this.pendingShareText = '';
  }

  async confirmShare() {
    const item = this.pendingShareItem;
    const imageToShare = this.sharePreviewImageUrl;
    const shareText = this.pendingShareText;
    const shareLink = item ? this.getFeedShareLink(item) : '';

    if (!item || !imageToShare) {
      this.cancelSharePreview();
      return;
    }

    this.showSharePreview = false;

    const userID = this.userDetails?.UserID || 0;
    this.apinu.postUrlData('FeedShareInsert', {
      FeedID: item.FeedID,
      UserID: userID,
      ShareType: 'Image',
      SharedOn: new Date()
    }).subscribe({
      next: () => item.shareCount = (item.shareCount ?? 0) + 1,
      error: () => { }
    });

    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = imageToShare.split(',')[1];
        const fileName = `feed-${item.FeedID}.png`;
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: item.Title || 'Post',
          text: shareText,
          url: savedFile.uri,
          dialogTitle: 'पोस्ट शेयर करें'
        });
      } else {
        const blob = await (await fetch(imageToShare)).blob();
        const file = new File([blob], `feed-${item.FeedID}.png`, { type: 'image/png' });

        if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: item.Title || 'Post',
            text: shareText
          });
        } else if ((navigator as any).share) {
          await (navigator as any).share({
            title: item.Title || 'Post',
            text: shareText,
            url: shareLink
          });
        } else {
          const a = document.createElement('a');
          a.href = imageToShare;
          a.download = `feed-${item.FeedID}.png`;
          a.click();

          try {
            await navigator.clipboard.writeText(shareLink);
            this.showToast('🔗', 'लिंक कॉपी हो गया');
          } catch { /* clipboard may be blocked; ignore silently */ }
        }
      }
    } catch (e) {
      console.error('confirmShare failed:', e);
      this.showToast('❌', 'शेयर नहीं हुआ');
    } finally {
      this.cancelSharePreview();
    }
  }

  private async addUserPhotoOverlay(
    baseImageDataUrl: string,
    footerHeightRatio: number = 0.46
  ): Promise<string> {
    const userPhotoDataUrl = await this.loadUserProfilePhotoDataUrl();
    const userName = this.userDetails?.Name || this.userDetails?.FullName || '';

    const loadImage = (src: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    try {
      const baseImg = await loadImage(baseImageDataUrl);
      if (!baseImg) return baseImageDataUrl;

      const [userImg, logoImg] = await Promise.all([
        userPhotoDataUrl ? loadImage(userPhotoDataUrl) : Promise.resolve(null),
        loadImage('assets/mangalbhavlogo1.jpeg')
      ]);

      const footerHeight = Math.round(baseImg.width * footerHeightRatio);

      const canvas = document.createElement('canvas');
      canvas.width = baseImg.width;
      canvas.height = baseImg.height + footerHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0);

      const sideMargin = Math.round(baseImg.width * 0.04);

      const topRowHeight = footerHeight * 0.70;
      const rowGap = footerHeight * 0.08;
      const bottomRowHeight = footerHeight - topRowHeight - rowGap;

      const topRowCy = baseImg.height + topRowHeight / 2;
      const bottomRowCy = baseImg.height + topRowHeight + rowGap + bottomRowHeight / 2;

      // ══════════ ROW 1 (left): user avatar + name ══════════
      const avatarSize = Math.round(topRowHeight * 1.0);
      const avatarCx = sideMargin + avatarSize / 2;

      if (userImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, topRowCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const srcSize = Math.min(userImg.width, userImg.height);
        const srcX = (userImg.width - srcSize) / 2;
        const srcY = (userImg.height - srcSize) / 2;
        ctx.drawImage(userImg, srcX, srcY, srcSize, srcSize,
          avatarCx - avatarSize / 2, topRowCy - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, topRowCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#C1440E';
        ctx.stroke();
        ctx.restore();
      }

      if (userName) {
        const fontSize = Math.round(topRowHeight * 0.48);
        const textX = userImg ? avatarCx + avatarSize / 2 + 16 : sideMargin;
        const maxTextWidth = canvas.width - textX - sideMargin;
        ctx.font = `600 ${fontSize}px sans-serif`;
        let adjustedFontSize = fontSize;
        while (ctx.measureText(userName).width > maxTextWidth && adjustedFontSize > 10) {
          adjustedFontSize -= 1;
          ctx.font = `600 ${adjustedFontSize}px sans-serif`;
        }
        ctx.save();
        ctx.fillStyle = '#333333';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(userName, textX, topRowCy);
        ctx.restore();
      }

      // ══════════ ROW 2 (bottom-right block: "Powered by" — LOGO — "Mangal Bhav") ══════════
      const rightEdge = canvas.width - sideMargin;
      const logoSize = Math.round(bottomRowHeight * 1.45);
      const textLogoGap = 8;
      const poweredFontSize = Math.round(bottomRowHeight * 0.8);

      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      const preText = 'Powered by';
      const postText = 'Mangal Bhav';
      const preTextWidth = ctx.measureText(preText).width;
      const postTextWidth = ctx.measureText(postText).width;

      // Whole "text — logo — text" block still anchors its right edge to the margin
      const blockWidth = preTextWidth + textLogoGap + logoSize + textLogoGap + postTextWidth;
      const blockLeftX = rightEdge - blockWidth;

      const preTextStartX = blockLeftX;
      const logoCx = blockLeftX + preTextWidth + textLogoGap + logoSize / 2;
      const postTextStartX = blockLeftX + preTextWidth + textLogoGap + logoSize + textLogoGap;

      // "Powered by"
      ctx.save();
      ctx.fillStyle = '#888888';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      ctx.fillText(preText, preTextStartX, bottomRowCy);
      ctx.restore();

      // Logo (in the middle)
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoCx, bottomRowCy, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const srcSize = Math.min(logoImg.width, logoImg.height);
        const srcX = (logoImg.width - srcSize) / 2;
        const srcY = (logoImg.height - srcSize) / 2;
        ctx.drawImage(logoImg, srcX, srcY, srcSize, srcSize,
          logoCx - logoSize / 2, bottomRowCy - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      // "Mangal Bhav"
      ctx.save();
      ctx.fillStyle = '#888888';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      ctx.fillText(postText, postTextStartX, bottomRowCy);
      ctx.restore();

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('addUserPhotoOverlay failed:', e);
      return baseImageDataUrl;
    }
  }
}