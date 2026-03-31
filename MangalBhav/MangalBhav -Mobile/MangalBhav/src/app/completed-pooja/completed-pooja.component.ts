import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, map, of } from 'rxjs';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';


@Component({
  selector: 'app-completed-pooja',
  templateUrl: './completed-pooja.component.html',
  styleUrls: ['./completed-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PanditjibottomtabsComponent]
})
export class CompletedPoojaComponent implements OnInit {
  userDetails: any;
  PanditServicesList: any;
  language: any;
  // Properties
  isUploadModalOpen = false;
  isPreviewOpen = false;
  isReviewsModalOpen = false;
 labels = {
  en: {
    appTitle: '✦ Mangal.Bhav ✦',
    pageTitle: 'Bookings',
    bannerSubCompleted: 'Completed',
    bannerTitle: 'Seva Bookings',

    requested: 'Requested',
    accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',

    yourServices: 'Your Services',
    bookings: 'Bookings',

    noBookings: 'No bookings yet for this service',

    uploadPhotos: 'Upload Photos',
    viewReviews: 'View Reviews',

    noServices: 'No Services Found',
    noServicesSub: 'Add services first to start receiving bookings',

    reviews: 'Reviews',
    loadingReviews: 'Loading reviews...',
    noReviews: 'No Reviews Yet',
    noReviewsSub: 'Be the first to review this seva',

    uploadTitle: 'Seva Photos',
    tapUpload: 'Tap to Upload Photo',
    imgSupport: 'JPG, PNG supported',
    uploadSelected: 'Upload Selected Photo',

    bookingPhotos: 'Booking Photos',
    noPhotos: 'No Photos Yet',
    noPhotosSub: 'Upload photos from this booking to preserve sacred memories'
  },

  hi: {

     
    pageTitle: 'बुकिंग्स',
    bannerSubCompleted: 'पूर्ण',
    bannerTitle: 'सेवा बुकिंग्स',
     appTitle: '✦ मंगल भाव ✦',

    requested: 'अनुरोधित',
    accepted: 'स्वीकृत',
    completed: 'पूर्ण',
    cancelled: 'रद्द',

    yourServices: 'आपकी सेवाएँ',
    bookings: 'बुकिंग्स',

    noBookings: 'इस सेवा के लिए अभी कोई बुकिंग नहीं है',

    uploadPhotos: 'फोटो अपलोड करें',
    viewReviews: 'रिव्यू देखें',

    noServices: 'कोई सेवा नहीं मिली',
    noServicesSub: 'बुकिंग प्राप्त करने के लिए पहले सेवा जोड़ें',

    reviews: 'रिव्यू',
    loadingReviews: 'रिव्यू लोड हो रहे हैं...',
    noReviews: 'अभी कोई रिव्यू नहीं',
    noReviewsSub: 'इस सेवा का पहला रिव्यू दें',

    uploadTitle: 'सेवा फोटो',
    tapUpload: 'फोटो अपलोड करने के लिए टैप करें',
    imgSupport: 'JPG, PNG समर्थित',
    uploadSelected: 'चयनित फोटो अपलोड करें',

    bookingPhotos: 'बुकिंग फोटो',
    noPhotos: 'अभी कोई फोटो नहीं',
    noPhotosSub: 'इस सेवा की यादों को सहेजने के लिए फोटो अपलोड करें'
  }
};
  selectedReviewItem: any = null;
  reviewsList: any[] = [];
  reviewsLoading = false;
  selectedFile: any = null;
  selectedBookingID: any = null;   // ← BookingID instead of ServiceID
  serviceImages: any[] = [];
  previewUrl = '';

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController,
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    this.language = await this.storage.get("Language");


    this.loadList();
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

    get t() {
  return this.language === 'Hindi'
    ? this.labels.hi
    : this.labels.en;
}


  loadList() {

    this.api.post(
      `PanditServicesSelectAllByProfileID?profileID=${this.userDetails.UserID}`,
      null
    ).pipe(

      concatMap((res: any) => {

        const panditServices = res?.PanditServiceList || [];
        if (!panditServices.length) return of([]);

        const serviceCalls = panditServices.map((service: any) => {

          // 🔹 Fetch Service & Location in parallel
          const service$ = this.api.post(
            `ServiceSelect?serviceID=${service.ServiceID}&tenantId=${service.TenantID}`,
            null
          );

          const location$ = this.api.post(
            `LocationSelect?locationID=${service.LocationID}&tenantID=${service.TenantID}`,
            null
          );

          const bookings$ = this.api.post(
            `BookingsSelectByQuery?Query=panditServiceID=${service.PanditServiceID} and Status = 'COMPLETED'`,
            null
          );

          return forkJoin({
            serviceRes: service$,
            locationRes: location$,
            bookingRes: bookings$
          }).pipe(

            concatMap((combined: any) => {

              const serviceObj = combined.serviceRes?.ServiceList?.[0] || null;
              const locationObj = combined.locationRes?.LocationList?.[0] || null;
              const bookings = combined.bookingRes?.BookingList || [];

              if (!bookings.length) {
                return of({
                  ...service,
                  Service: serviceObj,
                  Location: locationObj,
                  Bookings: []
                });
              }

              // 🔥 Enrich each booking with BhaktProfile
              const bookingCalls = bookings.map((booking: any) => {

                return this.api.post(
                  `ProfilesSelectAllByUserID?userID=${booking.BhaktProfileID}`,
                  null
                ).pipe(

                  map((profileRes: any) => {

                    const profileObj = profileRes?.ProfileList?.[0] || null;

                    return {
                      ...booking,
                      BhaktProfile: profileObj
                    };

                  })

                );

              });

              return forkJoin(bookingCalls).pipe(

                map((enrichedBookings: any) => {

                  return {
                    ...service,
                    Service: serviceObj,
                    Location: locationObj,
                    Bookings: enrichedBookings
                  };

                })

              );

            })

          );

        });

        return forkJoin(serviceCalls);

      })

    ).subscribe({

      next: (finalList: any) => {
        console.log('🔥 Final Fully Enriched List:', finalList);
        this.PanditServicesList = finalList;
      },

      error: (err) => {
        console.error('Error loading data:', err);
      }

    });

  }


  getLocalizedText(text: string): string {

    if (!text) return '';

    const parts = text.split('/');

    if (this.language === 'Hindi') {
      return parts[1] ? parts[1].trim() : parts[0].trim();
    } else {
      return parts[0].trim();
    }
  }

  expandedIndex: number | null = null;

  toggleService(index: number) {
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else {
      this.expandedIndex = index;
    }
  }
  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};

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

  // Returns CSS class for booking status badge
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'status-requested';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-requested';
    }
  }

  // Returns CSS class for payment pill
  getPaymentClass(paymentStatus: string): string {
    switch (paymentStatus?.toUpperCase()) {
      case 'PAID': return 'payment-paid';
      case 'PENDING': return 'payment-pending';
      default: return '';
    }
  }
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



  // Open modal with booking
  uploadBookingPhotos(booking: any) {
    this.selectedBookingID = booking.BookingID;  // adjust field name if different
    this.isUploadModalOpen = true;
    this.getBookingPhotos();
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
    this.selectedFile = null;
    this.serviceImages = [];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.api.uploadImage(
      [this.selectedFile],
      'BookingPhoto',              // ← DocumentType for bookings
      String(this.selectedBookingID),
      'BookingPhoto'
    ).subscribe((res: any) => {
      if (res.Status === 'Success') {
        const body = {
          TenantID: Number(this.userDetails.TenantID),
          DocumentType: 'BookingPhoto',      // ← different from service
          EntityType: 'BookingPhoto',
          EntityRefKey: Number(this.selectedBookingID),
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

        this.api.post('DocumentInsert', body).subscribe(() => {
          this.selectedFile = null;
          alert('Success');
          this.getBookingPhotos();   // ← refresh gallery after upload
        });
      }
    });
  }

  // ← renamed from getServicePhotos, queries by BookingID
  getBookingPhotos() {
    const query = `DocumentType = 'BookingPhoto' and EntityType = 'BookingPhoto' and EntityRefKey = ${this.selectedBookingID}`;

    this.api.post(`DocumentSelectByQuery?Query=${query}`, null).subscribe({
      next: (res: any) => {
        const documentList = res?.DocumentList || [];

        if (!documentList.length) {
          this.serviceImages = [];
          return;
        }

        const imageRequests = documentList.map((doc: any) =>
          this.api.getImage('DownloadImages', {
            imageName: doc.FileName,
            imagePurpose: 'BookingPhoto'
          })
        );

        forkJoin(imageRequests).subscribe({
          next: (responses: any) => {
            this.serviceImages = responses.map((blob: any, index: number) => ({
              fileName: documentList[index].FileName,
              imageUrl: blob?.type?.startsWith('image/')
                ? URL.createObjectURL(blob)
                : 'assets/uploadfile.png'
            }));
          },
          error: (err) => console.error('Error loading images:', err)
        });
      },
      error: (err) => console.error('Error fetching documents:', err)
    });
  }

  previewPhoto(photo: any) {
    this.previewUrl = photo.imageUrl;
    this.isPreviewOpen = true;
  }



  viewFeedback(booking: any) {
    this.selectedReviewItem = booking;
    this.isReviewsModalOpen = true;
    this.loadReviews(booking);
  }

  loadReviews(booking: any) {
    this.reviewsLoading = true;
    this.reviewsList = [];

    this.api.post(`FeedbackSelectByQuery?Query=BookingID=${booking.BookingID}`, null)
      .subscribe((res: any) => {
        this.reviewsList = res?.FeedbackList || [];
        this.reviewsLoading = false;
        console.log('Reviews:', this.reviewsList);
      });
  }

  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }
}
