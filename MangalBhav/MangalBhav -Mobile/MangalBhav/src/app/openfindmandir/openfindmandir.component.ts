import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { Geolocation } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { LoggedoutbottomtabsComponent } from '../loggedoutbottomtabs/loggedoutbottomtabs.component';
import { Router } from '@angular/router';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-openfindmandir',
  templateUrl: './openfindmandir.component.html',
  styleUrls: ['./openfindmandir.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,ZXingScannerModule, TabscommonheaderComponent, JajmanbottomtabsComponent, PanditjibottomtabsComponent, LoggedoutbottomtabsComponent]
})
export class OpenfindmandirComponent implements OnInit {

  Mandir = {
    //loop all columns here.
    TenantID: Number(1),
    MandirID: "-1",
    MandirName: '',
    GodName: '',
    FrontImage: '',
    InsideImage: '',
    PujariName: '',
    PujariPhoneNumber: '',
    History: '',
    Address: '',
    City: '',
    State: '',
    Pincode: '',
    Latitude: '',
    Longitude: '',
    IsVerified: true,
    VerificationStatus: '',
    AddedByUserID: Number(-1),
    AddedByName: '',
    DateAdded: new Date(),
    DateModified: new Date(),
    IsActive: true,
  }


  //allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showLocationSuccess = false;
  showAddMandirForm = false;
  allowedFormats = [BarcodeFormat.QR_CODE];
  isLoadingMandirs = false;
  isSearchFocused = false;
  showScanner = false;
  isSubmittingMandir = false;

  // Front image
  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;

  // Add this property (replace userLat/userLng block area)
  locationState: 'fetching' | 'granted' | 'denied' | 'unavailable' = 'fetching';
  // Inside image
  selectedInsideImageFile: File | null = null;
  insideImagePreview: string | null = null;
  isUploadingInside = false;
  userLoggedIn: boolean = false;
  userDetails: any;
  showbottomtab: boolean = true;

  userLat: number | null = null;
  userLng: number | null = null;


  constructor(private router: Router, public api: Api, public routerCtrl: NavController, public apinu: ApiNU, private storage: Storage, public toastController: ToastController) { }


  async ngOnInit() {

    if (this.router.url === '/tabs/openfindmandir') {
      this.showbottomtab = false;
    }




    this.userDetails = await this.storage.get("account");
    if (this.userDetails?.LoginID) {
      this.userLoggedIn = true;
    }
    await this.fetchUserLocation();
    this.loadMandirs();

  }



  async fetchUserLocation() {
    this.locationState = 'fetching';
    try {
      let lat: number;
      let lng: number;

      if (Capacitor.getPlatform() === 'web') {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } else {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
          this.locationState = 'denied';
          return;
        }
        const position = await Geolocation.getCurrentPosition();
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      this.userLat = lat;
      this.userLng = lng;
      this.locationState = 'granted';
      this.showLocationSuccess = true;

      setTimeout(() => {
        this.showLocationSuccess = false;
      }, 3000);
      this.query = this.buildLocationQuery(lat, lng);

    } catch (e) {
      console.warn('Location unavailable', e);
      this.locationState = 'unavailable';
      // query stays as default ORDER BY DateAdded DESC — that's fine
    }
  }



  buildLocationQuery(lat: number, lng: number): string {
    return `tenantID=1 ORDER BY (6371 * ACOS(COS(RADIANS(${lat})) * COS(RADIANS(CAST(Latitude AS FLOAT))) * COS(RADIANS(CAST(Longitude AS FLOAT)) - RADIANS(${lng})) + SIN(RADIANS(${lat})) * SIN(RADIANS(CAST(Latitude AS FLOAT))))) ASC`;
  }


  getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }


  async getCurrentLocation() {
    try {
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();

        this.Mandir.Latitude = String(position.coords.latitude);
        this.Mandir.Longitude = String(position.coords.longitude);

        console.log('Lat:', this.Mandir.Latitude);
        console.log('Lng:', this.Mandir.Longitude);
      } else {
        this.showToast('Location permission denied', 'danger');
      }

    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  // loadMandirs() {
  //   this.apinu.postUrlData(`MandirSelectByQuery?Query=tenantID=1  ORDER BY DateAdded DESC`, null).subscribe({
  //     next: (res: any) => {
  //       this.allMandirs = (res?.MandirList ?? []).map((m: any) => ({
  //         ...m,
  //         FrontImageUrl: null
  //       }));

  //       this.filteredMandirs = [...this.allMandirs];


  //       this.filteredMandirs.forEach(m => {
  //         this.loadMandirImage(m);
  //       });

  //     },
  //     error: (err: any) => console.error('loadMandirs error', err),
  //   });
  // }

  pageNumber = 1;
  pageSize = 10;
  allMandirs: any[] = [];


  loadMore() {
    this.pageNumber++;
    this.loadMandirs(true);
  }


  onMandirSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    const q = value?.trim();

    if (!q) {
      this.pageNumber = 1;
      this.allMandirs = [];
      this.filteredMandirs = [];
      // ✅ Restore location query on clear, not just date
      this.query = (this.userLat && this.userLng)
        ? this.buildLocationQuery(this.userLat, this.userLng)
        : `tenantID=1 ORDER BY DateAdded DESC`;
      this.infiniteScrollEvent = null;
      this.loadMandirs();
      return;
    }

    if (q.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.allMandirs = [];
      this.filteredMandirs = [];
      this.infiniteScrollEvent = null;

      // ✅ Search also sorted by distance if location available
      const orderBy = (this.userLat && this.userLng)
        ? `ORDER BY (6371 * ACOS(COS(RADIANS(${this.userLat})) * COS(RADIANS(CAST(Latitude AS FLOAT))) * COS(RADIANS(CAST(Longitude AS FLOAT)) - RADIANS(${this.userLng})) + SIN(RADIANS(${this.userLat})) * SIN(RADIANS(CAST(Latitude AS FLOAT))))) ASC`
        : `ORDER BY DateAdded DESC`;

      this.query = `tenantID=1 AND (MandirName LIKE '%${q}%' OR GodName LIKE '%${q}%' OR City LIKE '%${q}%' OR State LIKE '%${q}%' OR Address LIKE '%${q}%') ${orderBy}`;
      this.loadMandirs();
    }, 500);
  }


  // loadMandirs(loadMore = false) {
  //   const query = this.query;

  //   this.apinu.postUrlData(
  //     `MandirSelectByQueryPaging?tenantID=1&schoolID=0&pageNumber=${this.pageNumber}&pageSize=${this.pageSize}&Query=${encodeURIComponent(query)}`,
  //     null
  //   ).subscribe({
  //     next: (res: any) => {
  //       let newMandirs = (res?.MandirList ?? []).map((m: any) => ({
  //         ...m,
  //         FrontImageUrl: null,
  //         DistanceKm: (this.userLat && this.userLng && m.Latitude && m.Longitude)
  //           ? this.getDistance(this.userLat, this.userLng, +m.Latitude, +m.Longitude)
  //           : null
  //       }));

  //       if (!newMandirs.length) {
  //         if (this.infiniteScrollEvent) {
  //           this.infiniteScrollEvent.target.complete();
  //           this.infiniteScrollEvent.target.disabled = true;
  //           this.infiniteScrollEvent = null;
  //         }
  //         return;
  //       }

  //       if (loadMore) {
  //         this.allMandirs = [...this.allMandirs, ...newMandirs];
  //       } else {
  //         this.allMandirs = newMandirs;
  //       }

  //       // ✅ Sort by distance if location available
  //       if (this.userLat && this.userLng) {
  //         this.allMandirs.sort((a, b) => {
  //           if (a.DistanceKm === null) return 1;
  //           if (b.DistanceKm === null) return -1;
  //           return a.DistanceKm - b.DistanceKm;
  //         });
  //       }

  //       this.filteredMandirs = [...this.allMandirs];
  //       newMandirs.forEach((m: any) => this.loadMandirImage(m));

  //       if (this.infiniteScrollEvent) {
  //         this.infiniteScrollEvent.target.complete();
  //         if (newMandirs.length < this.pageSize) {
  //           this.infiniteScrollEvent.target.disabled = true;
  //         }
  //         this.infiniteScrollEvent = null;
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error(err);
  //       if (this.infiniteScrollEvent) {
  //         this.infiniteScrollEvent.target.complete();
  //         this.infiniteScrollEvent = null;
  //       }
  //     }
  //   });
  // }


  private sanitizeQuery(q: string): string {
    return q.replace(/\s+/g, ' ').trim();
  }


  loadMandirs(loadMore = false) {
    const query = this.query.replace(/\s+/g, ' ').trim(); // still sanitize

    if (!loadMore) {
      this.isLoadingMandirs = true;
    }

    // ✅ Send everything in the body now
    const body = {
      tenantID: 1,
      schoolID: 0,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      query: query   // no URL encoding needed!
    };

    this.apinu.postUrlData('MandirSelectByQueryPaging', body).subscribe({
      next: (res: any) => {
        let newMandirs = (res?.MandirList ?? []).map((m: any) => ({
          ...m,
          FrontImageUrl: null,
          DistanceKm: (this.userLat && this.userLng && m.Latitude && m.Longitude)
            ? this.getDistance(this.userLat, this.userLng, +m.Latitude, +m.Longitude)
            : null
        }));

        if (loadMore) {
          this.allMandirs = [...this.allMandirs, ...newMandirs];
        } else {
          this.allMandirs = newMandirs;
        }

        this.filteredMandirs = [...this.allMandirs];
        newMandirs.forEach((m: any) => this.loadMandirImage(m));
        this.isLoadingMandirs = false;

        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          if (newMandirs.length < this.pageSize) {
            this.infiniteScrollEvent.target.disabled = true;
          }
          this.infiniteScrollEvent = null;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.isLoadingMandirs = false;
        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          this.infiniteScrollEvent = null;
        }
      }
    });
  }

  searchTimeout: any;
  query: any = `tenantID=1 ORDER BY DateAdded DESC`;


  // Add this property
  private infiniteScrollEvent: any = null;

  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
    this.pageNumber++;
    this.loadMandirs(true);
  }



  loadMandirImage(mandir: any) {
    if (!mandir.FrontImage) return;

    this.api.getImage('DownloadImages', {
      imageName: mandir.FrontImage,
      imagePurpose: 'ProfilePhoto' // change if needed
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          mandir.FrontImageUrl = URL.createObjectURL(blob);

          // trigger UI refresh
          this.filteredMandirs = [...this.filteredMandirs];
        }
      },

      error: (err) => console.error('Error loading image:', err)
    });
  }
  // ── 3. Search ───────────────────────────────────────────────────

  onMandirSearch() {
    const q = this.mandirSearchQuery.toLowerCase().trim();

    this.filteredMandirs = q
      ? this.allMandirs.filter(m =>
        m.MandirName?.toLowerCase().includes(q) ||
        m.GodName?.toLowerCase().includes(q) ||
        m.City?.toLowerCase().includes(q) ||
        m.State?.toLowerCase().includes(q)
      )
      : [...this.allMandirs];
  }

  // ── 4. Modal open / close / reset ───────────────────────────────

  openAddMandir() {
    this.resetMandirForm();
    this.showAddMandirForm = true;
  }

  closeAddMandir() {
    this.showAddMandirForm = false;
  }

  resetMandirForm() {
    this.Mandir = {
      TenantID: Number(1),   // ← replace
      MandirID: '-1',
      MandirName: '', GodName: '', FrontImage: '', InsideImage: '',
      PujariName: '', PujariPhoneNumber: '', History: '',
      Address: '', City: '', State: '', Pincode: '',
      Latitude: '', Longitude: '',
      IsVerified: false, VerificationStatus: 'Pending',
      AddedByUserID: Number(-1),
      AddedByName: '',
      DateAdded: new Date(), DateModified: new Date(), IsActive: true,
    };
    this.selectedFrontImageFile = null;
    this.frontImagePreview = null;
    this.selectedInsideImageFile = null;
    this.insideImagePreview = null;
  }


  // ── 5. File selection helpers (show local preview) ──────────────

  onFrontImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedFrontImageFile = file;
    this.Mandir.FrontImage = '';   // clear previous saved name
    const reader = new FileReader();
    reader.onload = (e: any) => (this.frontImagePreview = e.target.result);
    reader.readAsDataURL(file);
  }

  onInsideImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedInsideImageFile = file;
    this.Mandir.InsideImage = '';
    const reader = new FileReader();
    reader.onload = (e: any) => (this.insideImagePreview = e.target.result);
    reader.readAsDataURL(file);
  }


  // ── 6. Upload helpers ───────────────────────────────────────────
  //  Matches your existing uploadImage signature:
  //    api.uploadImage(files[], folder, refId, type)
  //  Returns { Status: 'Success', FileName: '...' }

  uploadFrontImage() {
    if (!this.selectedFrontImageFile) return;
    this.isUploadingFront = true;

    this.api.uploadImage(
      [this.selectedFrontImageFile],
      'ProfilePhoto',     // folder / type
      'mandir',           // refId — no MandirID yet (insert hasn't happened)
      'ProfilePhoto'        // label
    ).subscribe({
      next: (res: any) => {
        this.isUploadingFront = false;
        if (res?.Status === 'Success') {
          this.Mandir.FrontImage = res.FileName;   // ← save filename
          this.frontImagePreview = null;            // hide local preview
          this.selectedFrontImageFile = null;
          this.showToast('Front photo uploaded ✅', 'success');
        } else {
          this.showToast('Front photo upload failed', 'danger');
        }
      },
      error: () => {
        this.isUploadingFront = false;
        this.showToast('Front photo upload error', 'danger');
      },
    });
  }

  uploadInsideImage() {
    if (!this.selectedInsideImageFile) return;
    this.isUploadingInside = true;

    this.api.uploadImage(
      [this.selectedInsideImageFile],
      'ProfilePhoto',
      'mandir',
      'ProfilePhoto'
    ).subscribe({
      next: (res: any) => {
        this.isUploadingInside = false;
        if (res?.Status === 'Success') {
          this.Mandir.InsideImage = res.FileName;
          this.insideImagePreview = null;
          this.selectedInsideImageFile = null;
          this.showToast('Inside photo uploaded ✅', 'success');
        } else {
          this.showToast('Inside photo upload failed', 'danger');
        }
      },
      error: () => {
        this.isUploadingInside = false;
        this.showToast('Inside photo upload error', 'danger');
      },
    });
  }


  // ── 7. Submit Mandir ────────────────────────────────────────────

  async submitMandir() {
    if (!this.Mandir.MandirName?.trim())
      return this.showToast('Please enter the Mandir name 🛕', 'warning');
    if (!this.Mandir.GodName?.trim())
      return this.showToast('Please enter the presiding deity 🌸', 'warning');


    // Warn if photo was chosen but not yet uploaded
    if (this.selectedFrontImageFile && !this.Mandir.FrontImage)
      return this.showToast('Please upload the front photo first ⬆', 'warning');
    if (this.selectedInsideImageFile && !this.Mandir.InsideImage)
      return this.showToast('Please upload the inside photo first ⬆', 'warning');

    this.isSubmittingMandir = true;
    this.Mandir.DateAdded = new Date();
    this.Mandir.DateModified = new Date();

    this.apinu.postUrlData('MandirInsert', this.Mandir).subscribe({
      next: async (res: any) => {
        this.isSubmittingMandir = false;
        this.closeAddMandir();
        await this.showToast('Mandir submitted! Our team will verify it shortly 🙏', 'success');
        this.loadMandirs();
      },
      error: async () => {
        this.isSubmittingMandir = false;
        await this.showToast('Something went wrong. Please try again.', 'danger');
      },
    });
  }


  // ── 8. Toast helper ─────────────────────────────────────────────

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 3000, color, position: 'top',
    });
    toast.present();
  }

  openMandirDetails(mandirID: number) {
    this.routerCtrl.navigateForward(`/mandirfulldetails/${mandirID}`);
  }

  toggleScanner() {
  this.showScanner = !this.showScanner;
}

onQrScanSuccess(result: string) {
  // result will be like "mandirID=42"
  const match = result.match(/mandirID=(\d+)/);

  if (match && match[1]) {
    this.showScanner = false;
    const mandirId = match[1];
    this.routerCtrl.navigateForward(`/mandirfulldetails/${mandirId}`);
  } else {
    this.showToast('Invalid QR — not a Mandir QR code 🛕', 'warning');
  }
}

onQrScanError(error: any) {
  console.error('QR Scan Error:', error);
  // Don't show toast on every frame error — ZXing fires this frequently
  // Only close if it's a real device/permission error
}

}
