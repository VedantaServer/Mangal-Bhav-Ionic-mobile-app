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

@Component({
  selector: 'app-find-pandit',
  templateUrl: './find-pandit.component.html',
  styleUrls: ['./find-pandit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule,
    PanditjibottomtabsComponent, JajmanbottomtabsComponent]
})
export class FindPanditComponent implements OnInit {

  userDetails: any;
  language: any;
  searchQuery: string = '';

  // ── Pandit list (profiles only on init) ──────────────────────────────────
  panditList: any[] = [];
  profileImages: { [key: number]: string } = {};

  // ── Pandit detail modal ───────────────────────────────────────────────────
  isPanditModalOpen = false;
  activePandit: any = null;
  activePanditServices: any[] = [];
  isLoadingServices = false;
  showbottomtab: boolean = true;
  // ── Explore / service modal (behaviour unchanged) ─────────────────────────
  isExploreModalOpen = false;
  selectedPandit: any = null;
  selectedService: any = null;

  // ── QR scanner ───────────────────────────────────────────────────────────
  isScannerOpen = false;
  scannedQrData: string | null = null;
  formats = [BarcodeFormat.QR_CODE];

  // ── Booking counts ────────────────────────────────────────────────────────
  panditServiceBookingMap: { [key: string]: number } = {};

  // ── Slideshow ─────────────────────────────────────────────────────────────
  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};

  query = "Role='PANDIT'";
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

  // ─────────────────────────────────────────────────────────────────────────
  // INIT: only fetch users + profiles — NO services
  // ─────────────────────────────────────────────────────────────────────────
  async ngOnInit() {

    if (this.router.url === '/tabs/find-pandit') {
      this.showbottomtab = false;
    }

    this.userDetails = await this.storage.get('account');
    this.language = await this.storage.get('Language');

    if (localStorage.getItem('findPanditThroghtFloating') !== 'findPanditThroghtFloating' && this.router.url !== '/tabs/find-pandit') {
      this.openQrScanner();
    } else {
      localStorage.removeItem('findPanditThroghtFloating');
      this.loadPanditProfiles(`Role='PANDIT'`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Load only users + profiles (lightweight, no nested API calls)
  // ─────────────────────────────────────────────────────────────────────────
  // loadPanditProfiles(query: string) {
  //   this.panditList = [];

  //   this.apinu.postUrlData(`UsersNUSelectByQuery?Query=${query}`, null)
  //     .subscribe((userRes: any) => {
  //       const users = userRes?.UserList;
  //       if (!users?.length) return;

  //       from(users).pipe(
  //         mergeMap((user: any) =>
  //           this.apinu.postUrlData(
  //             `ProfilesSelectAllByUserID?userID=${user.UserID}`, null
  //           ).pipe(
  //             map((profileRes: any) => ({
  //               user,
  //               profile:        profileRes?.ProfileList?.[0] || null,
  //               panditServices: [],     
  //               _servicesLoaded: false
  //             }))
  //           )
  //         ),
  //         toArray()
  //       ).subscribe((result: any[]) => {
  //         this.panditList = result;
  //         this.panditList.forEach(item => {
  //           if (item.profile) this.loadProfileImage(item.profile);
  //         });
  //       });
  //     });
  // }

  pageNumber = 1;
  pageSize = 10;
  //panditList: any[] = [];

  searchTimeout: any;

  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);

    const q = value?.trim();

    // if empty → load default list again
    if (!q) {
      this.pageNumber = 1;
      this.query = "Role='PANDIT'";
      this.panditList = [];
      this.loadPanditProfiles(this.query);
      return;
    }

    // only search after 3 letters
    if (q.length < 3) return;

    // debounce 500ms (avoid API hit on every key)
    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.panditList = [];

      this.query = `Role='PANDIT' AND UserID IN (
      SELECT UserID
      FROM Profiles
      WHERE FullName LIKE '%${q}%'
    )`;

      this.loadPanditProfiles(this.query);
    }, 500);
  }



  loadPanditProfiles(query: string, loadMore = false) {

    this.apinu.postUrlData(
      `UsersNUSelectByQueryPaging?Query=${encodeURIComponent(query)}&pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`,
      null
    ).subscribe({
      next: (userRes: any) => {
        const users = userRes?.UserList;

        // ✅ No more data — stop the spinner & disable infinite scroll
        if (!users?.length) {
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
              `ProfilesSelectAllByUserID?userID=${user.UserID}`,
              null
            ).pipe(
              map((profileRes: any) => ({
                user,
                profile: profileRes?.ProfileList?.[0] || null,
                panditServices: [],
                _servicesLoaded: false
              }))
            )
          ),
          toArray()
        ).subscribe((result: any[]) => {

          if (loadMore) {
            this.panditList = [...this.panditList, ...result];
          } else {
            this.panditList = result;
          }

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
      // ✅ Also handle API errors so spinner doesn't hang on failure
      error: () => {
        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          this.infiniteScrollEvent = null;
        }
      }
    });
  }


  loadMorePandits(query: string) {
    this.pageNumber++;
    this.loadPanditProfiles(query, true);
  }

  // Add this property
  private infiniteScrollEvent: any = null;

  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
    this.pageNumber++;
    this.loadPanditProfiles(this.query, true);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search filter (getter)
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // Open pandit modal — lazy-load services on first open
  // ─────────────────────────────────────────────────────────────────────────
  openPanditModal(item: any) {
    this.activePandit = item;
    this.activePanditServices = item.panditServices || [];
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

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch all service details for one pandit (same pipeline as before)
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // Booking counts (only for services that are visible)
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // Explore modal — close pandit modal first, then open explore
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // QR scanner
  // ─────────────────────────────────────────────────────────────────────────
  openQrScanner() { this.isScannerOpen = true; }
  closeQrScanner() { this.isScannerOpen = false; }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;
    const match = result.toLowerCase().match(/pandituserid=(\d+)/);
    if (match) {
      this.loadPanditProfiles(`Role='PANDIT' and UserID = ${Number(match[1])}`);
    }
  }
  onScanError(error: any) { console.error('Scan error:', error); }

  // ─────────────────────────────────────────────────────────────────────────
  // Profile image
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // Localization
  // ─────────────────────────────────────────────────────────────────────────
  getLocalizedText(text: string): string {
    if (!text) return '';
    const parts = text.split(' / ');
    if (this.language === 'Hindi' && parts.length > 1) return parts[1].trim();
    return parts[0].trim();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Image slideshow helpers
  // ─────────────────────────────────────────────────────────────────────────
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
}