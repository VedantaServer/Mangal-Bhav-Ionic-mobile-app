import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';


@Component({
  selector: 'app-pandit-services',
  templateUrl: './pandit-services.component.html',
  styleUrls: ['./pandit-services.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PanditjibottomtabsComponent]
})
export class PanditServicesComponent implements OnInit {

  userDetails: any;
  isUploadModalOpen = false;
  selectedServiceID: number | null = null;
  agreeToCharges: boolean = false;

  selectedServiceIDs: number[] = [];

  selectedFile: File | null = null;

  isPreviewOpen = false;
  previewUrl = '';
  serviceImages: any[] = [];
  uploadedPhotos: any[] = [];
  isEditMode = false;
  isModalOpen = false;

  ServiceCategoryList: any[] = [];
  ServiceList: any[] = [];
  ServiceCategoryMappingList: any[] = [];
  FilteredServiceList: any[] = [];
  selectedCategoryID: any;
  panditServices: any = {
    PanditServiceID: 0,
    TenantID: 0,
    ProfileID: 0,
    ServiceID: 0,
    LocationID: 0,
    Price: 0,
    IsActive: false,
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };


  labels = {
    en: {
      serviceTitle: '🪔 Service',
      appTitle: '✦ Mangal.Bhav ✦',

      pageTitle: 'Seva Services',
      bannerSub: 'Manage Your',
      bannerTitle: 'Pandit Services',
      sevaList: 'Your Seva List',

      active: 'Active',
      inactive: 'Inactive',

      category: 'Category',
      service: 'Service',
      location: 'Location',
      price: 'Price',

      bookings: 'Bookings',
      uploadPhotos: 'Upload Photos',
      activate: 'Activate',
      deactivate: 'Deactivate',

      emptyTitle: 'No Services Yet',
      emptySub: 'Tap the + button to add your first seva service',

      editService: 'Edit Service',
      addService: 'Add Service',

      sevaDetails: 'Seva Details',
      selectCategory: 'Select Category',
      chooseCategory: 'Choose Category',

      selectService: 'Select Service',
      chooseService: 'Choose Service',

      locationPricing: 'Location & Pricing',
      selectLocation: 'Select Location',
      chooseLocation: 'Choose Location',
      enterPrice: 'Enter Price',

      status: 'Status',
      activeService: 'Active Service',
      activeSub: 'Make this seva available for booking',
      savedLocations: 'Saved Locations',
      addNewLocation: 'Add New Location',
      searchingPlaces: 'Searching places…',
      noResults: 'No results. Try a different name or pincode.',
      updateService: 'Update Service',
      createService: 'Create Service',

      sevaPhotos: 'Seva Photos',
      tapUpload: 'Tap to Upload Photo',
      imgSupport: 'JPG, PNG supported',
      uploadSelected: 'Upload Selected Photo',

      uploadedPhotos: 'Uploaded Photos',
      noPhotos: 'No Photos Yet',
      noPhotosSub: 'Upload photos of your seva to attract more bookings'
    },

    hi: {
      serviceTitle: '🪔 सेवा',
      appTitle: '✦ मंगल भाव ✦',

      savedLocations: 'सहेजे गए स्थान',
      addNewLocation: 'नया स्थान जोड़ें',
      searchingPlaces: 'स्थान खोजा जा रहा है…',
      noResults: 'कोई परिणाम नहीं। अलग नाम या पिनकोड आज़माएं।',


      pageTitle: 'सेवा सेवाएँ',
      bannerSub: 'अपनी',
      bannerTitle: 'पंडित जी सेवाएँ प्रबंधित करें',
      sevaList: 'आपकी सेवा सूची',

      active: 'सक्रिय',
      inactive: 'निष्क्रिय',

      category: 'श्रेणी',
      service: 'सेवा',
      location: 'स्थान',
      price: 'मूल्य',

      bookings: 'बुकिंग्स',
      uploadPhotos: 'फोटो अपलोड करें',
      activate: 'सक्रिय करें',
      deactivate: 'निष्क्रिय करें',

      emptyTitle: 'अभी कोई सेवा नहीं',
      emptySub: 'अपनी पहली सेवा जोड़ने के लिए + बटन दबाएँ',

      editService: 'सेवा संपादित करें',
      addService: 'सेवा जोड़ें',

      sevaDetails: 'सेवा विवरण',
      selectCategory: 'श्रेणी चुनें',
      chooseCategory: 'श्रेणी चुनें',

      selectService: 'सेवा चुनें',
      chooseService: 'सेवा चुनें',

      locationPricing: 'स्थान और मूल्य',
      selectLocation: 'स्थान चुनें',
      chooseLocation: 'स्थान चुनें',
      enterPrice: 'मूल्य दर्ज करें',

      status: 'स्थिति',
      activeService: 'सक्रिय सेवा',
      activeSub: 'इस सेवा को बुकिंग के लिए उपलब्ध करें',

      updateService: 'सेवा अपडेट करें',
      createService: 'सेवा बनाएं',

      sevaPhotos: 'सेवा फोटो',
      tapUpload: 'फोटो अपलोड करने के लिए टैप करें',
      imgSupport: 'JPG, PNG समर्थित',
      uploadSelected: 'चयनित फोटो अपलोड करें',

      uploadedPhotos: 'अपलोड की गई फोटो',
      noPhotos: 'अभी कोई फोटो नहीं',
      noPhotosSub: 'अधिक बुकिंग पाने के लिए सेवा की फोटो अपलोड करें'
    }
  };

  PanditServicesList: any[] = [];

  LocationList: any[] = [];
  // selectedFile: any = null;
  language!: any;
  // ── Quick Add Location via GeoNames ──
  isQuickLocationModalOpen = false;
  geonamesQuery = '';
  geonamesResults: any[] = [];
  isGeonamesLoading = false;
  selectedGeoname: any = null;
  quickLocationName = '';

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage, public toastController: ToastController,
    private plt: Platform, private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }



  onAddLocation() {
    // Open inline GeoNames modal — no navigation needed
    this.geonamesQuery = '';
    this.geonamesResults = [];
    this.selectedGeoname = null;
    this.quickLocationName = '';
    this.isQuickLocationModalOpen = true;
  }

  closeQuickAddLocation() {
    this.isQuickLocationModalOpen = false;
  }



  searchGeonames() {
    if (!this.geonamesQuery.trim()) return;

    this.isGeonamesLoading = true;
    this.geonamesResults = [];
    this.selectedGeoname = null;

    const query = this.geonamesQuery.trim();
    const isPincode = /^\d{6}$/.test(query);   // exactly 6 digits = pincode

    const url = isPincode
      ? `https://secure.geonames.org/postalCodeSearchJSON?postalcode=${query}&country=IN&maxRows=8&username=nehul0402`
      : `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=8&username=nehul0402&style=MEDIUM&country=IN`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.isGeonamesLoading = false;

        if (isPincode) {
          // Normalize postal results → same shape as geonames search results
          this.geonamesResults = (data.postalCodes || []).map((p: any) => ({
            geonameId: `${p.postalCode}_${p.placeName}`,   // synthetic unique key
            toponymName: p.placeName,
            name: p.placeName,
            adminName1: p.adminName1,                        // State
            adminName2: p.adminName2 || p.adminName3 || p.placeName,  // District/City
            countryName: 'India',
            lat: p.lat,
            lng: p.lng,
            postalCode: p.postalCode,                        // ← pincode preserved
          }));
        } else {
          this.geonamesResults = data.geonames || [];
        }
      },
      error: () => {
        this.isGeonamesLoading = false;
        this.showToast('Search failed. Check network or GeoNames username.', 'danger');
      }
    });
  }


  selectGeoname(place: any) {
    this.selectedGeoname = place;
    this.quickLocationName = place.toponymName || place.name;
  }


  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 4000, color, position: 'top'
    });
    toast.present();
  }

  saveQuickLocation() {
    if (!this.selectedGeoname || !this.quickLocationName.trim()) {
      this.showToast('Please search and select a place first.', 'danger');
      return;
    }

    const payload = {
      locationID: 0,
      tenantID: Number(this.userDetails.TenantID),
      userID: Number(this.userDetails.UserID),
      name: this.quickLocationName.trim(),
      contactPerson: this.userDetails.FullName,
      contactPhone: String(this.userDetails.LoginID),
      contactEmail: '',
      addressLine1: '',
      addressLine2: '',
      city: this.selectedGeoname.adminName2 || this.selectedGeoname.name || '',
      pincode: this.selectedGeoname.postalCode || '',
      state: this.selectedGeoname.adminName1 || '',
      country: this.selectedGeoname.countryName || '',
      latitude: Number(this.selectedGeoname.lat) || 0,
      longitude: Number(this.selectedGeoname.lng) || 0,
      isActive: true,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: String(this.userDetails.UserID),
    };

    this.apinu.postUrlData('LocationsInsert', payload).subscribe((res: any) => {
      if (res.LocationID > 0) {
        // Refresh dropdown and auto-select the new location
        this.apinu
          .postUrlData(`LocationsNUSelectByQuery?Query=UserID=${this.userDetails.UserID}`, null)
          .subscribe((r: any) => {
            this.LocationList = r.LocationList;
            this.panditServices.LocationID = res.LocationID; // auto-select it
          });
        this.closeQuickAddLocation();
      } else {
        this.showToast('Could not save location ❌', 'danger');
      }
    });
  }


  async ngOnInit() {
    this.userDetails = await this.storage.get("account");

    //   this.language = await this.storage.get("Language");
    this.language = this.userDetails.Languages;

    // alert(this.language)
    // 1. Categories
    this.apinu.postUrlData(`ServiceCategorySelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceCategoryList = res.ServiceCategoryList;
      });

    // 2. Mapping
    this.apinu.postUrlData(`ServiceCategoryMappingSelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceCategoryMappingList = res.ServiceCategoryMappingList;
      });

    // 3. Services
    this.apinu.postUrlData(`ServiceSelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceList = res.ServiceList;
      });

    this.apinu.postUrlData(`LocationsNUSelectByQuery?Query=UserID=${this.userDetails.UserID}`, null)
      .subscribe((res: any) => {
        //  console.log(res.LocationList);
        this.LocationList = res.LocationList;
      })

    this.loadList();
  }


  previewPhoto(photo: any) {
    this.previewUrl = photo.imageUrl;
    this.isPreviewOpen = true;
  }

  // -----------------------------
  // Load List
  // -----------------------------
  loadList() {
    this.apinu.postUrlData(
      `PanditServicesNUSelectByQuery?Query= ProfileId=${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      //  console.log(res)
      this.PanditServicesList = res?.PanditServiceList || [];
    });
  }

  getServiceNameHindiEnglish(service: any): string {

    if (!service.Name) return '';

    const parts = service.Name.split('/');

    if (this.language === 'Hindi') {
      return parts[1] ? parts[1].trim() : parts[0].trim();
    } else {
      return parts[0].trim();
    }
  }


  uploadPhotos(item: any) {

    //  console.log('Upload photos for service:', item.PanditServiceID);

    this.selectedServiceID = item.PanditServiceID;

    this.isUploadModalOpen = true;

    // call API to get already uploaded photos
    this.getServicePhotos();
  }


  closeUploadModal() {
    this.isUploadModalOpen = false;
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }



  uploadImage() {

    if (!this.selectedFile) return;

    this.api.uploadImage([this.selectedFile], 'PanditService', String(this.selectedServiceID), 'PanditService')
      .subscribe((res: any) => {
        console.log(res);

        if (res.Status === 'Success') {
          const body = {
            TenantID: Number(this.userDetails.TenantID),
            DocumentType: "PanditService",
            EntityType: "PanditService",
            EntityRefKey: Number(this.selectedServiceID),
            // Description: 'Attendance for the batch : ' + res.FileName + `(${res.FileUrl})`,
            Description: JSON.stringify({
              fileName: res.FileName,
              fileUrl: res.FileUrl,
              imageIds: res.FileName
            }),
            FileName: res.FileName,
            DateAdded: new Date(),
            DateModified: new Date(),
            UpdatedByUser: this.userDetails.LoginID
          };
          this.apinu.postUrlData(`DocumentInsert`, body).subscribe((resp: any) => {
            this.showToast('Success', 'success');
            this.selectedFile = null;
          })
        }
      })

    console.log('Uploading image...');

  }


  getServicePhotos() {

    const query = `DocumentType = 'PanditService' and EntityType = 'PanditService' and EntityRefKey = ${this.selectedServiceID}`;

    this.apinu.postUrlData(`DocumentSelectByQuery?Query=${query}`, null).subscribe({
      next: (res: any) => {

        const documentList = res?.DocumentList || [];

        if (!documentList.length) {
          console.log('No images found');
          this.serviceImages = [];
          return;
        }

        const imageRequests = documentList.map((doc: any) => {

          const params = {
            imageName: doc.FileName,
            imagePurpose: 'PanditService'
          };

          return this.api.getImage('DownloadImages', params);
        });

        if (!imageRequests.length) return;

        forkJoin(imageRequests).subscribe({
          next: (responses: any) => {

            this.serviceImages = responses.map((blob: any, index: number) => {

              if (blob && blob.type && blob.type.startsWith('image/')) {
                return {
                  fileName: documentList[index].FileName,
                  imageUrl: URL.createObjectURL(blob)
                };
              }

              return {
                fileName: documentList[index].FileName,
                imageUrl: 'assets/uploadfile.png'
              };

            });

            console.log('Loaded images:', this.serviceImages);
          },

          error: (err) => {
            console.error('Error loading images:', err);
          }
        });

      },

      error: (err: any) => {
        console.error('Error fetching document list:', err);
      }
    });
  }





  viewServiceBookings(item: any) {
    // TODO: navigate to bookings filtered by this service
    console.log('View bookings for service:', item.PanditServiceID);


    this.router.navigate(['/yajman-booking'], {
      queryParams: { id: item.PanditServiceID }
    });
  }

  shareService(item: any) {
    const serviceName = this.getServiceName(item.ServiceID);
    if (navigator.share) {
      navigator.share({
        title: `Book ${serviceName} with me on Mangal Bhav`,
        text: `I offer ${serviceName} at ₹${item.Price}. Book now on Mangal Bhav 🙏`,
        url: window.location.href
      });
    }
  }


  isShareModalOpen = false;
  shareItem: any = null;
  linkCopied = false;

  openShareModal(item: any) {
    this.shareItem = item;
    this.isShareModalOpen = true;
  }


  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '../../assets/img/default.jpg';
    // If even default fails, use a CSS gradient placeholder
    img.onerror = null;
  }
  getCurrentImage(serviceName: string): string {
    const key = this.getCleanName(serviceName);
    const images = this.getServiceImages(serviceName);

    if (!(key in this.currentImageIndex)) {
      this.startSlideshow(serviceName);
    }

    return images[this.currentImageIndex[key] || 0];
  }

  getCleanName(serviceName: string): string {
    let cleanName = serviceName.split('/')[0].trim();
    cleanName = cleanName.replace(/\s+/g, '');
    cleanName = cleanName.replace(/[^a-zA-Z0-9]/g, '');
    return cleanName;
  }

  getServiceImages(serviceName: string): string[] {
    const cleanName = this.getCleanName(serviceName);

    return [
      `assets/img/${cleanName}.png`,
      `assets/img/${cleanName}2.jfif`,
      `assets/img/${cleanName}3.jfif`
    ];
  }

  startSlideshow(serviceName: string) {
    const key = this.getCleanName(serviceName);

    if (this.imageIntervals[key]) return; // avoid multiple intervals

    this.currentImageIndex[key] = 0;

    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] =
        (this.currentImageIndex[key] + 1) % 3;
    }, 300000); // change every 3 seconds
  }

  // QR code via free API — no library needed
  getQrUrl(serviceId: any): string {
    const text = `MangalBhav Service ID: ${serviceId} | Book at: ${window.location.origin}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
  }

  shareViaWhatsApp(item: any) {
    const name = this.getServiceName(item.ServiceID);
    const msg = encodeURIComponent(
      `🙏 *${name}*\n📍 ${this.getLocationName(item.LocationID)}\n💰 Starting at ₹${item.Price}\n🆔 Service ID: #${item.PanditServiceID}\n\nBook now on Mangal.Bhav 🔥`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  shareViaNative(item: any) {
    const name = this.getServiceName(item.ServiceID);
    if (navigator.share) {
      navigator.share({
        title: `Book ${name} on Mangal Bhav`,
        text: `I offer ${name} at ₹${item.Price}. Service ID: #${item.PanditServiceID} 🙏`,
        url: window.location.href
      });
    }
  }

  copyLink(item: any) {
    const text = `${window.location.origin}?service=${item.PanditServiceID}`;
    navigator.clipboard.writeText(text).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2500);
    });
  }

  toggleActive(item: any) {
    // TODO: call API to toggle IsActive, then refresh list
    console.log('Toggle active for:', item.PanditServiceID, '→', !item.IsActive);
  }


  onCategoryChange(event: any) {

    const categoryID = event.detail.value;

    // Step 1: Get mapped service IDs
    const mappedServiceIDs = this.ServiceCategoryMappingList
      .filter(m => m.CategoryID === categoryID)
      .map(m => m.ServiceID);

    // Step 2: Filter actual services
    this.FilteredServiceList = this.ServiceList
      .filter(service => mappedServiceIDs.includes(service.ServiceID));

  }

  getServiceName(serviceID: number): string {

    if (!this.ServiceList || this.ServiceList.length === 0) return '';

    const service = this.ServiceList.find(
      s => Number(s.ServiceID) === Number(serviceID)
    );

    if (!service || !service.Name) return 'Unknown Service';

    const parts = service.Name.split('/');

    if (this.language === 'Hindi') {
      return parts[1] ? parts[1].trim() : parts[0].trim();
    } else {
      return parts[0].trim();
    }
  }


  getCategoryNameByServiceID(serviceID: number): string {

    if (!this.ServiceCategoryMappingList?.length ||
      !this.ServiceCategoryList?.length) return '';

    // 1️⃣ Find mapping
    const mapping = this.ServiceCategoryMappingList.find(
      m => Number(m.ServiceID) === Number(serviceID)
    );

    if (!mapping) return '';

    // 2️⃣ Find category
    const category = this.ServiceCategoryList.find(
      c => Number(c.CategoryID) === Number(mapping.CategoryID)
    );

    if (!category) return '';

    // 3️⃣ Return based on language
    if (this.language === 'Hindi') {
      return category.CategoryName_HI || category.CategoryName || '';
    } else {
      return category.CategoryName || '';
    }
  }

  getLocationName(locationID: number): string {
    if (!this.LocationList || this.LocationList.length === 0) return '';

    const location = this.LocationList.find(
      l => Number(l.LocationID) === Number(locationID)
    );

    return location ? location.Name : 'Unknown Location';
  }

  // -----------------------------
  // Open Modal (Add Mode)
  // -----------------------------
  openModal() {
    this.isEditMode = false;
    this.selectedServiceIDs = [];

    this.panditServices = {
      PanditServiceID: 0,
      TenantID: this.userDetails.TenantID,
      ProfileID: this.userDetails.UserID,
      ServiceID: 0,
      LocationID: 0,
      Price: 0,
      IsActive: false,
      DateAdded: null,
      DateModified: null,
      UpdatedByUser: this.userDetails.UserID,
    };



    this.isModalOpen = true;
  }

  // -----------------------------
  // Close Modal
  // -----------------------------
  closeModal() {
    this.isModalOpen = false;
  }

  // -----------------------------
  // Edit Item
  // -----------------------------
  editItem(item: any) {
    this.isEditMode = true;

    this.selectedServiceIDs = [item.ServiceID];

    console.log(item)
    this.panditServices = {
      ...item,

    };

    this.isModalOpen = true;
  }


  // -----------------------------
  // Upload File (Optional)
  // -----------------------------
  uploadFile() {

    const refId = this.panditServices?.PanditServiceID;
    const file = this.selectedFile;

    if (!file || !refId) return;

    this.api.uploadImage(
      [file],
      'PanditServicesFiles',
      refId.toString(),
      'PanditServices'
    ).subscribe((res: any) => {

      if (res?.Status === 'Success') {
        this.selectedFile = null;



      }

    });
  }

  // -----------------------------
  // Prepare Payload
  // -----------------------------
  preparePayload() {
    return {
      panditServiceID: this.panditServices.PanditServiceID ? Number(this.panditServices.PanditServiceID) : 0,
      tenantID: Number(this.userDetails.TenantID),
      profileID: Number(this.userDetails.UserID),
      serviceID: this.panditServices.ServiceID ? Number(this.panditServices.ServiceID) : 0,
      locationID: this.panditServices.LocationID ? Number(this.panditServices.LocationID) : 0,
      price: this.panditServices.Price
        ? Math.round(Number(this.panditServices.Price) * 100) / 100
        : 0,
      isActive: Boolean(this.panditServices.IsActive),
      dateAdded: this.panditServices.DateAdded ? new Date(this.panditServices.DateAdded).toISOString() : new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: String(this.userDetails.UserID),
    };
  }

  // -----------------------------
  // Save (Insert / Update)
  // -----------------------------
  // save() {

  //   const payload = this.preparePayload();

  //   console.log(payload)

  //   const DBAction = this.isEditMode
  //     ? 'PanditServicesUpdate'
  //     : 'PanditServicesInsert';

  //   this.apinu.postUrlData(DBAction, payload)
  //     .subscribe((res: any) => {

  //       if (res?.PanditServiceID > 0) {

  //         alert("Saved successfully ✅");

  //         this.closeModal();
  //         this.loadList();

  //       } else {
  //         alert("Something went wrong ❌");
  //       }

  //     });
  // }

  save() {
    const DBAction = this.isEditMode
      ? 'PanditServicesUpdate'
      : 'PanditServicesInsert';

    if (this.isEditMode) {
      // Edit mode — single update as before
      const payload = this.preparePayload();
      this.apinu.postUrlData(DBAction, payload).subscribe((res: any) => {
        if (res?.PanditServiceID > 0) {
          this.showToast('Updated successfully ✅', 'success');
          this.closeModal();
          this.loadList();
        } else {
          this.showToast('Something went wrong ❌', 'danger');
        }
      });

    } else {
      // Add mode — insert one record per selected service
      if (!this.selectedServiceIDs.length) {
        this.showToast('Please select at least one service.', 'danger');
        return;
      }

      let completed = 0;
      let failed = 0;
      const total = this.selectedServiceIDs.length;

      this.selectedServiceIDs.forEach((serviceID) => {
        const payload = {
          panditServiceID: 0,
          tenantID: Number(this.userDetails.TenantID),
          profileID: Number(this.userDetails.UserID),
          serviceID: Number(serviceID),
          locationID: this.panditServices.LocationID ? Number(this.panditServices.LocationID) : 0,
          price: this.panditServices.Price
            ? Math.round(Number(this.panditServices.Price) * 100) / 100
            : 0,
          isActive: Boolean(this.panditServices.IsActive),
          dateAdded: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          updatedByUser: String(this.userDetails.UserID),
        };

        this.apinu.postUrlData('PanditServicesInsert', payload).subscribe({
          next: (res: any) => {
            if (res?.PanditServiceID > 0) {
              completed++;
            } else {
              failed++;
            }

            // When all done
            if (completed + failed === total) {
              if (failed === 0) {
                this.showToast(`${completed} service(s) saved successfully ✅`, 'success');
              } else {
                this.showToast(`${completed} saved, ${failed} failed ❌`, 'danger');
              }
              this.closeModal();
              this.loadList();
            }
          },
          error: () => {
            failed++;
            if (completed + failed === total) {
              this.showToast(`${completed} saved, ${failed} failed ❌`);
              this.closeModal();
              this.loadList();
            }
          }
        });
      });
    }
  }

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }


  // ─────────────────────────────────────────
  // REPLACE these old properties:
  //   isQuickLocationModalOpen, geonamesQuery, geonamesResults,
  //   isGeonamesLoading, selectedGeoname, quickLocationName
  //
  // WITH these new ones:
  // ─────────────────────────────────────────

  locationSearchQuery = '';
  combinedLocationResults: any[] = [];
  showLocationDropdown = false;
  isLocationSearching = false;
  private locationSearchDebounce: any;

  // ─────────────────────────────────────────
  // REPLACE these old methods:
  //   onAddLocation(), closeQuickAddLocation(),
  //   searchGeonames(), selectGeoname(), saveQuickLocation()
  //
  // WITH these new ones:
  // ─────────────────────────────────────────

  /** Called on every keystroke in the location input */
  // onLocationInput(event: any) {
  //   const query = (event.detail.value || '').trim();
  //   this.locationSearchQuery = event.detail.value || '';

  //   if (!query) {
  //     this.combinedLocationResults = [];
  //     this.showLocationDropdown = false;
  //     return;
  //   }

  //   this.showLocationDropdown = true;

  //   // ── 1. Filter already-saved locations instantly ──
  //   const existing = this.LocationList
  //     .filter(l => l.Name.toLowerCase().includes(query.toLowerCase()))
  //     .map(l => ({ type: 'existing', ...l }));

  //   this.combinedLocationResults = [...existing];

  //   // ── 2. Debounce GeoNames search ──
  //   clearTimeout(this.locationSearchDebounce);
  //   this.locationSearchDebounce = setTimeout(() => {
  //     this.fetchGeonamesInline(query);
  //   }, 450);
  // }

  /** Live GeoNames fetch merged into the same dropdown */
  fetchGeonamesInline(query: string) {
    this.isLocationSearching = true;

    const isPincode = /^\d{6}$/.test(query);
    const url = isPincode
      ? `https://secure.geonames.org/postalCodeSearchJSON?postalcode=${query}&country=IN&maxRows=6&username=nehul0402`
      : `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=6&username=nehul0402&style=MEDIUM&country=IN`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.isLocationSearching = false;

        let geoResults: any[] = [];

        if (isPincode) {
          geoResults = (data.postalCodes || []).map((p: any) => ({
            type: 'geonames',
            geonameId: `${p.postalCode}_${p.placeName}`,
            toponymName: p.placeName,
            name: p.placeName,
            adminName1: p.adminName1,
            adminName2: p.adminName2 || p.adminName3 || p.placeName,
            countryName: 'India',
            lat: p.lat,
            lng: p.lng,
            postalCode: p.postalCode,
          }));
        } else {
          geoResults = (data.geonames || []).map((g: any) => ({
            type: 'geonames',
            ...g
          }));
        }

        // Keep existing (saved) on top, GeoNames below
        const existing = this.combinedLocationResults.filter(r => r.type === 'existing');
        this.combinedLocationResults = [...existing, ...geoResults];
      },
      error: () => {
        this.isLocationSearching = false;
      }
    });
  }

  /** User picks a result from the dropdown */
  selectLocation(loc: any) {
    if (loc.type === 'existing') {
      // Already saved — just assign
      this.panditServices.LocationID = loc.LocationID;
      this.locationSearchQuery = loc.Name;
      this.showLocationDropdown = false;
    } else {
      // GeoNames result — create it first, then auto-select
      this.createAndSelectLocation(loc);
    }
  }

  /** Saves a GeoNames place to the DB, refreshes list, auto-selects */
  createAndSelectLocation(place: any) {
    const locationName = (place.toponymName || place.name || '').trim();

    const payload = {
      locationID: 0,
      tenantID: Number(this.userDetails.TenantID),
      userID: Number(this.userDetails.UserID),
      name: locationName,
      contactPerson: this.userDetails.FullName || '',
      contactPhone: String(this.userDetails.LoginID),
      contactEmail: '',
      addressLine1: '',
      addressLine2: '',
      city: place.adminName2 || place.name || '',
      pincode: place.postalCode || '',
      state: place.adminName1 || '',
      country: place.countryName || 'India',
      latitude: Number(place.lat) || 0,
      longitude: Number(place.lng) || 0,
      isActive: true,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: String(this.userDetails.UserID),
    };

    this.apinu.postUrlData('LocationsInsert', payload).subscribe((res: any) => {
      if (res?.LocationID > 0) {
        // Refresh LocationList then auto-select the new entry
        this.apinu
          .postUrlData(`LocationsNUSelectByQuery?Query=UserID=${this.userDetails.UserID}`, null)
          .subscribe((r: any) => {
            this.LocationList = r.LocationList;
            this.panditServices.LocationID = res.LocationID;
            this.locationSearchQuery = locationName;
            this.showLocationDropdown = false;
            this.showToast('Location saved & selected ✅', 'success');
          });
      } else {
        this.showToast('Could not save location ❌', 'danger');
      }
    });
  }

  /** Delay closing so click registers before blur hides the dropdown */
  onLocationBlur() {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 200);
  }

  /** Re-open dropdown when user taps back into the field */
  onLocationFocus() {
    if (this.locationSearchQuery.trim().length > 0) {
      this.showLocationDropdown = true;
    }
  }

  hasSavedResults(): boolean {
    return this.combinedLocationResults.some(r => r.type === 'existing');
  }

  hasGeoResults(): boolean {
    return this.combinedLocationResults.some(r => r.type === 'geonames');
  }

  // Add this property
  dropdownTop = '0px';

  // Update onLocationInput() — add position calculation
  onLocationInput(event: any) {
    const query = (event.detail.value || '').trim();
    this.locationSearchQuery = event.detail.value || '';

    // ── Calculate fixed position ──
    const inputEl = (event.target as HTMLElement).closest('.location-autocomplete-wrap');
    if (inputEl) {
      const rect = inputEl.getBoundingClientRect();
      this.dropdownTop = (rect.bottom + 4) + 'px';
    }

    if (!query) {
      this.combinedLocationResults = [];
      this.showLocationDropdown = false;
      return;
    }

    // ... rest of your existing code unchanged
    this.showLocationDropdown = true;
    const existing = this.LocationList
      .filter(l => l.Name.toLowerCase().includes(query.toLowerCase()))
      .map(l => ({ type: 'existing', ...l }));
    this.combinedLocationResults = [...existing];
    clearTimeout(this.locationSearchDebounce);
    this.locationSearchDebounce = setTimeout(() => {
      this.fetchGeonamesInline(query);
    }, 450);
  }
}