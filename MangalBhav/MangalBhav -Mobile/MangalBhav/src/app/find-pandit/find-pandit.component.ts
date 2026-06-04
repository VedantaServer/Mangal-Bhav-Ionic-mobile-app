import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { forkJoin, from, map, mergeMap, of, toArray } from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-find-pandit',
  templateUrl: './find-pandit.component.html',
  styleUrls: ['./find-pandit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule, TabscommonheaderComponent,
    PanditjibottomtabsComponent, JajmanbottomtabsComponent]
})
export class FindPanditComponent implements OnInit {

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

  // ── Location state ──
  // 'idle'       → page just loaded, "Show Nearby" button visible
  // 'fetching'   → requesting GPS
  // 'granted'    → location obtained, sorted by distance
  // 'denied'     → user blocked permission
  // 'unavailable'→ GPS failed
  locationState: 'idle' | 'fetching' | 'granted' | 'denied' | 'unavailable' = 'idle';

  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};
  currentLat: number | null = null;
  currentLng: number | null = null;
  query = '';

  pageNumber = 1;
  pageSize = 10;
  searchTimeout: any;
  private infiniteScrollEvent: any = null;

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private router: Router,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    if (this.router.url === '/tabs/find-pandit') {
      this.showbottomtab = false;
    }

    this.userDetails = await this.storage.get('account');
    this.language = await this.storage.get('Language');

    if (localStorage.getItem('findPanditThroghtFloating') !== 'findPanditThroghtFloating'
      && this.router.url !== '/tabs/find-pandit') {
      this.openQrScanner();
    } else {
      localStorage.removeItem('findPanditThroghtFloating');

      // ✅ On init: load all pandits by date — NO location fetch
      this.locationState = 'idle';
      this.query = `1=1 ORDER BY U.UserID DESC`;
      this.pageNumber = 1;
      this.panditList = [];
      this.loadPanditProfiles(this.query);
    }
  }

  // ── Called when user taps "📍 Show Nearby Pandits" or "Tap to retry" ──
  async onShowNearby() {
    this.pageNumber = 1;
    this.panditList = [];
    this.infiniteScrollEvent = null;
    await this.fetchNearbyPandits();
  }

  async fetchNearbyPandits() {
    this.locationState = 'fetching';
    this.isLoading = true;

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
          return;
        }
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true, timeout: 10000
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      this.currentLat = lat;
      this.currentLng = lng;
      this.locationState = 'granted';

      this.query = `1=1 ORDER BY (6371 * ACOS(COS(RADIANS(${lat})) * COS(RADIANS(L.Latitude)) * COS(RADIANS(L.Longitude) - RADIANS(${lng})) + SIN(RADIANS(${lat})) * SIN(RADIANS(L.Latitude)))) ASC`;
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

  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    const q = value?.trim();

    if (!q) {
      this.pageNumber = 1;
      this.panditList = [];
      // Restore appropriate sort based on whether location is already granted
      this.query = (this.currentLat && this.currentLng)
        ? `1=1 ORDER BY (6371 * ACOS(COS(RADIANS(${this.currentLat})) * COS(RADIANS(L.Latitude)) * COS(RADIANS(L.Longitude) - RADIANS(${this.currentLng})) + SIN(RADIANS(${this.currentLat})) * SIN(RADIANS(L.Latitude)))) ASC`
        : `1=1 ORDER BY U.UserID DESC`;
      this.loadPanditProfiles(this.query);
      return;
    }

    if (q.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.panditList = [];

      const orderBy = (this.currentLat && this.currentLng)
        ? `ORDER BY (6371 * ACOS(COS(RADIANS(${this.currentLat})) * COS(RADIANS(L.Latitude)) * COS(RADIANS(L.Longitude) - RADIANS(${this.currentLng})) + SIN(RADIANS(${this.currentLat})) * SIN(RADIANS(L.Latitude)))) ASC`
        : `ORDER BY U.UserID DESC`;

      this.query = `U.UserID IN (SELECT UserID FROM Profiles WHERE FullName LIKE '%${q}%') ${orderBy}`;
      this.loadPanditProfiles(this.query);
    }, 500);
  }

  loadPanditProfiles(query: string, loadMore = false) {
    if (!loadMore) this.isLoading = true;

    const body = {
      query: query.replace(/\s+/g, ' ').trim(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.apinu.postUrlData('UsersNUSelectByQueryPaging', body).subscribe({
      next: (userRes: any) => {
        const users = userRes?.UserList;

        if (!users?.length) {
          this.isLoading = false;
          if (this.infiniteScrollEvent) {
            this.infiniteScrollEvent.target.complete();
            this.infiniteScrollEvent.target.disabled = true;
            this.infiniteScrollEvent = null;
          }
          return;
        }

        from(users).pipe(
          mergeMap((user: any) =>
            this.apinu.postUrlData(
              `ProfilesSelectAllByUserID?userID=${user.UserID}`, null
            ).pipe(
              mergeMap((profileRes: any) => {
                const profile = profileRes?.ProfileList?.[0] || null;
                return this.apinu.postUrlData(
                  `PanditServicesSelectAllByProfileID?profileID=${user.UserID}`, null
                ).pipe(
                  mergeMap((svcRes: any) => {
                    const firstSvc = svcRes?.PanditServiceList?.[0];
                    if (!firstSvc?.LocationID) {
                      return of({ user, profile, _city: null, panditServices: [], _servicesLoaded: false });
                    }
                    return this.apinu.postUrlData(
                      `LocationSelect?locationID=${firstSvc.LocationID}&tenantID=${this.userDetails.TenantID}`, null
                    ).pipe(
                      map((locRes: any) => {
                        const loc = locRes?.LocationList?.[0];
                        return {
                          user,
                          profile,
                          _city: loc?.Name || loc?.City || null,
                          panditServices: [],
                          _servicesLoaded: false
                        };
                      })
                    );
                  })
                );
              })
            )
          ),
          toArray()
        ).subscribe((result: any[]) => {
          this.panditList = loadMore ? [...this.panditList, ...result] : result;
          this.isLoading = false;
          this.panditList.forEach(item => {
            if (item.profile) this.loadProfileImage(item.profile);
          });

          if (this.infiniteScrollEvent) {
            this.infiniteScrollEvent.target.complete();
            if (result.length < this.pageSize) {
              this.infiniteScrollEvent.target.disabled = true;
            }
            this.infiniteScrollEvent = null;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          this.infiniteScrollEvent = null;
        }
      }
    });
  }

  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
    this.pageNumber++;
    this.loadPanditProfiles(this.query, true);
  }

  get filteredPanditList(): any[] {
    const q = this.searchQuery?.trim().toLowerCase();
    if (!q) return this.panditList;
    return this.panditList.filter(item => {
      const name = (item.profile?.FullName || '').toLowerCase();
      const lang = (item.profile?.Languages || '').toLowerCase();
      const city = (item.profile?.City || '').toLowerCase();
      return name.includes(q) || lang.includes(q) || city.includes(q);
    });
  }

  openPanditModal(item: any) {
    this.activePandit = item;
    this.activePanditServices = item.panditServices || [];
    this.lightboxImageUrl = null;
    this.isPanditModalOpen = true;

    if (!item._servicesLoaded) {
      this.isLoadingServices = true;
      this.loadServicesForPandit(item).then(services => {
        item.panditServices = services;
        item._servicesLoaded = true;
        this.activePanditServices = services;
        this.isLoadingServices = false;
        this.loadBookingCounts(services);
      });
    }
  }

  async loadServicesForPandit(item: any): Promise<any[]> {
    return new Promise(resolve => {
      this.apinu.postUrlData(
        `PanditServicesSelectAllByProfileID?profileID=${item.user.UserID}`, null
      ).subscribe((serviceRes: any) => {
        const services = serviceRes?.PanditServiceList || [];
        if (!services.length) { resolve([]); return; }

        from(services).pipe(
          mergeMap((ps: any) =>
            forkJoin({
              serviceDetail: this.apinu.postUrlData(`ServiceSelect?serviceID=${ps.ServiceID}&tenantID=${this.userDetails.TenantID}`, null),
              locationDetail: this.apinu.postUrlData(`LocationSelect?locationID=${ps.LocationID}&tenantID=${this.userDetails.TenantID}`, null),
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
                  mergeMap((mapItem: any) =>
                    this.apinu.postUrlData(
                      `ServiceCategorySelect?categoryID=${mapItem.CategoryID}&tenantID=${this.userDetails.TenantID}`, null
                    ).pipe(
                      map((catRes: any) => ({
                        ...mapItem,
                        CategoryDetails: catRes?.ServiceCategoryList?.[0] || null
                      }))
                    )
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
            )
          ),
          toArray()
        ).subscribe(loaded => resolve(loaded));
      });
    });
  }

  loadBookingCounts(services: any[]) {
    services.forEach((ps: any) => {
      if (!ps.PanditServiceID) return;
      this.panditServiceBookingMap[String(ps.PanditServiceID)] = 0;
      this.apinu.postUrlData(
        `BookingsSelectAllByPanditServiceID?panditServiceID=${ps.PanditServiceID}`, null
      ).subscribe((res: any) => {
        this.panditServiceBookingMap[String(ps.PanditServiceID)] =
          (res?.BookingList?.length || 0) + 10;
      });
    });
  }

  exploreService(service: any) {
    this.selectedPandit = this.activePandit;
    this.selectedService = service;
    this.isPanditModalOpen = false;
    setTimeout(() => { this.isExploreModalOpen = true; }, 250);
  }

  goToBooking(selectedService: any) {
    this.isExploreModalOpen = false;
    setTimeout(() => {
      this.router.navigateByUrl(`/book-pooja?id=${selectedService.PanditServiceID}`);
    }, 200);
  }

  openQrScanner() { this.isScannerOpen = true; }
  closeQrScanner() { 
    
    this.isScannerOpen = false; 
  
    this.loadPanditProfiles(`1=1 ORDER BY U.UserID DESC`);

  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;
    const match = result.toLowerCase().match(/pandituserid=(\d+)/);
    if (match) {
      this.loadPanditProfiles(`U.UserID = ${Number(match[1])}`);
    }
  }
  onScanError(error: any) { console.error('Scan error:', error); }

  loadProfileImage(profile: any) {
    if (!profile?.ProfilePhotoUrl || !profile?.UserID) return;
    this.api.getImage('DownloadImages', {
      imageName: profile.ProfilePhotoUrl,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: Blob) => {
        if (blob?.type?.startsWith('image/')) {
          this.profileImages[profile.UserID] = URL.createObjectURL(blob);
        }
      },
      error: () => { }
    });
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
    return (serviceName || '').split('/')[0].trim()
      .replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  }

  getServiceImages(serviceName: string): string[] {
    const n = this.getCleanName(serviceName);
    return [`assets/img/${n}.png`, `assets/img/${n}2.jfif`, `assets/img/${n}3.jfif`];
  }

  getCurrentImage(serviceName: string): string {
    if (!serviceName) return 'assets/img/default.jpg';
    const key = this.getCleanName(serviceName);
    const images = this.getServiceImages(serviceName);
    if (!(key in this.currentImageIndex)) {
      this.currentImageIndex[key] = 0;
      this.imageIntervals[key] = setInterval(() => {
        this.currentImageIndex[key] = (this.currentImageIndex[key] + 1) % 3;
      }, 100000000);
    }
    return images[this.currentImageIndex[key] || 0];
  }

  openPage(pageName: any) { this.routerCtrl.navigateForward(`/${pageName}`); }

  lightboxImageUrl: string | null = null;

openLightbox(url: string) {
  this.lightboxImageUrl = url;
}

closeLightbox() {
  this.lightboxImageUrl = null;
}
}