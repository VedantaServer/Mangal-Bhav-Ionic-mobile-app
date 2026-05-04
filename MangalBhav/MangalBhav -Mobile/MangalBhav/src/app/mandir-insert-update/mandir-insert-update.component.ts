import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mandir-insert-update',
  templateUrl: './mandir-insert-update.component.html',
  styleUrls: ['./mandir-insert-update.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MandirInsertUpdateComponent implements OnInit {

  isEditMode = false;   // ← NEW

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
  }

  allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showAddMandirForm = false;
  isSubmittingMandir = false;

  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;

  selectedInsideImageFile: File | null = null;
  insideImagePreview: string | null = null;
  isUploadingInside = false;

  // slider state per card
  cardSlideIndex: { [mandirID: number]: number } = {};

  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController
  ) { }

  ngOnInit() { this.loadMandirs(); }

  // ── Location ───────────────────────────────────────────────────

  async getCurrentLocation() {
    try {
      // ── Capacitor (native iOS / Android) ──────────────────────
      const isNative = (window as any)?.Capacitor?.isNativePlatform?.();

      if (isNative) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') {
          return this.showToast('Location permission denied', 'warning');
        }
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        this.Mandir.Latitude = String(position.coords.latitude);
        this.Mandir.Longitude = String(position.coords.longitude);
        this.showToast('Location fetched ✅', 'success');

      } else {
        // ── Web browser fallback ───────────────────────────────
        if (!navigator.geolocation) {
          return this.showToast('Geolocation not supported by your browser', 'danger');
        }

        this.showToast('Fetching location…', 'primary');

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.Mandir.Latitude = String(position.coords.latitude);
            this.Mandir.Longitude = String(position.coords.longitude);
            this.showToast('Location fetched ✅', 'success');
          },
          (error) => {
            console.error('Web geolocation error:', error);
            const msg =
              error.code === error.PERMISSION_DENIED ? 'Location permission denied' :
                error.code === error.POSITION_UNAVAILABLE ? 'Location unavailable' :
                  error.code === error.TIMEOUT ? 'Location request timed out' :
                    'Could not get location';
            this.showToast(msg, 'danger');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }

    } catch (error) {
      console.error('getCurrentLocation error:', error);
      this.showToast('Error getting location', 'danger');
    }
  }


  // ── Load ───────────────────────────────────────────────────────
  loadMandirs() {
    this.apinu.postUrlData(`MandirSelectByQuery?Query=tenantID=1 ORDER BY DateAdded DESC`, null).subscribe({
      next: (res: any) => {
        this.allMandirs = (res?.MandirList ?? []).map((m: any) => ({
          ...m,
          FrontImageUrl: null,
          InsideImageUrl: null,
        }));
        this.filteredMandirs = [...this.allMandirs];
        this.filteredMandirs.forEach(m => {
          this.loadMandirFrontImage(m);
          this.loadMandirInsideImage(m);
          this.cardSlideIndex[m.MandirID] = 0;
        });
      },
      error: (err: any) => console.error('loadMandirs error', err),
    });
  }

  loadMandirFrontImage(mandir: any) {
    if (!mandir.FrontImage) return;
    this.api.getImage('DownloadImages', { imageName: mandir.FrontImage, imagePurpose: 'ProfilePhoto' }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          mandir.FrontImageUrl = URL.createObjectURL(blob);
          this.filteredMandirs = [...this.filteredMandirs];
        }
      },
      error: (err) => console.error('Error loading front image:', err)
    });
  }

  loadMandirInsideImage(mandir: any) {
    if (!mandir.InsideImage) return;
    this.api.getImage('DownloadImages', { imageName: mandir.InsideImage, imagePurpose: 'ProfilePhoto' }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          mandir.InsideImageUrl = URL.createObjectURL(blob);
          this.filteredMandirs = [...this.filteredMandirs];
        }
      },
      error: (err) => console.error('Error loading inside image:', err)
    });
  }

  // ── Slider helpers ─────────────────────────────────────────────
  getSlideImages(m: any): string[] {
    const imgs: string[] = [];
    if (m.FrontImageUrl) imgs.push(m.FrontImageUrl);
    if (m.InsideImageUrl) imgs.push(m.InsideImageUrl);
    return imgs;
  }

  prevSlide(m: any, event: Event) {
    event.stopPropagation();
    const len = this.getSlideImages(m).length;
    if (len < 2) return;
    this.cardSlideIndex[m.MandirID] = (this.cardSlideIndex[m.MandirID] - 1 + len) % len;
    this.filteredMandirs = [...this.filteredMandirs];
  }

  nextSlide(m: any, event: Event) {
    event.stopPropagation();
    const len = this.getSlideImages(m).length;
    if (len < 2) return;
    this.cardSlideIndex[m.MandirID] = (this.cardSlideIndex[m.MandirID] + 1) % len;
    this.filteredMandirs = [...this.filteredMandirs];
  }

  // ── Search ─────────────────────────────────────────────────────
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

  // ── Modal open/close/reset ─────────────────────────────────────
  openAddMandir() {
    this.isEditMode = false;
    this.resetMandirForm();
    this.showAddMandirForm = true;
  }

  // ← NEW: open form pre-filled for editing
  openEditMandir(m: any, event: Event) {
    event.stopPropagation();
    this.isEditMode = true;
    this.Mandir = {
      TenantID: m.TenantID,
      MandirID: String(m.MandirID),
      MandirName: m.MandirName ?? '',
      GodName: m.GodName ?? '',
      FrontImage: m.FrontImage ?? '',
      InsideImage: m.InsideImage ?? '',
      PujariName: m.PujariName ?? '',
      PujariPhoneNumber: m.PujariPhoneNumber ?? '',
      History: m.History ?? '',
      Address: m.Address ?? '',
      City: m.City ?? '',
      State: m.State ?? '',
      Pincode: m.Pincode ?? '',
      Latitude: String(m.Latitude ?? ''),
      Longitude: String(m.Longitude ?? ''),
      IsVerified: m.IsVerified ?? false,
      VerificationStatus: m.VerificationStatus ?? 'Pending',
      AddedByUserID: m.AddedByUserID ?? -1,
      AddedByName: m.AddedByName ?? '',
      DateAdded: new Date(m.DateAdded),
      DateModified: new Date(),
      IsActive: m.IsActive ?? true,
    };
    // Show existing image previews from loaded URLs
    const existing = this.filteredMandirs.find(x => x.MandirID === m.MandirID);
    this.frontImagePreview = existing?.FrontImageUrl ?? null;
    this.insideImagePreview = existing?.InsideImageUrl ?? null;
    this.selectedFrontImageFile = null;
    this.selectedInsideImageFile = null;
    this.showAddMandirForm = true;
  }

  closeAddMandir() { this.showAddMandirForm = false; }

  resetMandirForm() {
    this.Mandir = {
      TenantID: Number(1), MandirID: '-1',
      MandirName: '', GodName: '', FrontImage: '', InsideImage: '',
      PujariName: '', PujariPhoneNumber: '', History: '',
      Address: '', City: '', State: '', Pincode: '',
      Latitude: '', Longitude: '',
      IsVerified: false, VerificationStatus: 'Pending',
      AddedByUserID: Number(-1), AddedByName: '',
      DateAdded: new Date(), DateModified: new Date(), IsActive: true,
    };
    this.selectedFrontImageFile = null;
    this.frontImagePreview = null;
    this.selectedInsideImageFile = null;
    this.insideImagePreview = null;
  }

  // ── File selection ─────────────────────────────────────────────
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

  // ── Upload ─────────────────────────────────────────────────────
  uploadFrontImage() {
    if (!this.selectedFrontImageFile) return;
    this.isUploadingFront = true;
    this.api.uploadImage([this.selectedFrontImageFile], 'ProfilePhoto', 'mandir', 'ProfilePhoto').subscribe({
      next: (res: any) => {
        this.isUploadingFront = false;
        if (res?.Status === 'Success') {
          this.Mandir.FrontImage = res.FileName;
          this.selectedFrontImageFile = null;
          this.showToast('Front photo uploaded ✅', 'success');
        } else {
          this.showToast('Front photo upload failed', 'danger');
        }
      },
      error: () => { this.isUploadingFront = false; this.showToast('Front photo upload error', 'danger'); },
    });
  }

  uploadInsideImage() {
    if (!this.selectedInsideImageFile) return;
    this.isUploadingInside = true;
    this.api.uploadImage([this.selectedInsideImageFile], 'ProfilePhoto', 'mandir', 'ProfilePhoto').subscribe({
      next: (res: any) => {
        this.isUploadingInside = false;
        if (res?.Status === 'Success') {
          this.Mandir.InsideImage = res.FileName;
          this.selectedInsideImageFile = null;
          this.showToast('Inside photo uploaded ✅', 'success');
        } else {
          this.showToast('Inside photo upload failed', 'danger');
        }
      },
      error: () => { this.isUploadingInside = false; this.showToast('Inside photo upload error', 'danger'); },
    });
  }

  // ── Submit (Insert OR Update) ──────────────────────────────────
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
    this.Mandir.DateModified = new Date();

    const endpoint = this.isEditMode ? 'MandirUpdate' : 'MandirInsert';
    const successMsg = this.isEditMode
      ? 'Mandir updated successfully 🙏'
      : 'Mandir submitted! Our team will verify it shortly 🙏';

    this.apinu.postUrlData(endpoint, this.Mandir).subscribe({
      next: async () => {
        this.isSubmittingMandir = false;
        this.closeAddMandir();
        await this.showToast(successMsg, 'success');
        this.loadMandirs();
      },
      error: async () => {
        this.isSubmittingMandir = false;
        await this.showToast('Something went wrong. Please try again.', 'danger');
      },
    });
  }

  // ── Toast ──────────────────────────────────────────────────────
  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}