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
  selector: 'app-pending-pooja',
  templateUrl: './pending-pooja.component.html',
  styleUrls: ['./pending-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,PanditjibottomtabsComponent]
})
export class PendingPoojaComponent implements OnInit {
  userDetails: any;
  language: any;
  PanditServicesList: any;

  constructor(public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController,) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    this.language = await this.storage.get("Language");


    this.loadList();
  }

   openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
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

  acceptPayment(booking: any) {

  }
  async finishPooja(booking: any, status: any) {
    console.log(booking);


    const alert = await this.alertCtrl.create({
      header: 'Confirm Action',
      message: `Are you sure you want to ${status.toLowerCase()} this pooja?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {

            console.log('Original booking:', booking);

            // Clone object
            const payload = { ...booking };

            // Remove BhaktProfile
            delete payload.BhaktProfile;

            // Update status
            payload.Status = status;

            console.log('Payload being sent:', payload);

            // 🔥 Call API here
            this.api.post('BookingsUpdate', payload)
              .subscribe((res: any) => {

                console.log(res)
                if (res.BookingID > 0) {
                  booking.Status = status; // update UI
                }

              });

          }
        }
      ]
    });

    await alert.present();
  }


    sendAlert(booking: any) {

    alert(`Message sent to ${booking.BhaktProfile?.FullName} 📩`);

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
            `BookingsSelectByQuery?Query=panditServiceID=${service.PanditServiceID} and Status = 'CONFIRMED'`,
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


}
