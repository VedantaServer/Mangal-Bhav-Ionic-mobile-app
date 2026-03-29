import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],

  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent, PanditjibottomtabsComponent]
})
export class UserProfileComponent implements OnInit {
  profilePreview: any | null = null;
  userDetails: any;
  profile: any = {
    TenantID: null,
    UserID: null,
    FullName: '',
    DOB: null,
    Gender: '',
    PhoneNumber: '',
    Email: '',
    ExperienceYears: null,
    Bio: '',
    Languages: '',
    BasePrice: null,
    ProfilePhotoUrl: '',
    VerificationStatus: '',
    IsActive: true,
    DateAdded: new Date().toISOString(),
    DateModified: new Date().toISOString(),
    UpdatedByUser: null
  };

  isEditMode = false;
  profileObject: any;


  constructor(public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    this.profile.UserID = this.userDetails.UserID;
    this.profile.TenantID = this.userDetails.TenantID;
    this.profile.PhoneNumber = this.userDetails.LoginID;

    // console.log(this.userDetails.Role === 'PANDIT')


    this.api.post(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.ProfileList && res.ProfileList.length > 0) {
        const data = res.ProfileList[0];
        this.profileObject = res.ProfileList[0];
        //  console.log(this.profileObject);
        //  console.log(data);
        this.isEditMode = true;
        this.profile = { ...data };
        this.profilePreview = data.ProfilePhotoUrl;
        console.log(this.profilePreview)
        this.loadProfileImage()
      }
    });
  }


  loadProfileImage() {
    if (!this.profilePreview) return;

    this.api.getImage('DownloadImages', {
      imageName: this.profilePreview,
      imagePurpose: 'ProfilePhoto'    // adjust if different
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          this.profilePreview = URL.createObjectURL(blob);
        }
      },
      error: (err) => console.error('Error loading profile image:', err)
    });
  }

  selectedProfileFile: any = null;
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedProfileFile = file;

    // Show instant local preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profilePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  uploadProfilePhoto() {
    const userId = this.profile.UserID;
    const file = this.selectedProfileFile;
    if (!file || !userId) return;
    this.api.uploadImage(
      [file],
      'ProfilePhoto',    // folder/type
      userId.toString(),       // ref id
      'ProfilePhoto'
    ).subscribe((res: any) => {
      console.log(res);
      if (res.Status === 'Success') {
        this.selectedProfileFile = null;
        this.profileObject.ProfilePhotoUrl = res.FileName;
        this.api.post('ProfilesUpdate', this.profileObject).subscribe(async (res: any) => {
          console.log(res.FileName)
          if (res.ProfileID > 0) {
            const account = await this.storage.get('account');
            account.ProfilePhotoUrl = this.profileObject.ProfilePhotoUrl;;
            await this.storage.set('account', account);
            alert('Profile photo updated successfully');
          }
        })
      } else {
        console.log("Upload failed");
      }
    });
  }

  prepareProfileForSubmit() {
    return {
      profileID: this.profile.ProfileID
        ? Number(this.profile.ProfileID)
        : 0,
      tenantID: this.profile.TenantID
        ? Number(this.profile.TenantID)
        : 0,
      userID: this.profile.UserID
        ? Number(this.profile.UserID)
        : 0,
      fullName: this.profile.FullName || '',
      dOB: this.profile.DOB
        ? new Date(this.profile.DOB).toISOString()
        : null,
      gender: this.profile.Gender || '',
      phoneNumber: this.profile.PhoneNumber || '',
      email: this.profile.Email || '',
      experienceYears: this.profile.ExperienceYears
        ? Number(this.profile.ExperienceYears)
        : 0,
      bio: this.profile.Bio || '',
      languages: this.profile.Languages || '',
      basePrice: this.profile.BasePrice
        ? Number(this.profile.BasePrice)
        : 0,
      profilePhotoUrl: this.profile.ProfilePhotoUrl || '',
      verificationStatus: 'PENDING',
      isActive: Boolean(this.profile.IsActive),
      dateAdded: this.profile.DateAdded
        ? new Date(this.profile.DateAdded).toISOString()
        : new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: this.userDetails.UserID
        ? this.userDetails.UserID.toString()
        : ''
    };
  }

  loadProfile() {
    this.api.post(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.profile.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.ProfileList?.length) {
        const data = res.ProfileList[0];
        this.isEditMode = true;
        this.profile = { ...this.profile, ...data };
      }
    });
  }


  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateRoot('/login');
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  saveProfile() {
    const payload = this.prepareProfileForSubmit();
    // console.log("Submitting Profile:", payload);
    const DBAction = this.isEditMode ? 'ProfilesUpdate' : 'ProfilesInsert';
    this.api.post(DBAction, payload)
      .subscribe(async (res: any) => {
        //console.log(res);
        if (res.ProfileID > 0) {
          alert("Profile saved successfully ✅");
          this.uploadProfilePhoto();
        } else {
          alert("Something went wrong ❌");
        }
      });
  }
}