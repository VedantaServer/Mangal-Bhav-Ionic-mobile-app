import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, elementAt, forkJoin, map, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-book-pooja',
  templateUrl: './book-pooja.component.html',
  styleUrls: ['./book-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule,PanditjibottomtabsComponent]
})
export class BookPoojaComponent implements OnInit {
  userDetails: any;
  PanditServiceList: any;
  searchQuery: string = '';
  isScannerOpen = false;
  scannedQrData: string | null = null;
  PanditServicesList: any;
  formats = [BarcodeFormat.QR_CODE];
  // Properties
  isPhotosModalOpen = false;
  isPreviewOpen = false;
  serviceImages: any[] = [];
  previewUrl = '';
  photosLoading = false;
  viewingServiceName = '';
  viewingServiceID: any = null;
  selectedBooking: any = null;
  isBookingModalOpen = false;
  BookingDate: any;
  minDate: string = new Date().toISOString();
  bookings: any = {
    BookingID: 0,
    TenantID: 0,
    PanditServiceID: 0,
    BhaktProfileID: 0,
    Status: '',
    TotalAmount: 0,
    PaymentStatus: '',
    PoojaDate: null,
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };
  Language: any;
  paramID: any;
  query!: string;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  pendingServiceID: any;
  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage, private route: ActivatedRoute,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }



   openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  
  async ngOnInit() {

    this.route.queryParams.subscribe(params => {
      console.log('Received ID:', params['id']);
      this.paramID = params['id'];
    });





    this.userDetails = await this.storage.get("account");
    this.Language = await this.storage.get("Language");

    if (this.paramID > 0) {

      await this.storage.remove('pendingPanditServiceID');
      this.query = `PanditServiceSelect?panditServiceID=${this.paramID}&tenantID=${this.userDetails.TenantID}`
      this.loadList();
    } else if (this.paramID == -1) {
      const rawUserID = await this.storage.get('pendingPanditUserID');
      const rawServiceID = await this.storage.get('pendingServiceID');
      this.pendingPanditCategoryID = await this.storage.get('pendingPanditCategoryID');

      console.log('rawUserID:', rawUserID);
      console.log('rawServiceID:', rawServiceID);

      this.pendingPanditUserID = rawUserID ? Number(rawUserID) : null;
      this.pendingServiceID = rawServiceID ? Number(rawServiceID) : null;

      if (this.pendingPanditUserID && this.pendingServiceID) {
        await this.storage.remove('pendingPanditUserID');
        await this.storage.remove('pendingPanditCategoryID');
        await this.storage.remove('pendingPanditServiceID');
        await this.storage.remove('pendingServiceID')
        this.query = `PanditServicesNUSelectByQuery?Query=ProfileId=${this.pendingPanditUserID} AND ServiceID=${this.pendingServiceID}`;
        console.log('Query:', this.query);
        this.loadList();
      } else {
        console.log('Missing values — UserID:', this.pendingPanditUserID, 'ServiceID:', this.pendingServiceID);
      }
    }

    else {
      this.query = `PanditServiceSelectAll?tenantID=${this.userDetails.TenantID}`;
      this.loadList();
    }
    // alert(this.Language)

    // this.api.post(`PanditServiceSelectAll?tenantID=${this.userDetails.TenantID}`,null)
    // .subscribe((res:any)=>{
    //   console.log(res.PanditServiceList)
    //   this.PanditServiceList = res.PanditServiceList;
    // })

  }

  bookingCountMap: { [key: string]: number } = {};

  // Call this after PanditServicesList is set
  loadAllBookingCounts() {
    this.PanditServicesList.forEach((item: any) => {
      this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${item.PanditServiceID}`, null)
        .subscribe((res: any) => {
          this.bookingCountMap[String(item.PanditServiceID)] = res.BookingList?.length || 0;
          console.log(`Service ${item.PanditServiceID} count:`, this.bookingCountMap[String(item.PanditServiceID)]);
        });
    });
  }

  // Call this once for each item after list loads
  loadBookingCount(panditServiceID: any) {
    const key = String(panditServiceID);
    if (this.bookingCountMap[key] !== undefined) return; // already loaded

    this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${panditServiceID}`, null)
      .subscribe((res: any) => {
        this.bookingCountMap[key] = res.BookingList?.length || 0;
        console.log(`Service ${panditServiceID} count:`, this.bookingCountMap[key]);
      });
  }

  // Called from HTML
  getBookingCount(panditServiceID: any): number {
    const key = String(panditServiceID);
    // Trigger load if not yet loaded
    if (this.bookingCountMap[key] === undefined) {
      this.bookingCountMap[key] = 0; // prevent multiple calls
      this.loadBookingCount(panditServiceID);
    }
    return this.bookingCountMap[key];
  }

  loadList() {
    //alert('bjhhvgh')

    this.api.post(
      this.query,
      null
    ).pipe(

      concatMap((res: any) => {

        const list = res?.PanditServiceList || [];

        if (!list.length) return of([]);

        // Create forkJoin call for each item
        const enrichedCalls = list.map((item: any) => {

          const service$ = this.api.post(
            `ServiceSelect?serviceID=${item.ServiceID}&tenantId=${item.TenantID}`,
            null
          );

          const location$ = this.api.post(
            `LocationSelect?locationID=${item.LocationID}&tenantID=${item.TenantID}`,
            null
          );

          const user$ = this.api.post(
            `ProfilesSelectAllByUserID?userId=${item.ProfileID}`,
            null
          );

          return forkJoin({
            serviceRes: service$,
            locationRes: location$,
            userRes: user$
          }).pipe(

            map((extra: any) => {

              const service = extra.serviceRes?.ServiceList?.[0];
              const location = extra.locationRes?.LocationList?.[0];
              const user = extra.userRes?.ProfileList?.[0];

              return {
                ...item,
                ServiceName: service ? service.Name : '',
                ServiceDescription: service ? service.Description : '',
                LocationName: location ? location.Name : '',
                UserName: user ? user.FullName : ''
              };

            })

          );

        });

        return forkJoin(enrichedCalls);

      })

    ).subscribe({

      next: (finalList: any) => {
        this.PanditServicesList = finalList;
        this.loadAllBookingCounts();
        console.log('Final Enriched List:', this.PanditServicesList);
      },

      error: (err) => {
        console.error('Error loading data:', err);
      }

    });

  }


  bookNow(item: any) {
    console.log(item)
    this.selectedBooking = item;
    console.log(this.selectedBooking)
    this.isBookingModalOpen = true;
  }

  confirmBooking() {


    // 🔥 Simple confirmation alert
    var date = this.BookingDate.split('T')[0];

    const isConfirmed = confirm(
      "Please confirm your booking:\n\n" +
      "🪔 Service: " + this.selectedBooking?.ServiceName + "\n" +
      "📍 Location: " + this.selectedBooking?.LocationName + "\n" +
      "📅 Date: " + date + "\n" +
      "💰 Amount: ₹ " + this.selectedBooking?.Price + "\n\n" +
      "Do you want to proceed?"
    );

    if (!isConfirmed) {
      return;
    }

    const payload = this.preparePayload();
    console.log(payload)

    date = this.BookingDate.split('T')[0]; // YYYY-MM-DD

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    this.api.post(`BookingsSelectByQuery?Query=PanditServiceID=${payload.panditServiceID} AND BhaktProfileID=${payload.bhaktProfileID} AND PoojaDate >= '${date}' AND PoojaDate < '${nextDateStr}'`,
      null
    )
      .subscribe((res: any) => {
        console.log(res.BookingList.length > 0);
        if (res.BookingList.length > 0) {
          alert('You have already booked');
        } else {
          const DBAction = 'BookingsInsert';
          this.api.post(DBAction, payload)
            .subscribe((res: any) => {
              if (res?.BookingID > 0) {
                alert('Booking Confirmed 🎉');
                this.isBookingModalOpen = false;
                //this.loadList();



                setTimeout(() => {
                  this.routerCtrl.navigateForward('/booking');
                }, 400); // delay in milliseconds
              } else {
                alert("Something went wrong ❌");
              }
            });
        }
      })
  }



  preparePayload() {
    return {
      bookingID: 0,
      tenantID: this.userDetails.TenantID,
      panditServiceID: this.selectedBooking.PanditServiceID ? Number(this.selectedBooking.PanditServiceID) : 0,
      bhaktProfileID: this.userDetails.UserID,
      status: 'REQUESTED',
      totalAmount: this.selectedBooking.Price
        ? Math.round(Number(this.selectedBooking.Price) * 100) / 100
        : 0,
      paymentStatus: 'PENDING',
      poojaDate: new Date(this.BookingDate).toISOString(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: String(this.userDetails.UserID) || '',
    };
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


  viewServicePhotos(item: any) {
    // alert(item.PanditServiceID)
    this.viewingServiceID = item.PanditServiceID;  // adjust field if needed
    this.viewingServiceName = item.ServiceName?.split('/')[0]?.trim() || item.ServiceName;
    this.isPhotosModalOpen = true;
    this.loadServicePhotos();
  }

  closePhotosModal() {
    this.isPhotosModalOpen = false;
    this.serviceImages = [];
    this.viewingServiceID = null;
    this.viewingServiceName = '';
  }

  loadServicePhotos() {
    this.photosLoading = true;
    this.serviceImages = [];

    const query = `DocumentType = 'PanditService' and EntityType = 'PanditService' and EntityRefKey = ${this.viewingServiceID}`;

    this.api.post(`DocumentSelectByQuery?Query=${query}`, null).subscribe({
      next: (res: any) => {
        const documentList = res?.DocumentList || [];

        if (!documentList.length) {
          this.serviceImages = [];
          this.photosLoading = false;
          return;
        }

        const imageRequests = documentList.map((doc: any) =>
          this.api.getImage('DownloadImages', {
            imageName: doc.FileName,
            imagePurpose: 'PanditService'
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
            this.photosLoading = false;
          },
          error: (err) => {
            console.error('Error loading images:', err);
            this.photosLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
        this.photosLoading = false;
      }
    });
  }

  previewPhoto(photo: any) {
    this.previewUrl = photo.imageUrl;
    this.isPreviewOpen = true;
  }

  isExploreModalOpen = false;





  openQrScanner() {
    this.isScannerOpen = true;
  }

  closeQrScanner() {
    this.isScannerOpen = false;
  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;

    // Parse "panditserviceid=2" → 2
    const match = result.toLowerCase().match(/panditserviceid=(\d+)/);

    if (match) {
      const serviceId = Number(match[1]);
      this.PanditServicesList = this.PanditServicesList.filter(
        (item: any) => item.PanditServiceID === serviceId
      );
    }

    console.log('Scanned QR:', this.scannedQrData);
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
  }

}
