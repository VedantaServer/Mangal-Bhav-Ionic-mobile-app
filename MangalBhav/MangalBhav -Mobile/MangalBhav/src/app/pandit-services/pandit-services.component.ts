import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';


@Component({
  selector: 'app-pandit-services',
  templateUrl: './pandit-services.component.html',
  styleUrls: ['./pandit-services.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent,PanditjibottomtabsComponent]
})
export class PanditServicesComponent implements OnInit {

  userDetails: any;
  isUploadModalOpen = false;
  selectedServiceID: number | null = null;

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
      category: '📂 Category',
      service: '🪔 Service',
      location: '📍 Location',
      price: '💰 Price',
      status: '⚙ Status',
      active: 'Active',
      inactive: 'Inactive'
    },
    hi: {
      serviceTitle: '🪔 सेवा',
      category: '📂 श्रेणी',
      service: '🪔 सेवा',
      location: '📍 स्थान',
      price: '💰 मूल्य',
      status: '⚙ स्थिति',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय'
    }
  };

  PanditServicesList: any[] = [];

  LocationList: any[] = [];
  // selectedFile: any = null;
  language!: any;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform, private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

onAddLocation() {
  this.closeModal();

  setTimeout(() => {
    this.routerCtrl.navigateForward('/location');
  }, 300); // delay in milliseconds
}


  async ngOnInit() {
    this.userDetails = await this.storage.get("account");

    this.language = await this.storage.get("Language");

    // alert(this.language)
    // 1. Categories
    this.api.post(`ServiceCategorySelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceCategoryList = res.ServiceCategoryList;
      });

    // 2. Mapping
    this.api.post(`ServiceCategoryMappingSelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceCategoryMappingList = res.ServiceCategoryMappingList;
      });

    // 3. Services
    this.api.post(`ServiceSelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {
        this.ServiceList = res.ServiceList;
      });

    this.api.post(`LocationsNUSelectByQuery?Query=UserID=${this.userDetails.UserID}`, null)
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
    this.api.post(
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
          this.api.post(`DocumentInsert`, body).subscribe((resp: any) => {
            alert('Success');
            this.selectedFile = null;
          })
        }
      })

    console.log('Uploading image...');

  }


  getServicePhotos() {

    const query = `DocumentType = 'PanditService' and EntityType = 'PanditService' and EntityRefKey = ${this.selectedServiceID}`;

    this.api.post(`DocumentSelectByQuery?Query=${query}`, null).subscribe({
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

      error: (err) => {
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
      `assets/img/${cleanName}.jfif`,
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
  save() {

    const payload = this.preparePayload();

    console.log(payload)

    const DBAction = this.isEditMode
      ? 'PanditServicesUpdate'
      : 'PanditServicesInsert';

    this.api.post(DBAction, payload)
      .subscribe((res: any) => {

        if (res?.PanditServiceID > 0) {

          alert("Saved successfully ✅");

          this.closeModal();
          this.loadList();

        } else {
          alert("Something went wrong ❌");
        }

      });
  }

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }
}