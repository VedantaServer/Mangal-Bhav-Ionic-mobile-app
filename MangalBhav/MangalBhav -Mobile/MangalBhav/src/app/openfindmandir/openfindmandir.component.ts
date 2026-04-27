import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';

import { Geolocation } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-openfindmandir',
  templateUrl: './openfindmandir.component.html',
  styleUrls: ['./openfindmandir.component.scss'],
   standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OpenfindmandirComponent  implements OnInit {

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


  allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showAddMandirForm = false;
  isSubmittingMandir = false;

  // Front image
  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;

  // Inside image
  selectedInsideImageFile: File | null = null;
  insideImagePreview: string | null = null;
  isUploadingInside = false;



  constructor(public api: Api, public routerCtrl: NavController, public apinu: ApiNU, private storage: Storage, public toastController: ToastController) { }
  

  ngOnInit() {  this.loadMandirs();}

  
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
      alert('Location permission denied');
    }

  } catch (error) {
    console.error('Error getting location:', error);
  }
}

  loadMandirs() {
    this.apinu.postUrlData(`MandirSelectByQuery?Query=tenantID=1  ORDER BY DateAdded DESC`, null).subscribe({
      next: (res: any) => {
        this.allMandirs = (res?.MandirList ?? []).map((m: any) => ({
          ...m,
          FrontImageUrl: null
        }));

        this.filteredMandirs = [...this.allMandirs];

        // 👇 CALL HERE
        this.filteredMandirs.forEach(m => {
          this.loadMandirImage(m);
        });

      },
      error: (err: any) => console.error('loadMandirs error', err),
    });
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



}
