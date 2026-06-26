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
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

declare let gtag: Function;
@Component({
  selector: 'app-openfindmandir',
  templateUrl: './openfindmandir.component.html',
  styleUrls: ['./openfindmandir.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZXingScannerModule,
    TabscommonheaderComponent,
    
    PanditjibottomtabsComponent,CommonBottomTabsComponent
  ]
})
export class OpenfindmandirComponent implements OnInit {

  Mandir = {
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
  };

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

  // Inside image
  selectedInsideImageFile: File | null = null;
  insideImagePreview: string | null = null;
  isUploadingInside = false;

  // ── Location state ──
  // 'idle'       → page just loaded, button "Show Nearby" is visible
  // 'fetching'   → currently requesting permission / GPS
  // 'granted'    → location obtained, sorted by distance
  // 'denied'     → user blocked permission
  // 'unavailable'→ GPS timed out or other error
  locationState: 'idle' | 'fetching' | 'granted' | 'denied' | 'unavailable' = 'idle';

  userLoggedIn: boolean = false;
  userDetails: any;
  showbottomtab: boolean = true;

  userLat: number | null = null;
  userLng: number | null = null;

  pageNumber = 1;
  pageSize = 10;
  allMandirs: any[] = [];

  query: string = `tenantID=1 ORDER BY DateAdded DESC`;
  searchTimeout: any;
  private infiniteScrollEvent: any = null;


  constructor(
    private router: Router,
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController, private actionSheetCtrl: ActionSheetController
  ) { }


  ionViewDidEnter() {
    gtag('event', 'open_find_mandir', {
      page_name: 'Open Find Mandir'
    });
  }

  async ngOnInit() {
    if (this.router.url === '/tabs/openfindmandir') {
      this.showbottomtab = false;
    }

    this.userDetails = await this.storage.get("account");
    if (this.userDetails?.LoginID) {
      this.userLoggedIn = true;
    }

    // ✅ On init: do NOT fetch location.
    // Just load all mandirs sorted by date. Show "Show Nearby" button.
    this.locationState = 'idle';
    this.query = `tenantID=1 ORDER BY DateAdded ASC`;
    this.loadMandirs();
  }


  // ── Called when user taps "📍 Show Nearby Mandirs" or "Tap to retry" ──
  async onShowNearby() {
    // Reset list before reloading with location sort
    this.pageNumber = 1;
    this.allMandirs = [];
    this.filteredMandirs = [];
    this.infiniteScrollEvent = null;

    await this.fetchUserLocation();

    // fetchUserLocation sets this.query to distance-sorted query if successful.
    // If it failed (denied / unavailable), query stays as date sort — that's fine.
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

      // Update query to distance-sorted
      this.query = this.buildLocationQuery(lat, lng);

    } catch (e) {
      console.warn('Location unavailable', e);
      this.locationState = 'unavailable';
      // Keep existing date-sorted query — still loads fine
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


  loadMandirs(loadMore = false) {
    const query = this.query.replace(/\s+/g, ' ').trim();

    if (!loadMore) {
      this.isLoadingMandirs = true;
    }

    const body = {
      tenantID: 1,
      schoolID: 0,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      query: query
    };

    this.apinu.postUrlData('MandirSelectByQueryPaging', body).subscribe({
      next: (res: any) => {
        let newMandirs = (res?.MandirList ?? []).map((m: any) => ({
          ...m,
          FrontImageUrl: null,
          // Only compute distance if we have user location
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


  loadMore() {
    this.pageNumber++;
    this.loadMandirs(true);
  }


  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
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
      // Restore appropriate query based on whether we already have location
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

      const orderBy = (this.userLat && this.userLng)
        ? `ORDER BY (6371 * ACOS(COS(RADIANS(${this.userLat})) * COS(RADIANS(CAST(Latitude AS FLOAT))) * COS(RADIANS(CAST(Longitude AS FLOAT)) - RADIANS(${this.userLng})) + SIN(RADIANS(${this.userLat})) * SIN(RADIANS(CAST(Latitude AS FLOAT))))) ASC`
        : `ORDER BY DateAdded DESC`;

      this.query = `tenantID=1 AND (MandirName LIKE '%${q}%' OR GodName LIKE '%${q}%' OR City LIKE '%${q}%' OR State LIKE '%${q}%' OR Address LIKE '%${q}%') ${orderBy}`;
      this.loadMandirs();
    }, 500);
  }


  loadMandirImage(mandir: any) {
    if (!mandir.InsideImage) return;
  
    mandir.InsideImageUrl =
      `https://app.mangalbhav.com/assets/ProfilePhoto/${mandir.InsideImage}`;
  
    this.filteredMandirs = [...this.filteredMandirs];
  }

  // loadMandirImage(mandir: any) {
  //   if (!mandir.FrontImage) return;

  //   this.api.getImage('DownloadImages', {
  //     imageName: mandir.InsideImage,
  //     imagePurpose: 'ProfilePhoto'
  //   }).subscribe({
  //     next: (blob: any) => {
  //       if (blob?.type?.startsWith('image/')) {
  //         mandir.InsideImageUrl = URL.createObjectURL(blob);
  //         this.filteredMandirs = [...this.filteredMandirs];
  //       }
  //     },
  //     error: (err) => console.error('Error loading image:', err)
  //   });
  // }


  openAddMandir() {
    this.resetMandirForm();
   
    this.showAddMandirForm = true;
  }

  closeAddMandir() {
    this.showAddMandirForm = false;
   
  }

  resetMandirForm() {
    this.Mandir = {
      TenantID: Number(1),
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


  onFrontImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedFrontImageFile = file;
    this.Mandir.FrontImage = '';
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


  uploadFrontImage() {
    if (!this.selectedFrontImageFile) return;
    this.isUploadingFront = true;

    this.api.uploadImage(
      [this.selectedFrontImageFile],
      'ProfilePhoto',
      'mandir',
      'ProfilePhoto'
    ).subscribe({
      next: (res: any) => {
        this.isUploadingFront = false;
        if (res?.Status === 'Success') {
          this.Mandir.FrontImage = res.FileName;
          this.frontImagePreview = null;
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


  async submitMandir() {
    if (!this.Mandir.MandirName?.trim())
      return this.showToast('Please enter the Mandir name 🛕', 'warning');
    if (!this.Mandir.GodName?.trim())
      return this.showToast('Please enter the presiding deity 🌸', 'warning');

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
    console.log('QR scanned:', result);
  
    let mandirId: string | null = null;
  
    // Format 1: full URL — https://app.mangalbhav.com/mandirfulldetails/123
    const urlMatch = result.match(/mandirfulldetails\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
      mandirId = urlMatch[1];
    }
  
    // Format 2: old short format — mandirID=123
    if (!mandirId) {
      const oldMatch = result.match(/mandirID=(\d+)/);
      if (oldMatch && oldMatch[1]) {
        mandirId = oldMatch[1];
      }
    }
  
    if (mandirId) {
      this.showScanner = false;
      this.routerCtrl.navigateForward(`/mandirfulldetails/${mandirId}`);
    } else {
      this.showToast('Invalid QR — not a Mandir QR code 🛕', 'warning');
    }
  }

  onQrScanError(error: any) {
    console.error('QR Scan Error:', error);
  }

  // async selectFrontImage() {

  //   const actionSheet = await this.actionSheetCtrl.create({
  //     header: 'Select Photo',
  //     buttons: [
  //       {
  //         text: 'Take Photo',
  //         icon: 'camera',
  //         handler: () => {
  //           this.captureImage(CameraSource.Camera);
  //         }
  //       },
  //       {
  //         text: 'Choose from Gallery',
  //         icon: 'images',
  //         handler: () => {
  //           this.captureImage(CameraSource.Photos);
  //         }
  //       },
  //       {
  //         text: 'Cancel',
  //         role: 'cancel'
  //       }
  //     ]
  //   });
  
  //   await actionSheet.present();
  // }


  async captureImage(source: CameraSource, type: 'front' | 'inside') {

    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source
    });
  
    if (!image.dataUrl) return;
  
    const blob = await fetch(image.dataUrl).then(r => r.blob());
  
    const file = new File(
      [blob],
      `IMG_${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    );
  
    if (type === 'front') {
      this.frontImagePreview = image.dataUrl;
      this.selectedFrontImageFile = file;
      this.Mandir.FrontImage = '';
    } else {
      this.insideImagePreview = image.dataUrl;
      this.selectedInsideImageFile = file;
      this.Mandir.InsideImage = '';
    }
  }

  // async captureImage(source: CameraSource) {

  //   const image = await Camera.getPhoto({
  //     quality: 80,
  //     allowEditing: false,
  //     resultType: CameraResultType.DataUrl,
  //     source: source
  //   });
  
  //   if (image.dataUrl) {
  
  //     this.frontImagePreview = image.dataUrl;
  
  //     const blob = await fetch(image.dataUrl).then(r => r.blob());
  
  //     this.selectedFrontImageFile = new File(
  //       [blob],
  //       `IMG_${Date.now()}.jpg`,
  //       { type: 'image/jpeg' }
  //     );
  //   }
  // }


  async selectImage(type: 'front' | 'inside') {

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.captureImage(CameraSource.Camera, type);
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage(CameraSource.Photos, type);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
  
    await actionSheet.present();
  }

}