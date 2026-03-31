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
  selector: 'app-jajman-completed-pooja',
  templateUrl: './jajman-completed-pooja.component.html',
  styleUrls: ['./jajman-completed-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PanditjibottomtabsComponent]
})
export class JajmanCompletedPoojaComponent implements OnInit {

  userDetails: any;
  isEditMode = false;
  isModalOpen = false;
  // Properties
  // Properties
  isFeedbackModalOpen = false;
  selectedFeedbackItem: any = null;
  feedbackRating: number = 0;
  feedbackDescription: string = '';
  isUploadModalOpen = false;
  isPreviewOpen = false;
  selectedFile: any = null;
  selectedBookingID: any = null;
  serviceImages: any[] = [];
  previewUrl = '';
  feedbackLoading = false;
  existingFeedback: any = null;
  bookings: any = {
    BookingID: 0,
    TenantID: 0,
    PanditServiceID: 0,
    BhaktProfileID: 0,
    Status: '',
    TotalAmount: 0,
    PaymentStatus: '',
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };

  BookingsList: any[] = [];

  // selectedFile: any = null;
  Language: any;
  language: any;

  labels = {
    en: {
       appTitle: '✦ Mangal.Bhav ✦',
      pageTitle: 'My Bookings',
      bannerSub: 'Track Your',
      bannerTitle: 'Seva Journey',

      all: 'All',
      requested: 'Requested',
      confirmed: 'Confirmed',
      completed: 'Completed',

      completedBookings: 'Completed Bookings',

      dakshina: 'Dakshina',
      mins: 'mins',

      payment: 'Payment',
      paid: 'Paid',
      pending: 'Pending',

      makePayment: 'Make Payment',
      uploadPhoto: 'Upload Photo',
      feedback: 'Feedback',

      noBookings: 'No Bookings Yet',
      noBookingsSub: 'Book a puja to see your seva journey here',

      explore: 'Explore Life',
      me: 'Me',

      // Feedback modal
      rateExperience: 'Rate Your Experience',
      checkingFeedback: 'Checking feedback...',
      feedbackSubmitted: 'Feedback Submitted',
      submittedOn: 'Submitted on',

      rateQuestion: 'How would you rate this seva?',
      shareExperience: 'Share your experience',
      feedbackPlaceholder: 'Tell us about your experience with the pandit and seva...',
      submitFeedback: 'Submit Feedback',

      // Upload modal
      sevaPhotos: 'Seva Photos',
      tapUpload: 'Tap to Upload Photo',
      imgSupport: 'JPG, PNG supported',
      uploadSelected: 'Upload Selected Photo',

      bookingPhotos: 'Booking Photos',
      noPhotos: 'No Photos Yet',
      noPhotosSub: 'Preserve the memories of this sacred seva',
      status_requested: '⏳ Awaiting Pandit Ji',
      status_confirmed: '✅ Pandit Ji Confirmed',
      status_cancelled: '❌ Cancelled',
      status_completed: '🪔 Seva Completed',
      status_progress: '📿 In Progress'
    },

    hi: {
      pageTitle: 'मेरी बुकिंग्स',

        appTitle: '✦ मंगल भाव ✦',
      bannerSub: 'ट्रैक करें',
      bannerTitle: 'सेवा यात्रा',
      status_requested: '⏳ पंडित जी की प्रतीक्षा',
      status_confirmed: '✅ पंडित जी ने पुष्टि की',
      status_cancelled: '❌ रद्द',
      status_completed: '🪔 सेवा पूर्ण',
      status_progress: '📿 प्रगति में',

      all: 'सभी',
      requested: 'अनुरोधित',
      confirmed: 'पुष्ट',
      completed: 'पूर्ण',

      completedBookings: 'पूर्ण बुकिंग्स',

      dakshina: 'दक्षिणा',
      mins: 'मिनट',

      payment: 'भुगतान',
      paid: 'भुगतान किया गया',
      pending: 'लंबित',

      makePayment: 'भुगतान करें',
      uploadPhoto: 'फोटो अपलोड करें',
      feedback: 'फीडबैक',

      noBookings: 'अभी कोई बुकिंग नहीं',
      noBookingsSub: 'अपनी सेवा यात्रा देखने के लिए पूजा बुक करें',

      explore: 'जीवन देखें',
      me: 'मैं',

      // Feedback modal
      rateExperience: 'अपने अनुभव को रेट करें',
      checkingFeedback: 'फीडबैक जांच रहे हैं...',
      feedbackSubmitted: 'फीडबैक सबमिट हो चुका है',
      submittedOn: 'सबमिट किया गया',

      rateQuestion: 'आप इस सेवा को कैसे रेट करेंगे?',
      shareExperience: 'अपना अनुभव साझा करें',
      feedbackPlaceholder: 'पंडित और सेवा के बारे में अपना अनुभव बताएं...',
      submitFeedback: 'फीडबैक सबमिट करें',

      // Upload modal
      sevaPhotos: 'सेवा फोटो',
      tapUpload: 'फोटो अपलोड करने के लिए टैप करें',
      imgSupport: 'JPG, PNG समर्थित',
      uploadSelected: 'चयनित फोटो अपलोड करें',

      bookingPhotos: 'बुकिंग फोटो',
      noPhotos: 'अभी कोई फोटो नहीं',
      noPhotosSub: 'इस सेवा की यादों को सहेजें'
    }
  };

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    this.language = this.userDetails.Languages;



    this.loadList();
  }

  // Add these methods to your BookingComponent class:

  getCardClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'card-requested';
      case 'CONFIRMED': return 'card-confirmed';
      case 'CANCELLED': return 'card-cancelled';
      case 'COMPLETED': return 'card-completed';
      default: return 'card-requested';
    }
  }

  getStripClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'strip-requested';
      case 'CONFIRMED': return 'strip-confirmed';
      case 'CANCELLED': return 'strip-cancelled';
      case 'COMPLETED': return 'strip-completed';
      default: return 'strip-requested';
    }
  }


    get t() {
  return this.language === 'Hindi'
    ? this.labels.hi
    : this.labels.en;
}
  getStatusEmoji(status: string): string {
  const key = status?.toUpperCase();

  switch (key) {
    case 'REQUESTED': return this.t.status_requested;
    case 'CONFIRMED': return this.t.status_confirmed;
    case 'CANCELLED': return this.t.status_cancelled;
    case 'COMPLETED': return this.t.status_completed;
    default: return this.t.status_progress;
  }
}
  // -----------------------------
  // Load List
  // -----------------------------


  loadList() {

    this.api.post(
      `BookingsSelectByQuery?Query=BhaktProfileID=${this.userDetails.UserID} and Status = 'COMPLETED'`,
      null
    ).pipe(

      concatMap((bookingRes: any) => {

        const bookings = bookingRes?.BookingList || [];
        if (!bookings.length) return of([]);

        // Create API call for each booking
        const bookingCalls = bookings.map((booking: any) => {

          return this.api.post(
            `PanditServiceSelect?panditServiceID=${booking.PanditServiceID}&tenantID=${this.userDetails.TenantID}`,
            null
          ).pipe(

            concatMap((psRes: any) => {

              const panditService = psRes?.PanditServiceList?.[0];
              if (!panditService) return of({ ...booking });

              const service$ = this.api.post(
                `ServiceSelect?serviceID=${panditService.ServiceID}&tenantId=${panditService.TenantID}`,
                null
              );

              const location$ = this.api.post(
                `LocationSelect?locationID=${panditService.LocationID}&tenantID=${panditService.TenantID}`,
                null
              );

              const user$ = this.api.post(
                `ProfilesSelectAllByUserID?userId=${panditService.ProfileID}`,
                null
              );

              return forkJoin({
                serviceRes: service$,
                locationRes: location$,
                userRes: user$
              }).pipe(

                map((extra: any) => {

                  const serviceObj = extra.serviceRes?.ServiceList?.[0] || null;
                  const locationObj = extra.locationRes?.LocationList?.[0] || null;
                  const userObj = extra.userRes?.ProfileList?.[0] || null;

                  return {
                    ...booking,
                    PanditService: panditService,
                    Service: serviceObj,
                    Location: locationObj,
                    Profile: userObj
                  };

                })

              );

            })

          );

        });

        // Execute all booking calls in parallel
        return forkJoin(bookingCalls);

      })

    ).subscribe({

      next: (finalList: any) => {
        this.BookingsList = finalList;
        console.log('Final Enriched Bookings:', this.BookingsList);
      },

      error: (err) => {
        console.error('Error loading data:', err);
      }

    });

  }
  // -----------------------------
  // Open Modal (Add Mode)
  // -----------------------------
  openModal() {
    this.isEditMode = false;

    this.bookings = {
      BookingID: 0,
      TenantID: 0,
      PanditServiceID: 0,
      BhaktProfileID: 0,
      Status: '',
      TotalAmount: 0,
      PaymentStatus: '',
      DateAdded: null,
      DateModified: null,
      UpdatedByUser: '',
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

    this.bookings = {
      ...item,

    };

    this.isModalOpen = true;
  }

  // -----------------------------
  // File Selection
  // -----------------------------
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  // -----------------------------
  // Upload File (Optional)
  // -----------------------------
  uploadFile() {

    const refId = this.bookings?.BookingID;
    const file = this.selectedFile;

    if (!file || !refId) return;

    this.api.uploadImage(
      [file],
      'BookingsFiles',
      refId.toString(),
      'Bookings'
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
      tenantID: this.bookings.TenantID ? Number(this.bookings.TenantID) : 0,
      panditServiceID: this.bookings.PanditServiceID ? Number(this.bookings.PanditServiceID) : 0,
      bhaktProfileID: this.bookings.BhaktProfileID ? Number(this.bookings.BhaktProfileID) : 0,
      status: this.bookings.Status || '',
      totalAmount: this.bookings.TotalAmount ? Number(this.bookings.TotalAmount) : 0,
      paymentStatus: this.bookings.PaymentStatus || '',
      dateAdded: this.bookings.DateAdded ? new Date(this.bookings.DateAdded).toISOString() : null,
      dateModified: this.bookings.DateModified ? new Date(this.bookings.DateModified).toISOString() : null,
      updatedByUser: this.bookings.UpdatedByUser || '',
    };
  }

  // -----------------------------
  // Save (Insert / Update)
  // -----------------------------
  save() {

    const payload = this.preparePayload();

    const DBAction = this.isEditMode
      ? 'BookingsUpdate'
      : 'BookingsInsert';

    this.api.post(DBAction, payload)
      .subscribe((res: any) => {

        if (res?.BookingID > 0) {

          alert("Saved successfully ✅");

          this.closeModal();
          this.loadList();

        } else {
          alert("Something went wrong ❌");
        }

      });
  }

  makePayment(item: any) {
    // TODO: integrate payment gateway
  }

  uploadPhoto(item: any) {
    this.selectedBookingID = item.BookingID; // adjust field name if different
    this.isUploadModalOpen = true;
    this.getBookingPhotos();
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
    this.selectedFile = null;
    this.serviceImages = [];
  }

  // onFileSelected(event: any) {
  //   this.selectedFile = event.target.files[0];
  // }

  uploadImage() {
    if (!this.selectedFile) return;

    this.api.uploadImage(
      [this.selectedFile],
      'BookingPhoto',
      String(this.selectedBookingID),
      'BookingPhoto'
    ).subscribe((res: any) => {
      if (res.Status === 'Success') {
        const body = {
          TenantID: Number(this.userDetails.TenantID),
          DocumentType: 'BookingPhoto',
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
          alert('Success');
          this.selectedFile = null;
          this.getBookingPhotos(); // refresh gallery
        });
      }
    });
  }

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

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default.jpg';
    img.onerror = null;
  }

  // giveFeedback(item: any) {
  //   // TODO: open feedback modal
  // }

  giveFeedback(item: any) {
    this.selectedFeedbackItem = item;
    this.feedbackRating = 0;
    this.feedbackDescription = '';
    this.existingFeedback = null;
    this.isFeedbackModalOpen = true;
    this.checkExistingFeedback(item);
  }

  checkExistingFeedback(item: any) {
    this.feedbackLoading = true;
    this.api.post(`FeedbackSelectByQuery?Query=BookingID=${item.BookingID}`, null)
      .subscribe((res: any) => {
        const list = res?.FeedbackList || [];
        this.existingFeedback = list.length > 0 ? list[0] : null;
        console.log('Existing Feedback:', this.existingFeedback); // ← check exact field name
        this.feedbackLoading = false;
      });
  }

  isStarFilled(star: number): boolean {
    const rating = Number(this.existingFeedback?.Ratings || 0);
    return rating >= star;
  }
  getExistingRatingLabel(): string {
    switch (Number(this.existingFeedback?.Ratings)) {
      case 1: return '😞 Poor';
      case 2: return '😐 Fair';
      case 3: return '🙂 Good';
      case 4: return '😊 Very Good';
      case 5: return '🤩 Excellent!';
      default: return '';
    }
  }
  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  getRatingLabel(): string {
    switch (this.feedbackRating) {
      case 1: return '😞 Poor';
      case 2: return '😐 Fair';
      case 3: return '🙂 Good';
      case 4: return '😊 Very Good';
      case 5: return '🤩 Excellent!';
      default: return 'Tap a star to rate';
    }
  }

  submitFeedback() {
    if (this.feedbackRating === 0) return;

    const payload = {
      BookingID: this.selectedFeedbackItem.BookingID,
      TenantID: Number(1),
      Ratings: Number(this.feedbackRating),
      Description: this.feedbackDescription,
      DateAdded: new Date().toISOString(),
      DateModified: new Date().toISOString(),
      UpdatedByUser: this.userDetails.LoginID,
    };

    console.log('Feedback payload:', payload);

    // Call your API here
    this.api.post(`FeedbackInsert`, payload).subscribe((res: any) => {
      console.log(res)
    })

    alert('🙏 Thank you for your feedback!');
    this.isFeedbackModalOpen = false;
  }
}
