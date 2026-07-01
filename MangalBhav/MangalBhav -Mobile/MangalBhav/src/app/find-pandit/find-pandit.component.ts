import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Subject, forkJoin, from, map, mergeMap, of, toArray, takeUntil } from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';

const CONCURRENCY = 4;
declare let gtag: Function;

@Component({
  selector: 'app-find-pandit',
  templateUrl: './find-pandit.component.html',
  styleUrls: ['./find-pandit.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule,
    TabscommonheaderComponent, PanditjibottomtabsComponent, CommonBottomTabsComponent]
})
export class FindPanditComponent implements OnInit, OnDestroy {

  userDetails: any;
  language: any;
  searchQuery: string = '';

  panditList: any[] = [];
  profileImages: { [key: number]: string } = {};

  isLoading = false;

  // Skip client-side filter when server already did exact filtering
  serverSideSearchActive = false;

  isPanditModalOpen = false;
  activePandit: any = null;
  activePanditServices: any[] = [];
  isLoadingServices = false;
  showbottomtab: boolean = true;

  isExploreModalOpen = false;
  selectedPandit: any = null;
  selectedService: any = null;

  isScannerOpen = false;
  scannedQrData: string | null = null;
  formats = [BarcodeFormat.QR_CODE];

  panditServiceBookingMap: { [key: string]: number } = {};

  locationState: 'idle' | 'fetching' | 'granted' | 'denied' | 'unavailable' = 'idle';

  currentImageIndex: { [key: string]: number } = {};
  currentLat: number | null = null;
  currentLng: number | null = null;
  query = '';

  pageNumber = 1;
  pageSize = 10;
  private searchTimeout: any;
  private infiniteScrollEvent: any = null;
  userLoggedIn = false;
  lightboxImageUrl: string | null = null;
  selectedCity: string = '';
  availableCities: string[] = [];

  // ─── Like / Share / View tracking ────────────────────────────────────────
  /**
   * Map of PanditUserID → ProfileLikeID for pandits the current user has liked.
   * Storing the ProfileLikeID (from the DB) is required to call ProfileLikeDelete.
   * Populated on modal open (via API check) and on fresh like (via Insert response).
   */
  likedPanditMap = new Map<number, number>(); // panditUserID → profileLikeID

  /**
   * Set of PanditUserIDs whose like-status is currently being fetched from the API.
   * Used to show a loading state on the like button while the check is in flight.
   */
  likeCheckingIDs = new Set<number>();

  /** Whether a like/unlike API call is currently in-flight (prevents double-tap). */
  isTogglingLike = false;

  labels = {
    en: {
      verifiedTrusted: 'Verified & Trusted',
      searchPlaceholder: 'Search by name, language...',
      all: 'All',
      scanQrCode: 'Scan QR Code',
      mangalBhavSub: '✦ Mangal.Bhav ✦',
      qrHint: 'Point camera at a Mangal.Bhav QR code',
      fetchingLocation: 'Fetching your location…',
      showingNearest: '📍 Showing pandits nearest to you',
      locationDenied: '🔒 Location denied —',
      tapToRetry: 'Tap to retry',
      locationUnavailable: '📍 Location unavailable — showing all pandits',
      loadingPandits: 'Loading pandits…',
      gettingLocation: 'Getting your location…',
      loadingMore: 'Loading more pandits...',
      noPanditsFound: 'No pandits found.',
      yrsExp: 'yrs exp',
      defaultYrsExp: '5+ yrs exp',
      defaultLang: 'Hindi',
      defaultLocation: 'India',
      viewProfile: 'View Profile',
      panditProfile: '🙏 Pandit Profile',
      memberSince: 'Member since',
      chat: 'Chat With Pandit Ji',
      experience: 'Experience',
      gender: 'Gender',
      languages: 'Languages',
      dakshina: 'Dakshina',
      contact: 'Contact',
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
      divider: '✦ ॐ ✦ ॐ ✦',
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
      like: 'Like',
      liked: 'Liked',
      share: 'Share',
      viewsLabel: 'Views',
      likesLabel: 'Likes',
      sharesLabel: 'Shares',
    },
    hi: {
      viewsLabel: 'दृश्य',
      likesLabel: 'पसंद',
      sharesLabel: 'साझा',
      verifiedTrusted: 'सत्यापित और विश्वसनीय',
      searchPlaceholder: 'नाम, भाषा से खोजें...',
      all: 'सभी',
      scanQrCode: 'QR कोड स्कैन करें',
      mangalBhavSub: '✦ मंगल.भाव ✦',
      qrHint: 'Mangal.Bhav QR कोड पर कैमरा लगाएं',
      fetchingLocation: 'आपकी लोकेशन खोजी जा रही है…',
      showingNearest: '📍 आपके नज़दीकी पंडित दिखाए जा रहे हैं',
      locationDenied: '🔒 लोकेशन अस्वीकृत —',
      tapToRetry: 'पुनः प्रयास करें',
      locationUnavailable: '📍 लोकेशन उपलब्ध नहीं — सभी पंडित दिखाए जा रहे हैं',
      loadingPandits: 'पंडित लोड हो रहे हैं…',
      gettingLocation: 'लोकेशन प्राप्त की जा रही है…',
      loadingMore: 'और पंडित लोड हो रहे हैं...',
      noPanditsFound: 'कोई पंडित नहीं मिला।',
      yrsExp: 'वर्ष अनुभव',
      defaultYrsExp: '5+ वर्ष अनुभव',
      defaultLang: 'हिंदी',
      defaultLocation: 'भारत',
      viewProfile: 'प्रोफ़ाइल देखें',
      panditProfile: '🙏 पंडित प्रोफ़ाइल',
      memberSince: 'सदस्य हैं',
      chat: 'पंडित जी से संवाद करे',
      experience: 'अनुभव',
      gender: 'लिंग',
      languages: 'भाषाएँ',
      dakshina: 'दक्षिणा',
      contact: 'संपर्क',
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
      divider: '✦ ॐ ✦ ॐ ✦',
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
      like: 'पसंद',
      liked: 'पसंद किया',
      share: 'साझा करें',
    }
  };
  viewsCount: any;
  likeCount: any;
  shareCount: any;

  get t() {
    return this.language === 'Hindi' ? this.labels.hi : this.labels.en;
  }

  private destroy$ = new Subject<void>();
  private _cleanNameCache = new Map<string, string>();

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private router: Router,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  ionViewDidEnter() {
    try {
      gtag('event', 'open_find_pandit', { page_name: 'Open Find Pandit' });
    } catch (_) { }
  }

  async ngOnInit() {
    if (this.router.url === '/tabs/find-pandit') {
      this.showbottomtab = false;
    }

    this.userDetails = await this.storage.get('account');
    this.userLoggedIn = !!this.userDetails?.LoginID;
    this.language = await this.storage.get('Language');

    if (this.checkPanditDeepLink()) return;

    localStorage.removeItem('findPanditThroghtFloating');
    this.locationState = 'idle';
    this.query = `1=1 ORDER BY U.UserID DESC`;
    this.pageNumber = 1;
    this.panditList = [];
    this.loadPanditProfiles(this.query);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.searchTimeout);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CORE LOAD
  // ─────────────────────────────────────────────────────────────────────────
  loadPanditProfiles(query: string, loadMore = false) {
    if (!loadMore) {
      this.isLoading = true;
      this.cdr.markForCheck();
    }

    const body = {
      query: query.replace(/\s+/g, ' ').trim(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.apinu.postUrlData('UsersNUSelectByQueryPaging', body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userRes: any) => {
          const users = userRes?.UserList;

          if (!users?.length) {
            this.isLoading = false;
            this._completeInfiniteScroll(true);
            this.cdr.markForCheck();
            return;
          }

          from(users).pipe(
            mergeMap(
              (user: any) =>
                this.apinu.postUrlData(`ProfilesSelectAllByUserID?userID=${user.UserID}`, null).pipe(
                  map((profileRes: any) => {
                    const profile = profileRes?.ProfileList?.[0] || null;
                    return {
                      user,
                      profile,
                      _city: profile?.City || profile?.State || null,
                      panditServices: [],
                      _servicesLoaded: false
                    };
                  })
                ),
              CONCURRENCY
            ),
            toArray(),
            takeUntil(this.destroy$)
          ).subscribe({
            next: (result: any[]) => {
              this.panditList = loadMore ? [...this.panditList, ...result] : result;
              this.isLoading = false;
              this.cdr.markForCheck();

              result.forEach(item => {
                if (item.profile) this.loadProfileImage(item.profile);
              });

              if (!loadMore) {
                const pandituserid = new URL(window.location.href).searchParams.get('pandituserid');
                if (pandituserid && this.panditList.length > 0) {
                  setTimeout(() => this.openPanditModal(this.panditList[0]), 500);
                }
              }

              this._completeInfiniteScroll(result.length < this.pageSize);
              this._extractCities();
            },
            error: () => {
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        },
        error: () => {
          this.isLoading = false;
          this._completeInfiniteScroll(false);
          this.cdr.markForCheck();
        }
      });
  }

  private _extractCities() {
    const seen = new Set<string>();
    this.panditList.forEach(item => {
      if (item.profile?.City) seen.add(item.profile.City);
    });
    this.availableCities = Array.from(seen).sort().slice(0, 12);
    this.cdr.markForCheck();
  }

  filterByCity(city: string) {
    this.selectedCity = (this.selectedCity === city) ? '' : city;
    this.cdr.markForCheck();
  }

  private _completeInfiniteScroll(disable: boolean) {
    if (!this.infiniteScrollEvent) return;
    this.infiniteScrollEvent.target.complete();
    if (disable) this.infiniteScrollEvent.target.disabled = true;
    this.infiniteScrollEvent = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOCATION / NEARBY
  // ─────────────────────────────────────────────────────────────────────────
  async onShowNearby() {
    this.pageNumber = 1;
    this.panditList = [];
    this.infiniteScrollEvent = null;
    await this.fetchNearbyPandits();
  }

  async fetchNearbyPandits() {
    this.locationState = 'fetching';
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      let lat: number;
      let lng: number;

      if (Capacitor.getPlatform() === 'web') {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 10000, maximumAge: 0
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } else {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
          this.locationState = 'denied';
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      this.currentLat = lat;
      this.currentLng = lng;
      this.locationState = 'granted';
      this.serverSideSearchActive = false;

      this.query = this._distanceOrderBy(lat, lng);
      this.pageNumber = 1;
      this.panditList = [];
      this.loadPanditProfiles(this.query);

    } catch (err) {
      console.error('Location error:', err);
      this.locationState = 'unavailable';
      this.serverSideSearchActive = false;
      this.query = `1=1 ORDER BY U.UserID DESC`;
      this.pageNumber = 1;
      this.panditList = [];
      this.loadPanditProfiles(this.query);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    const q = value?.trim();

    if (!q) {
      this.serverSideSearchActive = false;
      this.pageNumber = 1;
      this.panditList = [];
      this.query = (this.currentLat && this.currentLng)
        ? this._distanceOrderBy(this.currentLat, this.currentLng)
        : `1=1 ORDER BY U.UserID DESC`;
      this.loadPanditProfiles(this.query);
      return;
    }

    if (q.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.panditList = [];

      if (/^MBP-/i.test(q)) {
        if (!/^MBP-\d{4}-\d{4}$/i.test(q)) return;

        this.apinu.postUrlData(
          `UserReferralCodeSelectByQuery?Query= ReferralCode = '${this._sanitizeSql(q)}' AND IsActive = 1`, null
        ).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: any) => {
              const uid = Number(res?.UserReferralCodeList?.[0]?.UserID);
              if (uid && !isNaN(uid)) {
                this.serverSideSearchActive = true;
                this.query = `U.UserID = ${uid} ORDER BY U.UserID DESC`;
                this.loadPanditProfiles(this.query);
                return;
              }
              this._doTextSearch(q);
            },
            error: () => this._doTextSearch(q)
          });
        return;
      }

      this._doTextSearch(q);
    }, 500);
  }

  private _doTextSearch(q: string) {
    this.serverSideSearchActive = false;
    const safe = this._sanitizeSql(q);

    const orderBy = (this.currentLat && this.currentLng)
      ? `ORDER BY ${this._haversineExpr(this.currentLat, this.currentLng)} ASC`
      : `ORDER BY U.UserID DESC`;

    this.query = `(
      U.UserID IN (SELECT UserID FROM Profiles WHERE FullName LIKE '%${safe}%')
      OR U.UserID IN (SELECT UserID FROM UserReferralCode WHERE ReferralCode LIKE '%${safe}%')
      OR U.UserID IN (
        SELECT PS.ProfileID FROM PanditServices PS
        INNER JOIN Locations L ON L.LocationID = PS.LocationID
        WHERE L.Name LIKE '%${safe}%' OR L.City LIKE '%${safe}%' OR L.State LIKE '%${safe}%'
      )
    ) ${orderBy}`;

    this.loadPanditProfiles(this.query);
  }

  private _sanitizeSql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .trim();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEEP LINK
  // ─────────────────────────────────────────────────────────────────────────
  checkPanditDeepLink(): boolean {
    const raw = new URL(window.location.href).searchParams.get('pandituserid');
    if (!raw) return false;

    const uid = Number(raw);
    if (!uid || isNaN(uid) || uid <= 0 || !Number.isInteger(uid)) return false;

    this.serverSideSearchActive = true;
    this.query = `U.UserID = ${uid} ORDER BY U.UserID DESC`;
    this.pageNumber = 1;
    this.panditList = [];
    this.loadPanditProfiles(this.query);
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INFINITE SCROLL
  // ─────────────────────────────────────────────────────────────────────────
  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
    this.pageNumber++;
    this.loadPanditProfiles(this.query, true);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERED LIST
  // ─────────────────────────────────────────────────────────────────────────
  get filteredPanditList(): any[] {
    let list = this.panditList;

    if (!this.serverSideSearchActive) {
      const q = this.searchQuery?.trim().toLowerCase();
      if (q) {
        list = list.filter(item => {
          const name = (item.profile?.FullName || '').toLowerCase();
          const lang = (item.profile?.Languages || '').toLowerCase();
          const city = (item._city || '').toLowerCase();
          return name.includes(q) || lang.includes(q) || city.includes(q);
        });
      }
    }

    if (this.selectedCity) {
      list = list.filter(item =>
        item.profile?.City === this.selectedCity ||
        item.profile?.State === this.selectedCity
      );
    }

    return list;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRACK-BY FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────
  trackByUserID(_: number, item: any): number {
    return item.user?.UserID ?? _;
  }

  trackByServiceID(_: number, ps: any): number {
    return ps.PanditServiceID ?? _;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL — PANDIT DETAIL
  // ─────────────────────────────────────────────────────────────────────────
  openPanditModal(item: any) {
    this.activePandit = item;
    this.activePanditServices = item.panditServices || [];
    this.lightboxImageUrl = null;
    this.isPanditModalOpen = true;
    this.cdr.markForCheck();

    // Track profile view (fire-and-forget, must not block UI)
    this.trackProfileView(item);


    //console.log(item.user.UserID)

    this.checkEngagements(item);
    // Check if the logged-in user has already liked this pandit (hydrates likedPanditMap)
    this.checkExistingLike(item);

    if (!item._servicesLoaded) {
      this.isLoadingServices = true;
      this.loadServicesForPandit(item)
        .then(services => {
          item.panditServices = services;
          item._servicesLoaded = true;
          this.activePanditServices = services;
          this.isLoadingServices = false;
          this.cdr.markForCheck();
          this.loadBookingCounts(services);
        })
        .catch(() => {
          item._servicesLoaded = true;
          this.activePanditServices = [];
          this.isLoadingServices = false;
          this.cdr.markForCheck();
        });
    }
  }


  checkEngagements(item: any) {
    this.apinu.postUrlData(`ProfileEngagementCount_Select?PanditUserID=${item.user.UserID}`, null)
      .subscribe({
        next: (res: any) => {
          let data: any = res;

          // Unwrap if the response came back as a raw JSON string
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch {
              data = null;
            }
          }

          // Handle accidental double-array wrapping
          if (Array.isArray(data) && Array.isArray(data[0])) {
            data = data[0];
          }

          // Since the SP returns a single row
          const engagementStats = data?.[0] ?? null;

          console.log('Engagement Stats:', engagementStats);

          // Example
          this.viewsCount = engagementStats?.ViewsCount ?? 0;
          this.likeCount = engagementStats?.LikeCount ?? 0;
          this.shareCount = engagementStats?.ShareCount ?? 0;
        },
        error: (err: any) => {
          console.error('Profile engagement error:', err);
        }
      });
  }
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
          error: () => { /* silently ignore booking count failures */ }
        });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE VIEW TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Records a ProfileView event. Fire-and-forget — errors are swallowed
   * so a tracking failure can never break the modal open flow.
   */
  private trackProfileView(item: any): void {
    const panditUserID = item.profile?.UserID || item.user?.UserID;
    if (!panditUserID) return;

    const payload = {
      TenantID: 1,
      PanditUserID: panditUserID,
      ViewedByUserID: this.userDetails?.UserID || 0,   // 0 = anonymous / guest
      IPAddress: '',
      Device: Capacitor.getPlatform() || 'web',
      Source: 'FindPandit',
      DateAdded: new Date().toISOString()
    };

    this.apinu.postUrlData('ProfileViewsInsert', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: () => { /* tracking failure must not crash the page */ } });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE LIKE TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  /** Returns true if the current user has already liked this pandit. */
  isPanditLiked(item: any): boolean {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    return !!panditUserID && this.likedPanditMap.has(panditUserID);
  }

  /** Returns true while the API like-check for this pandit is in-flight. */
  isPanditLikeChecking(item: any): boolean {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    return !!panditUserID && this.likeCheckingIDs.has(panditUserID);
  }

  /**
   * Called from openPanditModal — checks whether the logged-in user has already
   * liked this pandit and hydrates likedPanditMap with the DB record's ProfileLikeID.
   * Skipped for guests (UserID = 0) and skipped if already cached this session.
   */
  private checkExistingLike(item: any): void {
    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    const loggedInUserID = this.userDetails?.UserID;

    // Skip for guests, and skip if we already know the like state for this pandit
    if (!panditUserID || !loggedInUserID) return;
    if (this.likedPanditMap.has(panditUserID) || this.likeCheckingIDs.has(panditUserID)) return;

    this.likeCheckingIDs.add(panditUserID);
    this.cdr.markForCheck();

    // Query: find an active like record for this (pandit, user) pair
    const query = `PanditUserID = ${panditUserID} AND LikedByUserID = ${loggedInUserID}`;

    this.apinu.postUrlData(`ProfileLikeSelectByQuery?tenantID=1&schoolID=0&Query=${encodeURIComponent(query)}`, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.likeCheckingIDs.delete(panditUserID);
          const existing = res?.ProfileLikeList?.[0];
          if (existing?.ProfileLikeID) {
            // Already liked — store the DB ID so we can delete it later
            this.likedPanditMap.set(panditUserID, existing.ProfileLikeID);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          // Silently fail — like button will default to un-liked state
          this.likeCheckingIDs.delete(panditUserID);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Toggles like/unlike for the given pandit.
   *
   * LIKE path:
   *   → POST ProfileLikeInsert
   *   → Store returned ProfileLikeID in likedPanditMap
   *
   * UNLIKE path:
   *   → POST ProfileLikeDelete with the stored ProfileLikeID
   *   → Remove from likedPanditMap
   *
   * A debounce guard (isTogglingLike) prevents duplicate in-flight requests.
   */
  toggleLike(item: any): void {
    if (this.isTogglingLike) return;

    const panditUserID = item?.profile?.UserID || item?.user?.UserID;
    if (!panditUserID) return;

    const alreadyLiked = this.likedPanditMap.has(panditUserID);

    if (alreadyLiked) {
      // ── UNLIKE ──────────────────────────────────────────────────────────
      const profileLikeID = this.likedPanditMap.get(panditUserID)!;

      // Optimistic UI update first so the button feels instant
      this.likedPanditMap.delete(panditUserID);
      this.isTogglingLike = true;
      this.cdr.markForCheck();

      this.apinu.postUrlData(`ProfileLikeDelete?profileLikeID=${profileLikeID}&tenantID=1`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Already removed optimistically — just release the guard
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          },
          error: () => {
            // Rollback: put the like back if the delete failed
            this.likedPanditMap.set(panditUserID, profileLikeID);
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          }
        });

    } else {
      // ── LIKE ────────────────────────────────────────────────────────────
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
            // Store the ProfileLikeID returned by the API — needed for future delete
            const newLikeID = res?.ProfileLikeID;
            if (newLikeID) {
              this.likedPanditMap.set(panditUserID, newLikeID);
            } else {
              // API succeeded but didn't return an ID (edge case).
              // Store a sentinel (-1) so isPanditLiked stays true.
              this.likedPanditMap.set(panditUserID, -1);
            }
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          },
          error: () => {
            // Don't mark as liked if the API call actually failed
            this.isTogglingLike = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL — EXPLORE SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  exploreService(service: any) {
    this.selectedPandit = this.activePandit;
    this.selectedService = service;
    this.isPanditModalOpen = false;
    setTimeout(() => { this.isExploreModalOpen = true; this.cdr.markForCheck(); }, 250);
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
  // QR SCANNER
  // ─────────────────────────────────────────────────────────────────────────
  openQrScanner() { this.isScannerOpen = true; this.cdr.markForCheck(); }

  closeQrScanner() {
    this.isScannerOpen = false;
    this.serverSideSearchActive = false;
    this.query = `1=1 ORDER BY U.UserID DESC`;
    this.pageNumber = 1;
    this.panditList = [];
    this.loadPanditProfiles(this.query);
  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;
    const match = result.toLowerCase().match(/pandituserid=(\d+)/);
    if (match) {
      const uid = Number(match[1]);
      if (uid && !isNaN(uid) && uid > 0) {
        this.serverSideSearchActive = true;
        this.query = `U.UserID = ${uid} ORDER BY U.UserID DESC`;
        this.pageNumber = 1;
        this.panditList = [];
        this.loadPanditProfiles(this.query);
      }
    }
  }

  onScanError(error: any) { console.error('Scan error:', error); }

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGES
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

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────
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

  getServiceImages(serviceName: string): string[] {
    const n = this.getCleanName(serviceName);
    return [`assets/img/${n}.png`, `assets/img/${n}2.jfif`, `assets/img/${n}3.jfif`];
  }

  getCurrentImage(serviceName: string): string {
    if (!serviceName) return 'assets/img/default.jpg';
    const key = this.getCleanName(serviceName);
    if (!(key in this.currentImageIndex)) this.currentImageIndex[key] = 0;
    return this.getServiceImages(serviceName)[this.currentImageIndex[key] || 0];
  }

  openPage(pageName: any) { this.routerCtrl.navigateForward(`/${pageName}`); }

  openLightbox(url: string) { this.lightboxImageUrl = url; this.cdr.markForCheck(); }
  closeLightbox() { this.lightboxImageUrl = null; this.cdr.markForCheck(); }

  // ─────────────────────────────────────────────────────────────────────────
  // SHARE — now also records ProfileShare to the API
  // ─────────────────────────────────────────────────────────────────────────
  sharePandit(item: any) {
    const panditName = item.profile?.FullName || 'Pandit Ji';
    const panditUserID = item.profile?.UserID;
    const link = `https://app.mangalbhav.com/open-find-pandit?pandituserid=${panditUserID}`;
    const message =
      `🙏 *${panditName}* को Mangal Bhav पर personally recommend करता हूँ —\n\n` +
      `For your upcoming pooja, *इनसे बेहतर कोई नहीं।*\n` +
      `Deeply knowledgeable, experienced & truly devoted. ✨\n\n` +
      `📲 *Profile देखें और बुक करें:*\n${link}\n\n🪔 *Jai Shri Ram*`;

    // Record the share event (fire-and-forget)
    if (panditUserID) {
      const payload = {
        TenantID: 1,
        PanditUserID: panditUserID,
        SharedByUserID: this.userDetails?.UserID || 0,
        IPAddress: '',
        Device: Capacitor.getPlatform() || 'web',
        Source: 'FindPandit',
        DateAdded: new Date().toISOString()
      };
      this.apinu.postUrlData('ProfileShareInsert', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ error: () => { /* tracking failure must not block share */ } });
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE QUERY BUILDERS
  // ─────────────────────────────────────────────────────────────────────────
  private _haversineExpr(lat: number, lng: number): string {
    return `(6371 * ACOS(COS(RADIANS(${lat})) * COS(RADIANS(L.Latitude)) * COS(RADIANS(L.Longitude) - RADIANS(${lng})) + SIN(RADIANS(${lat})) * SIN(RADIANS(L.Latitude))))`;
  }

  private _distanceOrderBy(lat: number, lng: number): string {
    return `1=1 ORDER BY ${this._haversineExpr(lat, lng)} ASC`;
  }

  async chatWithPandit(item: any) {
    const panditUserID = item.profile?.UserID || item.user?.UserID;
    if (!panditUserID) return;

    this.isPanditModalOpen = false;
    await new Promise(resolve => setTimeout(resolve, 300));

    this.router.navigate(['/chatbox'], {
      queryParams: {
        groupId: 0,
        chatType: 'OneToOne',
        withUserID: panditUserID,
        withUserName:
          item.profile?.FullName ||
          item.user?.Username ||
          'Pandit Ji'
      }
    });
  }
}