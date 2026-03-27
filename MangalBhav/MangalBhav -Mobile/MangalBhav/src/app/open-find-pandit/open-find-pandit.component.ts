import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, from, map, mergeMap, of, toArray } from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-open-find-pandit',
  templateUrl: './open-find-pandit.component.html',
  styleUrls: ['./open-find-pandit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule]
})
export class OpenFindPanditComponent implements OnInit {

  userDetails: any;
  isScannerOpen = false;
  scannedQrData: string | null = null;
  panditList: any[] = [];       // the finalResult from your API
  selectedIndex: number = -1;   // which pandit is expanded
  selectedPandit: any = null;   // for modal
  selectedService: any = null;  // for modal
  isBookingModalOpen = false;
  BookingDate: string = '';
  minDate: string = new Date().toISOString();
  searchQuery: string = '';
  language: any;

  profileImages: { [key: number]: string } = {};
  formats = [BarcodeFormat.QR_CODE];
  constructor(public routerCtrl: NavController,
    public api: Api,
    private storage: Storage, private router: Router,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController) { }

  async ngOnInit() {
    // this.userDetails = await this.storage.get("account");
    // this.language = await this.storage.get("Language");

    this.openQrScanner();



    // Step 1: Get all Pandit Users

  }


  // Toggle expand/collapse a pandit card
  togglePandit(i: number) {
    this.selectedIndex = this.selectedIndex === i ? -1 : i;
  }

  // Called when "Book" button on a service is tapped
  bookService(panditItem: any, service: any) {
    this.selectedPandit = panditItem;
    this.selectedService = service;
    this.isBookingModalOpen = true;
  }

  // Confirm the booking
  confirmBooking() {
    const payload = {
      PanditUserID: this.selectedPandit?.user?.UserID,
      ServiceID: this.selectedService?.ServiceID,
      LocationID: this.selectedService?.LocationID,
      PoojaDate: this.BookingDate,
      TotalAmount: this.selectedService?.Price,
    };
    console.log('Booking payload:', payload);
    // call your API here
    this.isBookingModalOpen = false;
  }

  // Returns localized text split by ' / '
  getLocalizedText(text: string): string {
    if (!text) return '';
    const parts = text.split(' / ');
    if (this.language === 'Hindi' && parts.length > 1) {
      return parts[1].trim();
    }
    return parts[0].trim();
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default.jpg';
    img.onerror = null;
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


  // For separate _HI field columns (not ' / ' split)
  getField(obj: any, field: string): string {
    if (!obj) return '';
    if (this.language === 'Hindi' && obj[field + '_HI']) {
      return obj[field + '_HI'];
    }
    return obj[field] || '';
  }
  startSlideshow(serviceName: string) {
    const key = this.getCleanName(serviceName);

    if (this.imageIntervals[key]) return; // avoid multiple intervals

    this.currentImageIndex[key] = 0;

    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] =
        (this.currentImageIndex[key] + 1) % 3;
    }, 3000000); // change every 3 seconds
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

  getCurrentImage(serviceName: string): string {
    const key = this.getCleanName(serviceName);
    const images = this.getServiceImages(serviceName);

    if (!(key in this.currentImageIndex)) {
      this.startSlideshow(serviceName);
    }

    return images[this.currentImageIndex[key] || 0];
  }




  isExploreModalOpen = false;

  exploreService(panditItem: any, service: any) {
    this.selectedPandit = panditItem;
    this.selectedService = service;
    this.isExploreModalOpen = true;
  }

  async goToBooking(selectedService: any) {
    console.log(selectedService);



    await this.storage.set('pendingPanditServiceID', selectedService.PanditServiceID);

    this.router.navigate(['/login']);

    this.isExploreModalOpen = false;

    // setTimeout(() => {
    //   this.router.navigateByUrl(`/book-pooja?id=${selectedService.PanditServiceID}`);
    // }, 200);
  }



  openQrScanner() {
    this.isScannerOpen = true;
  }

  closeQrScanner() {
    this.isScannerOpen = false;
  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;

    // Parse "pandituserid=5" → 5
    const match = result.toLowerCase().match(/pandituserid=(\d+)/);

    if (match) {
      const userId = Number(match[1]);
      // alert(userId)
      this.api.post(
        `UsersNUSelectByQuery?Query=Role='PANDIT' and UserID = ${userId} `,
        null
      ).subscribe((userRes: any) => {

        const users = userRes.UserList;

        if (!users || users.length === 0) return;

        // Process each user sequentially
        from(users)
          .pipe(
            // 2️⃣ Get Profile using UserID
            mergeMap((user: any) =>
              this.api.post(
                `ProfilesSelectAllByUserID?userID=${user.UserID}`,
                null
              ).pipe(
                map((profileRes: any) => ({
                  user,
                  profile: profileRes?.ProfileList?.[0] || null
                }))
              )
            ),
            // 3️⃣ Get Pandit Services using UserID
            mergeMap((data: any) =>
              this.api.post(
                `PanditServicesSelectAllByProfileID?profileID=${data.user.UserID}`,
                null
              ).pipe(
                map((serviceRes: any) => ({
                  ...data,
                  panditServices: serviceRes?.PanditServiceList || []
                }))
              )
            ),

            // 4️⃣ Get Service + Location Details for each PanditService
            mergeMap((data: any) => {

              if (!data.panditServices.length) {
                return [data];
              }

              return from(data.panditServices).pipe(

                mergeMap((ps: any) =>

                  forkJoin({

                    // 1️⃣ Service Details
                    serviceDetail: this.api.post(
                      `ServiceSelect?serviceID=${ps.ServiceID}&tenantID=1`,
                      null
                    ),

                    // 2️⃣ Location Details
                    locationDetail: this.api.post(
                      `LocationSelect?locationID=${ps.LocationID}&tenantID=1`,
                      null
                    ),

                    // 3️⃣ Category Mapping
                    categoryMapping: this.api.post(
                      `ServiceCategoryMappingSelectAllByServiceID?serviceID=${ps.ServiceID}`,
                      null
                    )

                  }).pipe(

                    // 🔥 After getting mapping, fetch category details
                    mergeMap((res: any) => {

                      const mappings = res.categoryMapping?.ServiceCategoryMappingList || [];

                      if (!mappings.length) {
                        return of({
                          ...ps,
                          ServiceDetails: res.serviceDetail?.ServiceList || null,
                          LocationDetails: res.locationDetail?.LocationList || null,
                          Categories: []
                        });
                      }

                      return from(mappings).pipe(

                        mergeMap((mapItem: any) =>
                          this.api.post(
                            `ServiceCategorySelect?categoryID=${mapItem.CategoryID}&tenantID=1`,
                            null
                          ).pipe(
                            map((catRes: any) => ({
                              ...mapItem,
                              CategoryDetails: catRes?.ServiceCategoryList?.[0] || null
                            }))
                          )
                        ),

                        toArray(),

                        map((categoriesWithDetails: any[]) => ({
                          ...ps,
                          ServiceDetails: res.serviceDetail?.ServiceList || null,
                          LocationDetails: res.locationDetail?.LocationList || null,
                          Categories: categoriesWithDetails
                        }))

                      );

                    })

                  )

                ),

                toArray(),

                map((servicesWithDetails: any[]) => ({
                  ...data,
                  panditServices: servicesWithDetails
                }))

              );

            }),
            toArray()
          )
          .subscribe((finalResult: any) => {
            console.log("Final Structured Data:", finalResult);
            this.panditList = finalResult;

            this.loadPanditServiceBookingCounts();

            this.panditList.forEach((item: any) => {
              if (item.profile) this.loadProfileImage(item.profile);
            });
          });

      });
    }

    console.log('Scanned QR:', this.scannedQrData);
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
  }

  panditServiceBookingMap: { [key: string]: number } = {};

  // Call after panditList is set in subscribe
  loadPanditServiceBookingCounts() {
    this.panditList.forEach((item: any) => {
      item.panditServices?.forEach((ps: any) => {
        if (!ps.PanditServiceID) return;

        this.panditServiceBookingMap[String(ps.PanditServiceID)] = 0;

        this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${ps.PanditServiceID}`, null)
          .subscribe((res: any) => {
            this.panditServiceBookingMap[String(ps.PanditServiceID)] =
              (res?.BookingList?.length || 0) + 10;
          });
      });
    });
  }

  loadProfileImage(profile: any) {
    if (!profile?.ProfilePhotoUrl || !profile?.UserID) return;

    const params = {
      imageName: profile.ProfilePhotoUrl,
      imagePurpose: 'ProfilePhoto'
    };

    this.api.getImage('DownloadImages', params).subscribe({
      next: (blob: Blob) => {
        if (blob?.type?.startsWith('image/')) {
          this.profileImages[profile.UserID] = URL.createObjectURL(blob);
        }
      },
      error: () => { /* falls back to default in getter */ }
    });
  }

  getProfileImage(userID: number): string {
    return this.profileImages[userID] || 'assets/default.jfif';
  }

}
