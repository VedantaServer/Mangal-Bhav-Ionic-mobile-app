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
import { LoggedoutbottomtabsComponent } from '../loggedoutbottomtabs/loggedoutbottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';

@Component({
  selector: 'app-open-find-pandit',
  templateUrl: './open-find-pandit.component.html',
  styleUrls: ['./open-find-pandit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule, TabscommonheaderComponent, LoggedoutbottomtabsComponent]
})
export class OpenFindPanditComponent implements OnInit {

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
  userDetails: any;
  userLoggedIn: boolean = false;

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

    this.userDetails = await this.storage.get("account");

    if (this.userDetails?.LoginID) {
      this.userLoggedIn = true;
    }

    this.checkPanditDeepLink();

    if (localStorage.getItem('openfindPanditThroghtFloating') !== 'openfindPanditThroghtFloating') {
      this.openQrScanner();
    } else {
      localStorage.removeItem('openfindPanditThroghtFloating');
      this.loadPanditProfiles(`Role='PANDIT'`);
    }
  }

  checkPanditDeepLink() {

    const url =
      new URL(window.location.href);

    const panditUserID =
      url.searchParams.get('panditUserID');

    if (panditUserID) {

      this.loadPanditProfiles(
        `Role='PANDIT' and UserID=${panditUserID}`
      );

      return;
    }

    this.loadPanditProfiles(
      `Role='PANDIT'`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Load only users + profiles (lightweight, no nested API calls)
  // ─────────────────────────────────────────────────────────────────────────
  loadPanditProfiles(query: string) {
    this.panditList = [];

    this.apinu.postUrlData(`UsersNUSelectByQuery?Query=${query}`, null)
      .subscribe((userRes: any) => {
        const users = userRes?.UserList;
        if (!users?.length) return;

        from(users).pipe(
          mergeMap((user: any) =>
            this.apinu.postUrlData(
              `ProfilesSelectAllByUserID?userID=${user.UserID}`, null
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
          this.panditList = result;
          const url = new URL(window.location.href);

          const panditUserID =
            url.searchParams.get('panditUserID');

          if (
            panditUserID &&
            this.panditList.length > 0
          ) {

            setTimeout(() => {

              this.openPanditModal(
                this.panditList[0]
              );

            }, 500);
          }
          this.panditList.forEach(item => {
            if (item.profile) this.loadProfileImage(item.profile);
          });
        });
      });
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
  // Fetch all service details for one pandit (tenantID=1 for open page)
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
                  mergeMap((mapItem: any) =>
                    this.apinu.postUrlData(
                      `ServiceCategorySelect?categoryID=${mapItem.CategoryID}&tenantID=1`, null
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

  // ── On "Book" → save pending service ID, redirect to login ───────────────
  async goToBooking(selectedService: any) {
    this.isExploreModalOpen = false;

    await this.storage.set(
      'pendingPanditServiceID',
      selectedService.PanditServiceID
    );

    await this.router.navigate(['/login']);
    window.location.reload();
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
    img.src = `${this.imgBaseUrl}/default.jpg`;
    img.onerror = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Localization (no language set for open page, defaults to English)
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

  imgBaseUrl = 'https://app.mangalbhav.com/assets/img';

  getServiceImages(serviceName: string): string[] {
    const n = this.getCleanName(serviceName);
    return [`${this.imgBaseUrl}/${n}.png`, `${this.imgBaseUrl}/${n}2.jfif`, `${this.imgBaseUrl}/${n}3.jfif`];
  }
  getCurrentImage(serviceName: string): string {
    if (!serviceName) return `${this.imgBaseUrl}/default.jpg`;
    const key = this.getCleanName(serviceName);
    const images = this.getServiceImages(serviceName);
    if (!(key in this.currentImageIndex)) {
      this.currentImageIndex[key] = 0;
      this.imageIntervals[key] = setInterval(() => {
        this.currentImageIndex[key] = (this.currentImageIndex[key] + 1) % 3;
      }, 3000000);
    }
    return images[this.currentImageIndex[key] || 0];
  }

  sharePandit(item: any) {

    const panditName =
      item.profile?.FullName || 'Pandit Ji';

    const userID =
      item.profile?.UserID;

    const link =
      `https://app.mangalbhav.com/open-find-pandit?panditUserID=${userID}`;

    const message =
      `🙏 ${panditName}
  
  Book verified pujas and rituals through Mangal Bhav.
  
  View Profile:
  ${link}
  
  🪔 Jai Shri Ram`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  }
}