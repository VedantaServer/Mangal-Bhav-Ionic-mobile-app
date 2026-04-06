import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, map, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { GoogleGenAI } from "@google/genai";

@Component({
  selector: 'app-top-rated',
  templateUrl: './top-rated.component.html',
  styleUrls: ['./top-rated.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule]
})
export class TopRatedComponent implements OnInit {

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
  aiLoaded = false;
  pendingPanditCategoryID: any;

  // ✅ Store serviceCount as class property so loadList() can access it
  serviceCount: any = {};
  ai!: GoogleGenAI;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private route: ActivatedRoute,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }



  async ngOnInit() {



    // this.api.post(`GenerateGeminiResponse?prompt=What is diwali in indian festival ?`,null)
    // .subscribe((res:any)=>{
    //   console.log(res)
    // })
    // const apiKey = "AIzaSyDhLExOhoZa9db7TusLGslbp-Ds-mTRlj8";

    // this.ai = new GoogleGenAI({ apiKey });


   // this.askGemini('what is satyanarayan katha in indian festival');

    this.userDetails = await this.storage.get("account");
    this.Language = await this.storage.get("Language");

    this.api.post(`BookingSelectAll?tenantID=${this.userDetails.TenantID}`, null)
      .subscribe((res: any) => {

        const bookings = res.BookingList;

        // ✅ Build serviceCount — keyed by PanditServiceID (as string)
        this.serviceCount = {};

        bookings.forEach((b: any) => {
          const id = String(b.PanditServiceID);
          if (this.serviceCount[id]) {
            this.serviceCount[id]++;
          } else {
            this.serviceCount[id] = 1;
          }
        });

        // Convert to array and sort by count
        const topServices = Object.entries(this.serviceCount)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 2)
          .map((x: any) => x[0]);

        console.log("Top 2 Services:", topServices);
        console.log("Service Count Map:", this.serviceCount);

        if (topServices.length === 0) {
          this.query = `PanditServiceSelectAll?tenantID=1`;
        } else {
          this.query = `PanditServicesNUSelectByQuery?Query=PanditServiceID in (${topServices.join(',')})`;
        }

        this.loadList();
      });
  }


  // async askGemini(prompt: string) {

  //   try {

  //     const result = await this.ai.models.generateContent({

  //       model: "gemini-2.0-flash",

  //       contents: prompt

  //     });

  //     const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  //     return text;

  //   } catch (error) {

  //     console.error("Gemini error:", error);

  //     return "AI failed to respond.";

  //   }

  // }


  loadList() {
    this.api.post(this.query, null).pipe(

      concatMap((res: any) => {

        const list = res?.PanditServiceList || [];

        if (!list.length) return of([]);

        const enrichedCalls = list.map((item: any) => {

          const service$ = this.api.post(
            `ServiceSelect?serviceID=${item.ServiceID}&tenantId=${item.TenantID}`, null
          );

          const location$ = this.api.post(
            `LocationSelect?locationID=${item.LocationID}&tenantID=${item.TenantID}`, null
          );

          const user$ = this.api.post(
            `ProfilesSelectAllByUserID?userId=${item.ProfileID}`, null
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

              // ✅ Use String(item.PanditServiceID) to match key correctly
              const bookingCount = this.serviceCount[String(item.PanditServiceID)] || 0;

              return {
                ...item,
                ServiceName: service ? service.Name : '',
                ServiceDescription: service ? service.Description : '',
                LocationName: location ? location.Name : '',
                UserName: user ? user.FullName : '',
                BookingCount: bookingCount   // ✅ correctly matched per item
              };
            })
          );
        });

        return forkJoin(enrichedCalls);
      })

    ).subscribe({
      next: (finalList: any) => {
        this.PanditServicesList = finalList;
        console.log('Final Enriched List:', this.PanditServicesList);
      },
      error: (err) => {
        console.error('Error loading data:', err);
      }
    });
  }

  bookNow(item: any) {
    console.log(item);
    this.selectedBooking = item;
    this.isBookingModalOpen = true;
  }

  confirmBooking() {
    var date = this.BookingDate.split('T')[0];

    const isConfirmed = confirm(
      "Please confirm your booking:\n\n" +
      "🪔 Service: " + this.selectedBooking?.ServiceName + "\n" +
      "📍 Location: " + this.selectedBooking?.LocationName + "\n" +
      "📅 Date: " + date + "\n" +
      "💰 Amount: ₹ " + this.selectedBooking?.Price + "\n\n" +
      "Do you want to proceed?"
    );

    if (!isConfirmed) return;

    const payload = this.preparePayload();
    console.log(payload);

    date = this.BookingDate.split('T')[0];

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    this.api.post(
      `BookingsSelectByQuery?Query=PanditServiceID=${payload.panditServiceID} AND BhaktProfileID=${payload.bhaktProfileID} AND PoojaDate >= '${date}' AND PoojaDate < '${nextDateStr}'`,
      null
    ).subscribe((res: any) => {
      if (res.BookingList.length > 0) {
        alert('You have already booked');
      } else {
        this.api.post('BookingsInsert', payload)
          .subscribe((res: any) => {
            if (res?.BookingID > 0) {
              alert('Booking Confirmed 🎉');
              this.isBookingModalOpen = false;
              this.loadList();
            } else {
              alert("Something went wrong ❌");
            }
          });
      }
    });
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
      `assets/img/${cleanName}.png`,
      `assets/img/${cleanName}2.jfif`,
      `assets/img/${cleanName}3.jfif`
    ];
  }

  startSlideshow(serviceName: string) {
    const key = this.getCleanName(serviceName);
    if (this.imageIntervals[key]) return;
    this.currentImageIndex[key] = 0;
    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] = (this.currentImageIndex[key] + 1) % 3;
    }, 300000);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'status-requested';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-requested';
    }
  }

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
    this.viewingServiceID = item.PanditServiceID;
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