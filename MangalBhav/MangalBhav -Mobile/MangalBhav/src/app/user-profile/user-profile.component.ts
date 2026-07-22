import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, NavController, Platform, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { FcmService } from 'src/providers/fcm/fcm';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { addIcons } from 'ionicons';
import { KYCService } from 'src/providers/kyc/kyc.service';
import { Browser } from '@capacitor/browser';
import {
  logoInstagram,
  logoFacebook,
  logoYoutube,
  logoWhatsapp,
  logoLinkedin
} from 'ionicons/icons';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],

  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class UserProfileComponent implements OnInit {
  profilePreview: any | null = null;
  userDetails: any;
  socialMediaList: any[] = [];

  showSocialModal = false;

  isEditSocialMedia = false;

  socialMedia: any = {
    EntitySocialMediaID: -1,
    TenantID: '',
    EntityType: 'USER',
    EntityID: '',
    Platform: '',
    Link: '',
    Username: '',
    DisplayName: '',
    IsVerified: true,
    IsActive: true,
    DateAdded: new Date(),
    DateModified: new Date(),
    AddedByUser: '',
    UpdatedByUser: ''
  };
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
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    State: '',
    PinCode: '',
    Lat: '',
    Longitude: '',
    VerificationStatus: '',
    IsActive: true,
    DateAdded: new Date().toISOString(),
    DateModified: new Date().toISOString(),
    UpdatedByUser: null
  };

  showNotInterestedModal = false;
  isEditMode = false;
  isLoading = true;
  profileObject: any;
  language: any;
  bankDetails: any = null;
  upiId: string = '';
  showBankForm: boolean = false;
  referralCode: string = '';

  labels = {
    en: {
      appTitle: 'Mangal.Bhav',
      appSub: '✦ Peace · Prosperity · Protection ✦',

      bannerSub: 'Your Sacred',
      bannerTitle: 'Profile',

      address: 'Address',
      addressPlaceholder: 'Enter your full address...',

      changePhoto: 'Tap to change photo',

      personalDetails: 'Personal Details',

      // ── Address section ──
      addressDetails: 'Address Details',
      addressLine1: 'Address Line 1',
      enterAddressLine1: 'House / Flat / Building no.',
      addressLine2: 'Address Line 2',
      enterAddressLine2: 'Street / Locality / Area',
      city: 'City',
      enterCity: 'Enter your city',
      state: 'State',
      enterState: 'Enter your state',
      pinCode: 'PIN Code',
      enterPinCode: 'Enter 6-digit PIN code',

      notInterested: 'Not interested in using app',
      sorryTitle: "We're sorry to see you go",
      sorrySub: 'How can we help you before you leave?',
      connectSupport: 'Connect with Support',
      connectSupportSub: 'Chat with us on WhatsApp',
      deleteAccount: 'Delete My Account',
      deleteAccountSub: 'Permanently remove all your data',
      cancelKeep: 'Cancel — Keep my account',

      fullName: 'Full Name',
      enterFullName: 'Enter your full name',

      phone: 'Phone',
      verified: 'Verified',

      email: 'Email',
      enterEmail: 'Enter your email',

      gender: 'Gender',
      selectGender: 'Select Gender',

      male: 'Male',
      female: 'Female',
      other: 'Other',

      experience: 'Experience (Years)',
      enterExperience: 'e.g. 10',

      dob: 'Date of Birth',

      bio: 'Bio',
      bioPlaceholder: 'Tell devotees about yourself...',

      language: 'Language',
      selectLanguage: 'Select Language',

      basePrice: 'Base Price (₹)',
      enterPrice: 'e.g. 1100',

      updateProfile: 'Update Profile',
      createProfile: 'Create Profile',

      logout: 'Logout',
      explore: 'Explore Life',
      me: 'Me',
      role: 'Role',
      selectRole: 'Select Role',
      pandit: 'Pandit (Priest)',
      bhakt: 'Bhakt (Devotee)',
    },

    hi: {
      role: 'भूमिका',
      selectRole: 'भूमिका चुनें',
      pandit: 'पंडित (पुजारी)',
      bhakt: 'भक्त (भक्त)',
      appTitle: 'मंगल.भाव:',
      appSub: '✦ शांति · समृद्धि · सुरक्षा ✦',

      bannerSub: 'आपका पवित्र',
      bannerTitle: 'प्रोफाइल',
      address: 'पता',
      addressPlaceholder: 'अपना पूरा पता दर्ज करें...',

      changePhoto: 'फोटो बदलने के लिए टैप करें',

      personalDetails: 'व्यक्तिगत जानकारी',

      // ── Address section ──
      addressDetails: 'पता विवरण',
      addressLine1: 'पता पंक्ति 1',
      enterAddressLine1: 'मकान / फ्लैट / बिल्डिंग नंबर',
      addressLine2: 'पता पंक्ति 2',
      enterAddressLine2: 'गली / मोहल्ला / क्षेत्र',
      city: 'शहर',
      enterCity: 'अपना शहर दर्ज करें',
      state: 'राज्य',
      enterState: 'अपना राज्य दर्ज करें',
      pinCode: 'पिन कोड',
      enterPinCode: '6 अंकों का पिन कोड दर्ज करें',

      fullName: 'पूरा नाम',
      enterFullName: 'अपना पूरा नाम दर्ज करें',

      phone: 'फोन',
      verified: 'सत्यापित',

      email: 'ईमेल',
      enterEmail: 'अपना ईमेल दर्ज करें',

      gender: 'लिंग',
      selectGender: 'लिंग चुनें',

      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',

      experience: 'अनुभव (वर्ष)',
      enterExperience: 'जैसे 10',

      dob: 'जन्म तिथि',

      notInterested: 'ऐप उपयोग करने में रुचि नहीं',
      sorryTitle: 'आपको जाते देख दुख हुआ',
      sorrySub: 'जाने से पहले हम आपकी कैसे मदद कर सकते हैं?',
      connectSupport: 'सहायता से जुड़ें',
      connectSupportSub: 'WhatsApp पर हमसे बात करें',
      deleteAccount: 'मेरा अकाउंट हटाएं',
      deleteAccountSub: 'आपका सारा डेटा स्थायी रूप से हटा दिया जाएगा',
      cancelKeep: 'रद्द करें — अकाउंट रखें',

      bio: 'परिचय',
      bioPlaceholder: 'अपने बारे में भक्तों को बताएं...',

      language: 'भाषा',
      selectLanguage: 'भाषा चुनें',

      basePrice: 'मूल्य (₹)',
      enterPrice: 'जैसे 1100',

      updateProfile: 'प्रोफाइल अपडेट करें',
      createProfile: 'प्रोफाइल बनाएं',

      logout: 'लॉगआउट',
      explore: 'जीवन देखें',
      me: 'मैं'
    }
  };

  selectedRole: any = '';
  kycStatus: any = null;
  isKYCVerified = false;
  isKYCLoading = false;
  showKYCModal = false;
  kycStep = 1;

  kycData = {
    verificationId: '',
    referenceId: '',
    aadhaarNumber: '',
    mobileNumber: ''
  };

  kycLabels = {
    en: {
      kycTitle: 'KYC Verification',
      kycSubtitle: 'Verify your identity with Aadhaar',
      kycVerified: '✓ Verified',
      kycPending: '⚠ Pending',
      startKYC: 'Start KYC Verification',
      verifying: 'Verifying...',
      openDigiLocker: 'Open DigiLocker',
      checkingStatus: 'Checking status...',
      fetchDocument: 'Fetch Aadhaar Data',
      kycSuccess: 'KYC Verified Successfully!',
      kycFailed: 'KYC Verification Failed',
      tryAgain: 'Try Again',
      verifiedName: 'Verified Name',
      verifiedAddress: 'Verified Address',
      verifiedDOB: 'Date of Birth',
      verifiedGender: 'Gender',
      kycInfo: 'Your Aadhaar will be verified through DigiLocker. This is 100% secure and RBI compliant.',
      kycBenefits: 'Benefits: Verified badge, faster bookings, trust & credibility',
      closeBrowserMsg: 'Please complete DigiLocker steps, then close the browser to continue.',
      consentCheck: 'I have completed DigiLocker consent',
      step1Title: 'Step 1: Open DigiLocker',
      step2Title: 'Step 2: Complete Consent',
      step3Title: 'Step 3: Verify Data',
      notNow: 'Not Now'
    },
    hi: {
      kycTitle: 'KYC सत्यापन',
      kycSubtitle: 'आधार के साथ अपनी पहचान सत्यापित करें',
      kycVerified: '✓ सत्यापित',
      kycPending: '⚠ लंबित',
      startKYC: 'KYC सत्यापन शुरू करें',
      verifying: 'सत्यापित हो रहा है...',
      openDigiLocker: 'DigiLocker खोलें',
      checkingStatus: 'स्थिति जांच रहा है...',
      fetchDocument: 'आधार डेटा प्राप्त करें',
      kycSuccess: 'KYC सफलतापूर्वक सत्यापित!',
      kycFailed: 'KYC सत्यापन विफल',
      tryAgain: 'पुनः प्रयास करें',
      verifiedName: 'सत्यापित नाम',
      verifiedAddress: 'सत्यापित पता',
      verifiedDOB: 'जन्म तिथि',
      verifiedGender: 'लिंग',
      kycInfo: 'आपका आधार DigiLocker के माध्यम से सत्यापित किया जाएगा। यह 100% सुरक्षित और RBI अनुपालित है।',
      kycBenefits: 'लाभ: सत्यापित बैज, तेज बुकिंग, विश्वास और विश्वसनीयता',
      closeBrowserMsg: 'कृपया DigiLocker चरण पूरा करें, फिर ब्राउज़र बंद करें।',
      consentCheck: 'मैंने DigiLocker सहमति पूरी कर ली है',
      step1Title: 'चरण 1: DigiLocker खोलें',
      step2Title: 'चरण 2: सहमति पूर्ण करें',
      step3Title: 'चरण 3: डेटा सत्यापित करें',
      notNow: 'अभी नहीं'
    }
  };



  constructor(public routerCtrl: NavController, private kycService: KYCService,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private fcm: FcmService, private navCtrl: NavController,
    private plt: Platform,
    private http: HttpClient, public toastController: ToastController,
    private alertCtrl: AlertController) {
    addIcons({
      logoInstagram,
      logoFacebook,
      logoYoutube,
      logoWhatsapp,
      logoLinkedin
    });
  }


  loadSocialMedia() {
    this.apinu.postUrlData(
      `EntitySocialMediaSelectByQuery?Query=EntityType='USER' and EntityID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      this.socialMediaList = (res.EntitySocialMediaList || []).map((item: any) => ({
        ...item,
        IconName:
          item.Platform === 'Instagram' ? 'logo-instagram' :
            item.Platform === 'Facebook' ? 'logo-facebook' :
              item.Platform === 'YouTube' ? 'logo-youtube' :
                item.Platform === 'WhatsApp' ? 'logo-whatsapp' :
                  item.Platform === 'LinkedIn' ? 'logo-linkedin' :
                    'share-social-outline'
      }));
    });
  }


  // async ngOnInit() {
  //   this.userDetails = await this.storage.get("account");
  //    this.language = this.userDetails?.Languages || 'English';
  //   this.profile.UserID = this.userDetails.UserID;
  //   this.profile.TenantID = this.userDetails.TenantID;
  //   this.profile.PhoneNumber = this.userDetails.LoginID;

  //   this.loadSocialMedia();

  //   this.apinu.postUrlData(
  //     `UsersNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
  //     null
  //   ).subscribe((res: any) => {
  //     console.log(res.UserList[0]);

  //     this.userDetails = res.UserList[0];
  //     this.selectedRole = this.userDetails.Role;

  //     this.loadReferralCode();
  //     this.loadBankDetails();
  //   });

  //   this.apinu.postUrlData(
  //     `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
  //     null
  //   ).subscribe((res: any) => {
  //     if (res.ProfileList && res.ProfileList.length > 0) {
  //       const data = res.ProfileList[0];
  //       this.profileObject = res.ProfileList[0];
  //       this.isEditMode = true;
  //       this.profile = { ...data };

  //       if (this.profile.DOB) {
  //         this.profile.DOB = this.profile.DOB.toString().split('T')[0];
  //       }

  //       this.profilePreview = data.ProfilePhotoUrl;
  //       this.loadProfileImage();
  //     }
  //   });
  // }


  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    this.language = this.userDetails?.Languages || 'English';
    this.profile.UserID = this.userDetails.UserID;
    this.profile.TenantID = this.userDetails.TenantID;
    this.profile.PhoneNumber = this.userDetails.LoginID;
    this.loadKYCStatus();

    this.loadSocialMedia();

    let pendingCalls = 2;
    const done = () => { if (--pendingCalls === 0) this.isLoading = false; };

    this.apinu.postUrlData(
      `UsersNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`, null
    ).subscribe((res: any) => {
      this.userDetails = res.UserList[0];
      this.selectedRole = this.userDetails?.Role;
      // this.loadReferralCode();
      this.loadBankDetails();
      done();
    });

    this.apinu.postUrlData(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`, null
    ).subscribe((res: any) => {
      if (res.ProfileList && res.ProfileList.length > 0) {
        const data = res.ProfileList[0];
        this.profileObject = res.ProfileList[0];
        this.isEditMode = true;
        this.profile = { ...data };
        if (this.profile.DOB) {
          this.profile.DOB = this.profile.DOB.toString().split('T')[0];
        }
        this.profilePreview = data.ProfilePhotoUrl;
        this.loadProfileImage();
      }
      done();
    });
  }

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }


  loadProfileImage() {
    if (!this.profilePreview) return;

    this.api.getImage('DownloadImages', {
      imageName: this.profilePreview,
      imagePurpose: 'ProfilePhoto'
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

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profilePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    this.uploadProfilePhoto();
  }


  uploadProfilePhoto() {
    const userId = this.profile.UserID;
    const file = this.selectedProfileFile;
    if (!file || !userId) return;

    this.api.uploadImage(
      [file],
      'ProfilePhoto',
      userId.toString(),
      'ProfilePhoto'
    ).subscribe((res: any) => {
      console.log(res);
      if (res.Status === 'Success') {
        this.selectedProfileFile = null;

        this.profileObject.ProfilePhotoUrl = res.FileName;
        this.profile.ProfilePhotoUrl = res.FileName;

        this.apinu.postUrlData('ProfilesUpdate', this.profileObject).subscribe(async (res: any) => {
          if (res.ProfileID > 0) {
            const account = await this.storage.get('account');
            account.ProfilePhotoUrl = this.profileObject.ProfilePhotoUrl;
            await this.storage.set('account', account);
            this.showToast('Profile photo updated successfully', 'success');
          }
        });
      } else {
        this.showToast("Profile photo Upload failed", 'danger');
      }
    });
  }


  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 4000, color, position: 'top'
    });
    toast.present();
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
      dOB: this.profile.DOB ? `${this.profile.DOB}T00:00:00.000Z` : null,
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

      // ── Address fields ──
      addressLine1: this.profile.AddressLine1 || '',
      addressLine2: this.profile.AddressLine2 || '',
      city: this.profile.City || '',
      state: this.profile.State || '',
      pinCode: this.profile.PinCode ? String(this.profile.PinCode) : '',
      lat: '',   // intentionally empty — not collected from user
      Longitude: '',  // intentionally empty — not collected from user

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
    this.apinu.postUrlData(
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

  loadBankDetails() {
    if (this.userDetails?.Role !== 'PANDIT') return;

    this.apinu.postUrlData(
      `BankDetailsSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.BankDetailList && res.BankDetailList.length > 0) {
        this.bankDetails = res.BankDetailList[0];
        this.upiId = this.bankDetails.UPIId || '';
        this.showBankForm = false;
      } else {
        this.bankDetails = null;
        this.showBankForm = true;
      }
    });
  }

  saveBankDetails() {
    const body: any = {
      BankDetailsId: Number(this.bankDetails?.BankDetailsId || 0),
      TenantId: Number(this.userDetails.TenantID || 1),
      UserID: Number(this.userDetails.UserID),
      MandirID: 0,
      AccountHolderName: '',
      BankName: '',
      AccountNumber: '',
      IFSCCode: '',
      BranchName: '',
      UPIId: String(this.upiId),
      AccountType: '',
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: Number(this.userDetails.UserID)
    };

    const action = this.bankDetails
      ? 'BankDetailsUpdate'
      : 'BankDetailsInsert';

    if (this.bankDetails) {
      body['BankDetailID'] = this.bankDetails.BankDetailID;
    }

    this.apinu.postUrlData(action, body).subscribe((res: any) => {
      console.log(res);
      this.showToast('UPI ID saved successfully ✅', 'success');
      this.loadBankDetails();
    });
  }

  async logout() {
    await this.storage.clear();
    this.routerCtrl.navigateForward('/login');

    const deviceId = await this.fcm.getDeviceID();

    this.apinu.postUrlData(`UserDeviceSelectByQuery?Query=DeviceID=${deviceId}`, null)
      .subscribe(async (res: any) => {
        console.log(res.UserDeviceList[0]);

        const body = {
          ...res.UserDeviceList[0],
          IsActive: Boolean(0),
          DateModified: new Date()
        };

        this.apinu.postUrlData(`UserDeviceUpdate`, body)
          .subscribe(async (res: any) => {
            await this.storage.clear();
            this.routerCtrl.navigateForward('/login');
          });
      });
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  saveProfile() {
    const payload = this.prepareProfileForSubmit();
    const DBAction = this.isEditMode ? 'ProfilesUpdate' : 'ProfilesInsert';
    const previousRole = this.userDetails.Role;
    const previousLanguage = this.profileObject?.Languages;

    this.apinu.postUrlData(DBAction, payload).subscribe(async (res: any) => {
      if (res.ProfileID > 0) {

        const userPayload = {
          ...this.userDetails,
          Role: this.selectedRole
        };

        this.apinu.postUrlData('UsersUpdate', userPayload).subscribe(async (userRes: any) => {
          if (userRes.UserID > 0) {

            const account = await this.storage.get('account');
            account.Languages = payload.languages;
            account.Role = this.selectedRole;
            await this.storage.set('account', account);

            this.userDetails.Role = this.selectedRole;
            this.userDetails.Languages = payload.languages;

            this.showToast('Profile saved successfully ✅', 'success');

            if (previousRole !== this.selectedRole || previousLanguage !== payload.languages) {
              window.location.reload();
            }

          } else {
            this.showToast('Profile saved but role update failed ⚠️', 'danger');
          }
        });

      } else {
        this.showToast('Something went wrong ❌', 'danger');
      }
    });
  }

  async contactSupport() {
    this.showNotInterestedModal = false;
    await Browser.open({
      url: 'https://wa.me/918796917944?text=' +
        encodeURIComponent(
          `🙏 Namaste, I need help with my Mangal Bhav account.\n\nName: ${this.profile.FullName || ''}\nPhone: ${this.profile.PhoneNumber || ''}`
        )
    });
  }

  goToDeleteAccount() {
    this.showNotInterestedModal = false;
    this.routerCtrl.navigateForward('/deleteaccount');
  }

  openAddSocialMedia() {
    this.isEditSocialMedia = false;

    this.socialMedia = {
      EntitySocialMediaID: -1,
      TenantID: Number(this.userDetails.TenantID),
      EntityType: 'USER',
      EntityID: Number(this.userDetails.UserID),
      Platform: '',
      Link: '',
      Username: '',
      DisplayName: '',
      IsVerified: true,
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      AddedByUser: this.userDetails.FullName,
      UpdatedByUser: this.userDetails.FullName
    };

    this.showSocialModal = true;
  }

  editSocialMedia(item: any) {
    this.isEditSocialMedia = true;
    this.socialMedia = { ...item };
    this.showSocialModal = true;
  }



  saveSocialMedia() {
    if (!this.validateSocialMedia()) return;

    const action = this.isEditSocialMedia
      ? 'EntitySocialMediaUpdate'
      : 'EntitySocialMediaInsert';

    this.socialMedia.DateModified = new Date();

    this.apinu.postUrlData(action, this.socialMedia).subscribe((res: any) => {
      this.showToast(
        this.isEditSocialMedia ? 'Social media updated' : 'Social media added',
        'success'
      );
      this.showSocialModal = false;
      this.loadSocialMedia();
    });
  }

  private validateSocialMedia(): boolean {
    if (!this.socialMedia.Platform?.trim()) {
      this.showToast('Please select a platform', 'warning');
      return false;
    }
    if (!this.socialMedia.Username?.trim()) {
      this.showToast('Please enter a username', 'warning');
      return false;
    }
    if (!this.socialMedia.DisplayName?.trim()) {
      this.showToast('Please enter a display name', 'warning');
      return false;
    }
    if (!this.socialMedia.Link?.trim()) {
      this.showToast('Please enter a profile URL', 'warning');
      return false;
    }
    if (!this.isValidUrl(this.socialMedia.Link)) {
      this.showToast('Please enter a valid URL (e.g. https://instagram.com/username)', 'warning');
      return false;
    }
    return true;
  }

  private isValidUrl(link: string): boolean {
    let candidate = link.trim();
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = 'https://' + candidate;
      this.socialMedia.Link = candidate; // auto-fix so it's saved with protocol
    }
    try {
      const url = new URL(candidate);
      return url.hostname.includes('.');
    } catch {
      return false;
    }
  }

  // saveSocialMedia() {
  //   const action = this.isEditSocialMedia
  //     ? 'EntitySocialMediaUpdate'
  //     : 'EntitySocialMediaInsert';

  //   this.socialMedia.DateModified = new Date();

  //   this.apinu.postUrlData(action, this.socialMedia).subscribe((res: any) => {
  //     this.showToast(
  //       this.isEditSocialMedia ? 'Social media updated' : 'Social media added',
  //       'success'
  //     );
  //     this.showSocialModal = false;
  //     this.loadSocialMedia();
  //   });
  // }

  getPlatformClass(platform: string) {
    switch (platform) {
      case 'Instagram': return 'platform-instagram';
      case 'WelcomeReel': return 'platform-instagram';
      case 'Facebook': return 'platform-facebook';
      case 'YouTube': return 'platform-youtube';
      case 'LinkedIn': return 'platform-linkedin';
      case 'WhatsApp': return 'platform-whatsapp';
      case 'Twitter': return 'platform-twitter';
      case 'Website': return 'platform-website';
      default: return 'platform-default';
    }
  }

  openCommunity() {
    this.navCtrl.navigateForward('/open-community-page');
  }

  deleteSocialMedia(item: any) {
    this.apinu.postUrlData(
      `EntitySocialMediaDelete?entitySocialMediaID=${item.EntitySocialMediaID}`,
      null
    ).subscribe(() => {
      this.showToast('Deleted successfully', 'success');
      this.loadSocialMedia();
    });
  }

  getPlatformIcon(platform: string) {
    console.log(platform);
    platform = (platform || '').trim();

    switch (platform) {
      case 'Instagram': return 'logo-instagram';
      case 'Facebook': return 'logo-facebook';
      case 'YouTube': return 'logo-youtube';
      case 'LinkedIn': return 'logo-linkedin';
      case 'WhatsApp': return 'logo-whatsapp';
      default:
        console.log('Unknown platform:', JSON.stringify(platform));
        return 'share-social-outline';
    }
  }

  loadReferralCode() {
    this.apinu.postUrlData(
      `UserReferralCodeSelectByQuery?Query=UserID=${this.userDetails?.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.UserReferralCodeList?.length > 0) {
        this.referralCode = res.UserReferralCodeList[0].ReferralCode;
      }
    });
  }

  async shareReferralOnWhatsApp() {
    const name = this.profile.FullName || 'A friend';
    const message =
      `🙏 *Jai Shri Ram* 🙏\n\n` +
      `${name} ne aapko *Mangal Bhav* app par aane ka nimantran diya hai!\n\n` +
      `📿 Pandits aur Bhakton ko jodne wala pehla dharmic platform.\n\n` +
      `Sign up karte waqt neeche diya referral code zaroor use karein:\n` +
      `🎟️ *${this.referralCode}*\n\n` +
      `✨ Hare Krishna, Hare Ram ✨`;

    await Browser.open({
      url: 'https://wa.me/?text=' + encodeURIComponent(message)
    });
  }

  async copyReferralCode() {
    try {
      await navigator.clipboard.writeText(this.referralCode);
      this.showToast('Referral code copied! 📋', 'success');
    } catch {
      this.showToast('Could not copy, please copy manually', 'warning');
    }
  }


  loadKYCStatus() {
    if (!this.userDetails?.UserID) return;

    this.kycService.getKYCStatus(this.userDetails.UserID).subscribe({
      next: (res: any) => {
        // Normalize PascalCase → camelCase once here
        this.kycStatus = {
          isVerified: res.IsVerified || res.isVerified || false,
          isEKYC: res.IsEKYC || res.isEKYC || false,
          isMBVerified: res.IsMBVerified || res.isMBVerified || false,
          verifiedName: res.VerifiedName || res.verifiedName || '',
          verifiedAddress: res.VerifiedAddress || res.verifiedAddress || '',
          verifiedDOB: res.VerifiedDOB || res.verifiedDOB || '',
          verifiedGender: res.VerifiedGender || res.verifiedGender || '',
          remarks: res.Remarks || res.remarks || ''
        };
        this.isKYCVerified = this.kycStatus.isVerified; // ← now reads normalized value
      },
      error: (err) => {
        console.log('KYC status not found (normal for new users)', err);
        this.kycStatus = null;
        this.isKYCVerified = false;
      }
    });
  }

  /** Open KYC modal */
  openKYCModal() {
    this.showKYCModal = true;
    this.kycStep = 1;
    this.kycData = { verificationId: '', referenceId: '', aadhaarNumber: '', mobileNumber: '' };
  }

  /** Step 1: Generate Auth URL and Open DigiLocker */



  applyKYCToProfile() {
    if (!this.kycStatus) {
      this.closeKYCModal();
      return;
    }

    // Map verified name
    if (this.kycStatus.verifiedName) {
      this.profile.FullName = this.kycStatus.verifiedName;
    }

    // Map gender — Cashfree returns "M"/"F", profile stores "Male"/"Female"
    if (this.kycStatus.verifiedGender) {
      const g = this.kycStatus.verifiedGender.toUpperCase();
      this.profile.Gender = g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other';
    }

    // Map DOB — Cashfree returns "04-02-2004" (dd-MM-yyyy), input needs "2004-02-04" (yyyy-MM-dd)
    if (this.kycStatus.verifiedDOB) {
      const parts = this.kycStatus.verifiedDOB.split('-');
      if (parts.length === 3) {
        // If already dd-MM-yyyy format
        this.profile.DOB = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Close modal first, then save
    this.showKYCModal = false;
    this.kycStep = 1;
    this.kycService.clearKYCSession();

    // Save profile with KYC data filled in
    this.saveProfile();
    this.showToast('Profile updated with verified KYC data ✅', 'success');
  }


  startKYC() {
    this.isKYCLoading = true;

    this.kycService.generateAuthUrl(
      this.userDetails.UserID,
      this.userDetails.TenantID || 1,
      this.userDetails.FullName || 'User'
    ).subscribe({
      next: (res: any) => {
        this.isKYCLoading = false;
        console.log('GenerateAuthUrl response:', res);

        const authUrl = res?.AuthUrl;           // ← PascalCase matches controller
        const verId = res?.VerificationID;
        const refId = res?.ReferenceID;

        if (authUrl) {
          this.kycData.verificationId = verId || '';
          this.kycData.referenceId = refId || '';

          console.log('verificationId stored:', this.kycData.verificationId);
          console.log('referenceId stored:', this.kycData.referenceId);

          this.kycStep = 2;
          this.openDigiLockerInApp(authUrl);
        } else {
          this.showToast('Failed to get KYC link.', 'danger');
        }
      },
      error: (err) => {
        this.isKYCLoading = false;
        console.error('KYC Error:', err);
        this.showToast('KYC error. Please try again.', 'danger');
      }
    });
  }



  /**
   * Open DigiLocker in Capacitor In-App Browser
   * This is the MOBILE way - keeps user in app experience
   */
  // In openDigiLockerInApp() — remove old listeners FIRST
  async openDigiLockerInApp(url: string) {
    await Browser.removeAllListeners(); // ← ADD THIS before adding new listener
    await Browser.open({ url: url });

    Browser.addListener('browserFinished', async () => {
      await Browser.removeAllListeners(); // cleanup after use
      this.kycStep = 3;
      this.showToast('Checking consent status...', 'primary');
      this.checkConsentStatus(); // ← also auto-trigger it here
    });
  }
  /** Step 2: Check Consent Status after user returns from DigiLocker */




  checkConsentStatus() {
    if (!this.kycData.verificationId) {
      this.showToast('Session expired. Please start KYC again.', 'warning');
      return;
    }

    this.isKYCLoading = true;

    // Both IDs already captured from step 1 — use them directly
    console.log('Checking consent with:');
    console.log('  referenceId:', this.kycData.referenceId);
    console.log('  verificationId:', this.kycData.verificationId);

    this.kycService.checkConsentStatus(
      this.kycData.referenceId,    // CF_XXXX — from GenerateAuthUrl response
      this.kycData.verificationId, // MB_2137_XXX — our ID
      this.userDetails.UserID,
      this.userDetails.TenantID || 1
    ).subscribe({
      next: (res: any) => {
        this.isKYCLoading = false;
        console.log('Consent response:', JSON.stringify(res));

        const consentStatus = (
          res?.ConsentStatus ||                        // ← controller's mapped field
          res?.consentStatus ||
          res?.cashfreeResponse?.status ||             // ← Cashfree's actual field name
          res?.cashfreeResponse?.consent_status ||
          ''
        ).toUpperCase();

        console.log('Consent status:', consentStatus);


        const accepted = [
          'ACCEPTED',
          'COMPLETED',
          'CONSENT_GIVEN',
          'SUCCESS',
          'VERIFIED',
          'LINKED',
          'AUTHENTICATED'   // ← ADD THIS — Cashfree's actual status for consent given
        ];


        if (accepted.includes(consentStatus)) {
          this.kycStep = 4;
          this.showToast('Consent accepted! Fetching Aadhaar...', 'success');
          this.fetchDocumentData();
        } else {
          this.showToast(`Status: "${consentStatus}" — please complete DigiLocker.`, 'warning');
        }
      },
      error: (err) => {
        this.isKYCLoading = false;
        console.error('Consent error:', err);
        this.showToast('Error checking consent. Try again.', 'danger');
      }
    });
  }



  /** Step 3: Fetch Document Data (Aadhaar) */
  fetchDocumentData() {
    this.isKYCLoading = true;

    this.kycService.getDocumentData(
      this.kycData.referenceId || this.kycData.verificationId,
      this.kycData.verificationId,
      'AADHAAR',
      this.userDetails.UserID,
      this.userDetails.TenantID || 1
    ).subscribe({
      next: (res: any) => {
        this.isKYCLoading = false;

        if (res.Status === 'Success') {
          this.kycStep = 5; // Success
          this.isKYCVerified = true;
          this.loadKYCStatus(); // Refresh status
          this.showToast('KYC verification completed!', 'success');
        } else {
          this.showToast('Failed to fetch document data.', 'danger');
        }
      },
      error: (err) => {
        this.isKYCLoading = false;
        this.showToast('Error fetching document. Please try again.', 'danger');
        console.error('Document fetch error:', err);
      }
    });
  }

  /** Complete full KYC flow in one go (alternative method) */
  completeKYC() {
    if (!this.kycData.aadhaarNumber || this.kycData.aadhaarNumber.length !== 12) {
      this.showToast('Please enter valid 12-digit Aadhaar number', 'warning');
      return;
    }

    if (!this.kycData.mobileNumber || this.kycData.mobileNumber.length !== 10) {
      this.showToast('Please enter valid 10-digit mobile number', 'warning');
      return;
    }

    this.isKYCLoading = true;

    const request = {
      userID: this.userDetails.UserID,
      tenantID: this.userDetails.TenantID || 1,
      verificationID: this.kycData.verificationId,
      mobileNumber: this.kycData.mobileNumber,
      aadhaarNumber: this.kycData.aadhaarNumber,
      updatedByUser: this.userDetails.FullName || 'User'
    };

    this.kycService.completeKYC(request).subscribe({
      next: (res: any) => {
        this.isKYCLoading = false;

        if (res.isVerified) {
          this.isKYCVerified = true;
          this.showKYCModal = false;
          this.loadKYCStatus();
          this.showToast('KYC verified successfully!', 'success');
        } else {
          this.showToast('KYC verification failed. ' + res.message, 'danger');
        }
      },
      error: (err) => {
        this.isKYCLoading = false;
        this.showToast('KYC completion error. Please try again.', 'danger');
        console.error('Complete KYC error:', err);
      }
    });
  }

  /** Close KYC modal */
  closeKYCModal() {
    this.showKYCModal = false;
    this.kycStep = 1;
    this.kycService.clearKYCSession();
  }

  /** Get KYC label */
  get kycT() {
    return this.language === 'Hindi' ? this.kycLabels.hi : this.kycLabels.en;
  }


  // Add this property alongside other KYC properties
  showKYCDetails = false;

  // Add this method
  openKYCDetails() {
    if (this.isKYCVerified) {
      this.showKYCDetails = true;
    } else {
      this.openKYCModal();
    }
  }
}