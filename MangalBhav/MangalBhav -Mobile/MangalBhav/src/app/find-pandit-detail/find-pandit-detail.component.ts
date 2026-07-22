import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, from, map, mergeMap, of, toArray, takeUntil } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { Browser } from '@capacitor/browser';
@Component({
  selector: 'app-find-pandit-detail',
  templateUrl: './find-pandit-detail.component.html',
  styleUrls: ['./find-pandit-detail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, TabscommonheaderComponent]
})
export class FindPanditDetailComponent implements OnInit, OnDestroy {

  userDetails: any;
  language: any;
  userLoggedIn = false;
  panditFeedList: any[] = [];
  isLoadingFeed = false;
  panditUserID: number | null = null;
  activePandit: any = null;       // { user, profile }
  activePanditServices: any[] = [];
  isLoading = true;
  isLoadingServices = false;
  loadError = false;

  profileImages: { [key: number]: string } = {};
  panditServiceBookingMap: { [key: string]: number } = {};
  currentImageIndex: { [key: string]: number } = {};

  lightboxImageUrl: string | null = null;

  isExploreModalOpen = false;
  selectedPandit: any = null;
  selectedService: any = null;

  likedPanditMap = new Map<number, number>();
  likeCheckingIDs = new Set<number>();
  isTogglingLike = false;

  viewsCount: any;
  likeCount: any;
  shareCount: any;

  private destroy$ = new Subject<void>();
  private _cleanNameCache = new Map<string, string>();
  panditSocialMediaList: any[] = [];

  labels = {
    en: {
      back: 'Back',
      connectSocial: 'Connect with Pandit Ji',
      linkNotAdded: 'link not added yet',
      panditProfile: '🙏 Pandit Profile',
      memberSince: 'Member since',
      chat: 'Chat',
      experience: 'Experience',
      gender: 'Gender',
      languages: 'Languages',
      dakshina: 'Dakshina',
      location: 'Location',
      notFilled: 'Not Filled',
      years: 'Years',
      aboutPandit: '🙏 About Pandit Ji',
      availableServices: 'Available Services',
      loadingServices: 'Loading services…',
      booked: '+ booked',
      explore: 'Explore',
      noServices: 'No services listed yet',
      tapToClose: 'Tap outside to close',
      like: 'Like',
      liked: 'Liked',
      share: 'Share',
      viewsLabel: 'Views',
      likesLabel: 'Likes',
      sharesLabel: 'Shares',
      defaultLocation: 'India',
      yrsExp: 'yrs exp',
      sevaDetails: '🪔 Seva Details',
      aboutSeva: '📖 About this Seva',
      defaultSevaDesc: 'This sacred seva connects you with the divine through ancient Vedic traditions.',
      serviceDetails: '📋 Service Details',
      duration: 'Duration',
      price: 'Price',
      city: 'City',
      status: 'Status',
      min: 'min',
      available: 'Available',
      unavailable: 'Unavailable',
      categoryInfo: '📂 Category Information',
      ritualType: 'Ritual Type',
      lifeStage: 'Life Stage',
      festival: 'Festival',
      yes: 'Yes',
      no: 'No',
      lifeEvent: 'Life Event',
      festivalRelated: 'Festival Related',
      age: 'Age',
      sevaLocation: '🏠 Seva Location',
      locationNotSpecified: 'Location not specified',
      addressNotAvailable: 'Address not available',
      noLocationAdded: 'No location added yet',
      bookThisSeva: 'Book this Seva',
      notFound: 'Pandit not found.',
      appTitle: 'Mangal.Bhav',
      appSub: '✦Peace · Prosperity · Protection✦',
    },
    hi: {
      back: 'वापस',
      appTitle: 'मंगल.भाव:',
      appSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      connectSocial: 'पंडित जी से जुड़ें',

      panditProfile: '🙏 पंडित प्रोफ़ाइल',
      memberSince: 'सदस्य हैं',
      chat: 'संवाद करे',
      experience: 'अनुभव',
      gender: 'लिंग',
      languages: 'भाषाएँ',
      dakshina: 'दक्षिणा',
      location: 'स्थान',
      notFilled: 'नहीं भरा',
      years: 'वर्ष',
      aboutPandit: '🙏 पंडित जी के बारे में',
      availableServices: 'उपलब्ध सेवाएँ',
      loadingServices: 'सेवाएँ लोड हो रही हैं…',
      booked: '+ बुकिंग',
      explore: 'जानें',
      noServices: 'अभी कोई सेवा नहीं',
      tapToClose: 'बाहर टैप करके बंद करें',
      like: 'पसंद',
      liked: 'पसंद किया',
      share: 'साझा करें',
      linkNotAdded: 'लिंक अभी नहीं जोड़ा गया',
      viewsLabel: 'दृश्य',
      likesLabel: 'पसंद',
      sharesLabel: 'साझा',
      defaultLocation: 'भारत',
      yrsExp: 'वर्ष अनुभव',
      sevaDetails: '🪔 सेवा विवरण',
      aboutSeva: '📖 इस सेवा के बारे में',
      defaultSevaDesc: 'यह पवित्र सेवा आपको प्राचीन वैदिक परंपराओं के माध्यम से ईश्वर से जोड़ती है।',
      serviceDetails: '📋 सेवा विवरण',
      duration: 'अवधि',
      price: 'मूल्य',
      city: 'शहर',
      status: 'स्थिति',
      min: 'मिनट',
      available: 'उपलब्ध',
      unavailable: 'अनुपलब्ध',
      categoryInfo: '📂 श्रेणी जानकारी',
      ritualType: 'अनुष्ठान प्रकार',
      lifeStage: 'जीवन अवस्था',
      festival: 'त्योहार',
      yes: 'हाँ',
      no: 'नहीं',
      lifeEvent: 'जीवन घटना',
      festivalRelated: 'त्योहार संबंधित',
      age: 'आयु',
      sevaLocation: '🏠 सेवा स्थान',
      locationNotSpecified: 'स्थान निर्दिष्ट नहीं',
      addressNotAvailable: 'पता उपलब्ध नहीं',
      noLocationAdded: 'अभी कोई स्थान नहीं जोड़ा',
      bookThisSeva: 'यह सेवा बुक करें',
      notFound: 'पंडित नहीं मिला।',
    }
  };

  get t() {
    return this.language === 'Hindi' ? this.labels.hi : this.labels.en;
  }

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef, private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.userLoggedIn = !!this.userDetails?.LoginID;
    this.language = await this.storage.get('Language');

    this.route.paramMap.subscribe(params => {
      const raw = params.get('id');
      const uid = Number(raw);
      if (!uid || isNaN(uid) || uid <= 0) {
        this.loadError = true;
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }
      this.panditUserID = uid;
      this.loadPandit(uid);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    // Prefer real back-navigation so the list page's scroll/filter state is preserved
    if (window.history.length > 1) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigateByUrl('/tabs/find-pandit');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD PANDIT BY ID
  // ─────────────────────────────────────────────────────────────────────────

  private loadPandit(uid: number) {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.markForCheck();

    forkJoin({
      userRes: this.apinu.postUrlData('UsersNUSelectByQueryPaging', {
        query: `U.UserID = ${uid} ORDER BY U.UserID DESC`,
        pageNumber: 1,
        pageSize: 1
      }),
      profileRes: this.apinu.postUrlData(`ProfilesSelectAllByUserID?userID=${uid}`, null)
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ userRes, profileRes }: any) => {
          const user = userRes?.UserList?.[0] || null;
          const profile = profileRes?.ProfileList?.[0] || null;

          if (!user && !profile) {
            this.loadError = true;
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          this.activePandit = {
            user,
            profile,
            _city: profile?.City || profile?.State || null
          };

          this.isLoading = false;
          this.cdr.markForCheck();

          if (profile) this.loadProfileImage(profile);

          this.trackProfileView(this.activePandit);
          this.checkEngagements(this.activePandit);
          this.checkExistingLike(this.activePandit);
          this.fetchServices(this.activePandit);
          this.loadSocialMediaForPandit(uid);
          this.loadPanditFeed(uid);
        },
        error: () => {
          this.loadError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }




  private fetchServices(item: any) {
    this.isLoadingServices = true;
    this.loadServicesForPandit(item)
      .then(services => {
        this.activePanditServices = services;
        this.isLoadingServices = false;
        this.cdr.markForCheck();
        this.loadBookingCounts(services);
      })
      .catch(() => {
        this.activePanditServices = [];
        this.isLoadingServices = false;
        this.cdr.markForCheck();
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENGAGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  checkEngagements(item: any) {
    this.apinu.postUrlData(`ProfileEngagementCount_Select?PanditUserID=${item.user.UserID}`, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          let data: any = res;
          if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch { data = null; }
          }
          if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
          const engagementStats = data?.[0] ?? null;

          this.viewsCount = engagementStats?.ViewsCount ?? 0;
          this.likeCount = engagementStats?.LikeCount ?? 0;
          this.shareCount = engagementStats?.ShareCount ?? 0;
          this.cdr.markForCheck();
        },
        error: () => { /* ignore */ }
      });
  }

  private trackProfileView(item: any): void {
    const panditUserID = item.profile?.UserID || item.user?.UserID;
    if (!panditUserID) return;

    const payload = {
      TenantID: 1,
      PanditUserID: panditUserID,
      ViewedByUserID: this.userDetails?.UserID || 0,
      IPAddress: '',
      Device: Capacitor.getPlatform() || 'web',
      Source: 'FindPandit',
      DateAdded: new Date().toISOString()
    };

    this.apinu.postUrlData('ProfileViewsInsert', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.viewsCount = (this.viewsCount || 0) + 1;
          this.cdr.markForCheck();
        },
        error: () => { /* ignore */ }
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIKE
  // ─────────────────────────────────────────────────────────────────────────
  isPanditLiked(item: any): boolean {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    return !!panditUserID && this.likedPanditMap.has(panditUserID);
  }

  isPanditLikeChecking(item: any): boolean {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    return !!panditUserID && this.likeCheckingIDs.has(panditUserID);
  }

  private checkExistingLike(item: any): void {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    const loggedInUserID = this.userDetails?.UserID;
    if (!panditUserID || !loggedInUserID) return;
    if (this.likedPanditMap.has(panditUserID) || this.likeCheckingIDs.has(panditUserID)) return;

    this.likeCheckingIDs.add(panditUserID);
    this.cdr.markForCheck();

    const query = `PanditUserID = ${panditUserID} AND LikedByUserID = ${loggedInUserID}`;

    this.apinu.postUrlData(`ProfileLikeSelectByQuery?tenantID=1&schoolID=0&Query=${encodeURIComponent(query)}`, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.likeCheckingIDs.delete(panditUserID);
          const existing = res?.ProfileLikeList?.[0];
          if (existing?.ProfileLikeID) {
            this.likedPanditMap.set(panditUserID, existing.ProfileLikeID);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.likeCheckingIDs.delete(panditUserID);
          this.cdr.markForCheck();
        }
      });
  }

  toggleLike(item: any): void {
    if (this.isTogglingLike) return;

    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    if (!panditUserID) return;

    const alreadyLiked = this.likedPanditMap.has(panditUserID);

    if (alreadyLiked) {
      const profileLikeID = this.likedPanditMap.get(panditUserID)!;
      this.likedPanditMap.delete(panditUserID);
      this.likeCount = Math.max(0, (this.likeCount || 0) - 1);
      this.isTogglingLike = true;
      this.cdr.markForCheck();

      this.apinu.postUrlData(`ProfileLikeDelete?profileLikeID=${profileLikeID}&tenantID=1`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.likedPanditMap.set(panditUserID, profileLikeID);
            this.likeCount = (this.likeCount || 0) + 1;
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.likeCount = (this.likeCount || 0) + 1;
      this.isTogglingLike = true;
      this.cdr.markForCheck();

      const payload = {
        TenantID: 1,
        PanditUserID: panditUserID,
        LikedByUserID: this.userDetails?.UserID || 0,
        IPAddress: '',
        Device: Capacitor.getPlatform() || 'web',
        Source: 'FindPandit',
        DateAdded: new Date().toISOString()
      };

      this.apinu.postUrlData('ProfileLikeInsert', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const newLikeID = res?.ProfileLikeID;
            this.likedPanditMap.set(panditUserID, newLikeID || -1);
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.likeCount = Math.max(0, (this.likeCount || 0) - 1);
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SERVICES
  // ─────────────────────────────────────────────────────────────────────────
  async loadServicesForPandit(item: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.apinu.postUrlData(`PanditServicesSelectAllByProfileID?profileID=${item.user.UserID}`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (serviceRes: any) => {
            const services = serviceRes?.PanditServiceList || [];
            if (!services.length) { resolve([]); return; }

            from(services).pipe(
              mergeMap(
                (ps: any) =>
                  forkJoin({
                    serviceDetail: this.apinu.postUrlData(`ServiceSelect?serviceID=${ps.ServiceID}&tenantID=1`, null),
                    locationDetail: this.apinu.postUrlData(`LocationSelect?locationID=${ps.LocationID}&tenantID=1`, null),
                    categoryMapping: this.apinu.postUrlData(`ServiceCategoryMappingSelectAllByServiceID?serviceID=${ps.ServiceID}`, null)
                  }).pipe(
                    mergeMap((res: any) => {
                      const mappings = res.categoryMapping?.ServiceCategoryMappingList || [];
                      if (!mappings.length) {
                        return of({
                          ...ps,
                          ServiceDetails: res.serviceDetail?.ServiceList || null,
                          LocationDetails: res.locationDetail?.LocationList || null,
                          Categories: []
                        });
                      }
                      return from(mappings).pipe(
                        mergeMap(
                          (mapItem: any) =>
                            this.apinu.postUrlData(`ServiceCategorySelect?categoryID=${mapItem.CategoryID}&tenantID=1`, null).pipe(
                              map((catRes: any) => ({
                                ...mapItem,
                                CategoryDetails: catRes?.ServiceCategoryList?.[0] || null
                              }))
                            ),
                          3
                        ),
                        toArray(),
                        map((cats: any[]) => ({
                          ...ps,
                          ServiceDetails: res.serviceDetail?.ServiceList || null,
                          LocationDetails: res.locationDetail?.LocationList || null,
                          Categories: cats
                        }))
                      );
                    })
                  ),
                2
              ),
              toArray(),
              takeUntil(this.destroy$)
            ).subscribe({
              next: loaded => resolve(loaded),
              error: err => reject(err)
            });
          },
          error: (err: any) => reject(err)
        });
    });
  }

  loadBookingCounts(services: any[]) {
    services.forEach((ps: any) => {
      if (!ps.PanditServiceID) return;
      this.panditServiceBookingMap[String(ps.PanditServiceID)] = 0;
      this.apinu.postUrlData(`BookingsSelectAllByPanditServiceID?panditServiceID=${ps.PanditServiceID}`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.panditServiceBookingMap[String(ps.PanditServiceID)] = (res?.BookingList?.length || 0) + 10;
            this.cdr.markForCheck();
          },
          error: () => { /* ignore */ }
        });
    });
  }

  exploreService(service: any) {
    this.selectedPandit = this.activePandit;
    this.selectedService = service;
    this.isExploreModalOpen = true;
    this.cdr.markForCheck();
  }

  async goToBooking(selectedService: any) {
    this.isExploreModalOpen = false;
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!this.userLoggedIn) {
      await this.storage.set('pendingPanditServiceID', selectedService.PanditServiceID);
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigateByUrl(`/book-pooja?id=${selectedService.PanditServiceID}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SHARE / CHAT
  // ─────────────────────────────────────────────────────────────────────────
  sharePandit(item: any) {
    const panditName = item.profile?.FullName || 'Pandit Ji';
    const panditUserID = item.profile?.UserID || item.user?.UserID;
    const link = `https://app.mangalbhav.com/open-find-pandit/${panditUserID}`;
    const message =
      `🙏 *${panditName}* को Mangal Bhav पर personally recommend करता हूँ —\n\n` +
      `For your upcoming pooja, *इनसे बेहतर कोई नहीं।*\n` +
      `Deeply knowledgeable, experienced & truly devoted. ✨\n\n` +
      `📲 *Profile देखें और बुक करें:*\n${link}\n\n🪔 *Jai Shri Ram*`;

    if (panditUserID) {
      const payload = {
        TenantID: 1,
        PanditUserID: panditUserID,
        SharedByUserID: this.userDetails?.UserID || 0,
        Device: Capacitor.getPlatform() || 'web',
        Source: 'FindPanditDetail',
        DateAdded: new Date().toISOString()
      };
      this.apinu.postUrlData('ProfileShareInsert', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.shareCount = (this.shareCount || 0) + 1;
            this.cdr.markForCheck();
          },
          error: () => { /* ignore */ }
        });
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  async chatWithPandit(item: any) {
    const panditUserID = item.profile?.UserID || item.user?.UserID;
    if (!panditUserID) return;

    this.router.navigate(['/chatbox'], {
      queryParams: {
        groupId: 0,
        chatType: 'OneToOne',
        withUserID: panditUserID,
        withUserName: item.profile?.FullName || item.user?.Username || 'Pandit Ji'
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  loadProfileImage(profile: any) {
    if (!profile?.ProfilePhotoUrl || !profile?.UserID) return;
    this.profileImages[profile.UserID] =
      `https://app.mangalbhav.com/assets/ProfilePhoto/${profile.ProfilePhotoUrl}`;
  }

  getProfileImage(userID: number): string {
    return this.profileImages[userID] || 'assets/default.jfif';
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default.jpg';
    img.onerror = null;
  }

  getLocalizedText(text: string): string {
    if (!text) return '';
    const parts = text.split(' / ');
    if (this.language === 'Hindi' && parts.length > 1) return parts[1].trim();
    return parts[0].trim();
  }

  getCleanName(serviceName: string): string {
    if (!serviceName) return '';
    if (this._cleanNameCache.has(serviceName)) return this._cleanNameCache.get(serviceName)!;
    const result = serviceName.split('/')[0].trim()
      .replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    this._cleanNameCache.set(serviceName, result);
    return result;
  }


  getServiceImagePath(serviceName: string): string {
    const englishName = serviceName.split('/')[0].trim().replace(/\s+/g, '').replace(/&/g, '');
    return `${this.imgBaseUrl}/${englishName}.png`;
  }

  imgBaseUrl = 'https://app.mangalbhav.com/assets/img';

  getServiceImages(serviceName: string): string[] {
    const n = this.getCleanName(serviceName);
    return [`assets/img/${n}.png`, `assets/img/${n}2.jfif`, `assets/img/${n}3.jfif`];
  }

  get socialLinksWithUrl(): any[] {
    return (this.panditSocialMediaList || [])
      .map(item => ({ ...item, Link: this.normalizeUrl(item.Link) }))
      .filter(item => !!item.Link);
  }

  private normalizeUrl(link: string | null | undefined): string | null {
    if (!link?.trim()) return null;
    let candidate = link.trim();
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = 'https://' + candidate;
    }
    try {
      const url = new URL(candidate);
      // require at least one dot in hostname to filter out garbage like "https://panditrajesh"
      if (!url.hostname.includes('.')) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  getCurrentImage(serviceName: string): string {
    if (!serviceName) return 'assets/img/default.jpg';
    const key = this.getCleanName(serviceName);
    if (!(key in this.currentImageIndex)) this.currentImageIndex[key] = 0;
    return this.getServiceImages(serviceName)[this.currentImageIndex[key] || 0];
  }

  openLightbox(url: string) { this.lightboxImageUrl = url; this.cdr.markForCheck(); }
  closeLightbox() { this.lightboxImageUrl = null; this.cdr.markForCheck(); }
  private loadSocialMediaForPandit(panditUserID: number) {
    this.apinu.postUrlData(
      `EntitySocialMediaSelectByQuery?Query=EntityType='USER' and EntityID = ${panditUserID}`,
      null
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.panditSocialMediaList = (res.EntitySocialMediaList || [])
            .filter((item: any) => item.IsActive)
            .map((item: any) => ({
              ...item,
              IconName:
                item.Platform === 'Instagram' || item.Platform === 'WelcomeReel' ? 'logo-instagram' :
                  item.Platform === 'Facebook' ? 'logo-facebook' :
                    item.Platform === 'YouTube' ? 'logo-youtube' :
                      item.Platform === 'WhatsApp' ? 'logo-whatsapp' :
                        item.Platform === 'LinkedIn' ? 'logo-linkedin' :
                          item.Platform === 'Twitter' ? 'logo-twitter' :
                            item.Platform === 'Website' ? 'globe-outline' :
                              'share-social-outline'
            }));
          this.cdr.markForCheck();
        },
        error: () => { /* silently ignore — non-critical */ }
      });
  }


  async openSocialLink(item: any) {
    if (!item.Link) {
      const toast = await this.toastController.create({
        message: `${item.Platform} ${this.t.linkNotAdded}`,
        duration: 2500,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      return;
    }
    Browser.open({ url: item.Link });
  }


  // ─────────────────────────────────────────────────────────────────────────
  // FEED POSTS BY THIS PANDIT
  // ─────────────────────────────────────────────────────────────────────────
  private loadPanditFeed(uid: number) {
    this.isLoadingFeed = true;
    const query = `UserID=${uid} AND IsActive=1 AND IsDeleted=0`;

    this.apinu.postUrlData(`FeedSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          const list = (parsed?.FeedList || [])
            .sort((a: any, b: any) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime());

          this.panditFeedList = list;
          this.isLoadingFeed = false;
          this.cdr.markForCheck();
          this.loadFeedEngagementCounts();
        },
        error: () => {
          this.panditFeedList = [];
          this.isLoadingFeed = false;
          this.cdr.markForCheck();
        }
      });
  }

  private loadFeedEngagementCounts() {
    this.panditFeedList.forEach((item: any) => {
      this.apinu.postUrlData(
        `FeedEngagementCount_Select?FeedID=${item.FeedID}&UserID=${this.userDetails?.UserID || 0}`, null
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const parsed = typeof res === 'string' ? JSON.parse(res) : res;
            const row = Array.isArray(parsed) ? parsed[0] : parsed;
            if (!row) return;
            item.likeCount = row.LikeCount ?? 0;
            item.commentCount = row.CommentCount ?? 0;
            item.shareCount = row.ShareCount ?? 0;
            item.viewCount = row.ViewCount ?? 0;
            this.cdr.markForCheck();
          },
          error: () => { /* leave counts undefined; template shows 0 */ }
        });
    });
  }

  hasFeedMedia(item: any): boolean {
    return !!item.MediaURL && item.MediaURL.trim() !== '' && item.MediaURL !== 'null';
  }

  private getFeedMediaFolder(item: any): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Mandir': return 'ProfilePhoto';
      case 'Profile': return 'ProfilePhoto';
      case 'Service': return 'img';
      case 'Booking': return 'img';
      case 'Feed': return 'feed';
      default: return 'feed';
    }
  }

  getFeedMediaPath(item: any): string {
    const folder = this.getFeedMediaFolder(item);
    return `https://app.mangalbhav.com/assets/${folder}/${item.MediaURL}`;
  }

}