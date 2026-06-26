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

// ── Max simultaneous HTTP calls in any mergeMap ──
const CONCURRENCY = 4;
declare let gtag: Function;
@Component({
  selector: 'app-find-pandit',
  templateUrl: './find-pandit.component.html',
  styleUrls: ['./find-pandit.component.scss'],
  standalone: true,
  // OnPush: only re-render when inputs change, an event fires, or markForCheck() is called
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

  // ── Lifecycle / cleanup ──
  private destroy$ = new Subject<void>();

  // ── Memoization cache for getCleanName ──
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
    private cdr: ChangeDetectorRef   // needed for OnPush
  ) { }

  ionViewDidEnter() {
    gtag('event', 'open_find_pandit', {
      page_name: 'Open Find Pandit'
    });
  }
  
  async ngOnInit() {
    if (this.router.url === '/tabs/find-pandit') {
      this.showbottomtab = false;
    }

    this.userDetails = await this.storage.get('account');
    this.userLoggedIn = !!this.userDetails?.LoginID;
    this.language = await this.storage.get('Language');

    const url = new URL(window.location.href);
    const pandituserid = url.searchParams.get('pandituserid');
    const isDeepLink = this.checkPanditDeepLink();

    if (isDeepLink) return;

    if (
      !pandituserid &&
      this.userLoggedIn &&
      localStorage.getItem('findPanditThroghtFloating') !== 'findPanditThroghtFloating' &&
      this.router.url !== '/tabs/find-pandit'
    ) {
      // QR scanner path (unchanged)
    } else {
      localStorage.removeItem('findPanditThroghtFloating');
      this.locationState = 'idle';
      this.query = `1=1 ORDER BY U.UserID DESC`;
      this.pageNumber = 1;
      this.panditList = [];
      this.loadPanditProfiles(this.query);
    }
  }

  ngOnDestroy() {
    // Cancel all in-flight requests
    this.destroy$.next();
    this.destroy$.complete();
    // Clear any pending search debounce
    clearTimeout(this.searchTimeout);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CORE LOAD  (Two-phase: cards appear fast, city chips fill in async)
  //
  // Phase 1 — fetch profiles in parallel (CONCURRENCY at a time)
  //           → panditList is populated, cards render immediately
  // Phase 2 — fetch first-service city per card, update in-place
  //           → city chip updates one by one as responses arrive
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

          // ── Phase 1: profiles only (no location wait) ──
          from(users).pipe(
            mergeMap(
              (user: any) =>
                this.apinu.postUrlData(`ProfilesSelectAllByUserID?userID=${user.UserID}`, null).pipe(
                  map((profileRes: any) => ({
                    user,
                    profile: profileRes?.ProfileList?.[0] || null,
                    _city: null,             // filled in phase 2
                    panditServices: [],
                    _servicesLoaded: false
                  }))
                ),
              CONCURRENCY                    // max 4 profile requests at once
            ),
            toArray(),
            takeUntil(this.destroy$)
          ).subscribe((result: any[]) => {

            // ── Render cards immediately ──
            this.panditList = loadMore ? [...this.panditList, ...result] : result;
            this.isLoading = false;
            this.cdr.markForCheck();

            // Profile images are direct CDN URLs — no extra call needed
            result.forEach(item => {
              if (item.profile) this.loadProfileImage(item.profile);
            });

            // Auto-open modal for deep-links
            const pandituserid = new URL(window.location.href).searchParams.get('pandituserid');
            if (pandituserid && this.panditList.length > 0) {
              setTimeout(() => this.openPanditModal(this.panditList[0]), 500);
            }

            this._completeInfiniteScroll(result.length < this.pageSize);

            // ── Phase 2: load city for each card, non-blocking ──
            this._loadCitiesAsync(result);
          });
        },
        error: () => {
          this.isLoading = false;
          this._completeInfiniteScroll(false);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Fetch the first-service city for a batch of pandit items.
   * Each item's _city is updated in-place as responses arrive (max 3 concurrent).
   */
  private _loadCitiesAsync(items: any[]) {
    from(items).pipe(
      mergeMap(
        (item: any) =>
          this.apinu.postUrlData(`PanditServicesSelectAllByProfileID?profileID=${item.user.UserID}`, null).pipe(
            mergeMap((svcRes: any) => {
              const firstSvc = svcRes?.PanditServiceList?.[0];
              if (!firstSvc?.LocationID) return of({ item, city: null });

              return this.apinu.postUrlData(
                `LocationSelect?locationID=${firstSvc.LocationID}&tenantID=1`, null
              ).pipe(
                map((locRes: any) => {
                  const loc = locRes?.LocationList?.[0];
                  return { item, city: loc?.Name || loc?.City || null };
                })
              );
            })
          ),
        3   // max 3 city lookups simultaneously
      ),
      takeUntil(this.destroy$)
    ).subscribe((result: any) => {
      result.item._city = result.city;
      this.cdr.markForCheck();
    });
  }

  /** Safely complete / disable the infinite scroll handle. */
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

      this.query = this._distanceOrderBy(lat, lng);
      this.pageNumber = 1;
      this.panditList = [];
      this.loadPanditProfiles(this.query);

    } catch (err) {
      console.error('Location error:', err);
      this.locationState = 'unavailable';
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

      const orderBy = (this.currentLat && this.currentLng)
        ? `ORDER BY ${this._haversineExpr(this.currentLat, this.currentLng)} ASC`
        : `ORDER BY U.UserID DESC`;

      this.query = `(
  U.UserID IN (SELECT UserID FROM Profiles WHERE FullName LIKE '%${q}%')
  OR
  U.UserID IN (
    SELECT PS.ProfileID FROM PanditServices PS
    INNER JOIN Locations L ON L.LocationID = PS.LocationID
    WHERE L.Name LIKE '%${q}%' OR L.City LIKE '%${q}%' OR L.State LIKE '%${q}%'
  )
) ${orderBy}`;

      this.loadPanditProfiles(this.query);
    }, 500);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEEP LINK
  // ─────────────────────────────────────────────────────────────────────────
  checkPanditDeepLink(): boolean {
    const pandituserid = new URL(window.location.href).searchParams.get('pandituserid');
    if (!pandituserid) return false;

    this.query = `U.UserID = ${Number(pandituserid)} ORDER BY U.UserID DESC`;
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
  // FILTERED LIST  (getter — cheap with OnPush since CD runs less often)
  // ─────────────────────────────────────────────────────────────────────────
  get filteredPanditList(): any[] {
    const q = this.searchQuery?.trim().toLowerCase();
    if (!q) return this.panditList;
    return this.panditList.filter(item => {
      const name = (item.profile?.FullName || '').toLowerCase();
      const lang = (item.profile?.Languages || '').toLowerCase();
      const city = (item._city || '').toLowerCase();
      return name.includes(q) || lang.includes(q) || city.includes(q);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRACK-BY FUNCTIONS  (prevent full DOM re-creation on every list update)
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

    if (!item._servicesLoaded) {
      this.isLoadingServices = true;
      this.loadServicesForPandit(item).then(services => {
        item.panditServices = services;
        item._servicesLoaded = true;
        this.activePanditServices = services;
        this.isLoadingServices = false;
        this.cdr.markForCheck();
        this.loadBookingCounts(services);
      });
    }
  }

  async loadServicesForPandit(item: any): Promise<any[]> {
    return new Promise(resolve => {
      this.apinu.postUrlData(`PanditServicesSelectAllByProfileID?profileID=${item.user.UserID}`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe((serviceRes: any) => {
          const services = serviceRes?.PanditServiceList || [];
          if (!services.length) { resolve([]); return; }

          from(services).pipe(
            mergeMap(
              (ps: any) =>
                forkJoin({
                  serviceDetail:   this.apinu.postUrlData(`ServiceSelect?serviceID=${ps.ServiceID}&tenantID=1`, null),
                  locationDetail:  this.apinu.postUrlData(`LocationSelect?locationID=${ps.LocationID}&tenantID=1`, null),
                  categoryMapping: this.apinu.postUrlData(`ServiceCategoryMappingSelectAllByServiceID?serviceID=${ps.ServiceID}`, null)
                }).pipe(
                  mergeMap((res: any) => {
                    const mappings = res.categoryMapping?.ServiceCategoryMappingList || [];
                    if (!mappings.length) {
                      return of({
                        ...ps,
                        ServiceDetails:  res.serviceDetail?.ServiceList  || null,
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
                        3   // max 3 category fetches at once
                      ),
                      toArray(),
                      map((cats: any[]) => ({
                        ...ps,
                        ServiceDetails:  res.serviceDetail?.ServiceList  || null,
                        LocationDetails: res.locationDetail?.LocationList || null,
                        Categories: cats
                      }))
                    );
                  })
                ),
              2   // max 2 services processed simultaneously
            ),
            toArray(),
            takeUntil(this.destroy$)
          ).subscribe(loaded => resolve(loaded));
        });
    });
  }

  loadBookingCounts(services: any[]) {
    services.forEach((ps: any) => {
      if (!ps.PanditServiceID) return;
      this.panditServiceBookingMap[String(ps.PanditServiceID)] = 0;
      this.apinu.postUrlData(`BookingsSelectAllByPanditServiceID?panditServiceID=${ps.PanditServiceID}`, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.panditServiceBookingMap[String(ps.PanditServiceID)] = (res?.BookingList?.length || 0) + 10;
          this.cdr.markForCheck();
        });
    });
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
    this.loadPanditProfiles(`1=1 ORDER BY U.UserID DESC`);
  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;
    const match = result.toLowerCase().match(/pandituserid=(\d+)/);
    if (match) {
      this.loadPanditProfiles(`U.UserID = ${Number(match[1])} ORDER BY U.UserID DESC`);
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

  /** Memoized: computing this on every CD cycle was wasteful. */
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
    if (!(key in this.currentImageIndex)) {
      this.currentImageIndex[key] = 0;
      // Removed the 100,000,000 ms setInterval — it never fires and leaks memory
    }
    const images = this.getServiceImages(serviceName);
    return images[this.currentImageIndex[key] || 0];
  }

  openPage(pageName: any) { this.routerCtrl.navigateForward(`/${pageName}`); }

  openLightbox(url: string) { this.lightboxImageUrl = url; this.cdr.markForCheck(); }
  closeLightbox() { this.lightboxImageUrl = null; this.cdr.markForCheck(); }

  sharePandit(item: any) {
    const panditName = item.profile?.FullName || 'Pandit Ji';
    const panditUserID = item.profile?.UserID;
    const link = `https://app.mangalbhav.com/open-find-pandit?pandituserid=${panditUserID}`;
    const message =
      `🙏 *${panditName}* को Mangal Bhav पर personally recommend करता हूँ —\n\n` +
      `For your upcoming pooja, *इनसे बेहतर कोई नहीं।*\n` +
      `Deeply knowledgeable, experienced & truly devoted. ✨\n\n` +
      `📲 *Profile देखें और बुक करें:*\n${link}\n\n🪔 *Jai Shri Ram*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE QUERY BUILDERS  (DRY — used in 3+ places)
  // ─────────────────────────────────────────────────────────────────────────
  private _haversineExpr(lat: number, lng: number): string {
    return `(6371 * ACOS(COS(RADIANS(${lat})) * COS(RADIANS(L.Latitude)) * COS(RADIANS(L.Longitude) - RADIANS(${lng})) + SIN(RADIANS(${lat})) * SIN(RADIANS(L.Latitude))))`;
  }

  private _distanceOrderBy(lat: number, lng: number): string {
    return `1=1 ORDER BY ${this._haversineExpr(lat, lng)} ASC`;
  }
}