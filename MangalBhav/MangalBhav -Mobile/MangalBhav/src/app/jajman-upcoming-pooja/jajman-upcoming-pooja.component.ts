import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-jajman-upcoming-pooja',
  templateUrl: './jajman-upcoming-pooja.component.html',
  styleUrls: ['./jajman-upcoming-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class JajmanUpcomingPoojaComponent implements OnInit {
  userDetails: any;
  isEditMode = false;
  isModalOpen = false;

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

  selectedFile: any = null;
  Language: any;

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
    this.Language = await this.storage.get("Language");



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

  // -----------------------------
  // Load List
  // -----------------------------

  getDirections(item: any) {
    const addr = `${item.Location?.AddressLine1}, ${item.Location?.City}, ${item.Location?.State}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    window.open(url, '_blank');
  }

  callPandit(item: any) {
    window.open(`tel:${item.Profile?.PhoneNumber}`);
  }

  whatsappPandit(item: any) {
    const phone = item.Profile?.PhoneNumber?.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Namaste Pandit Ji 🙏, I have a booking for ${item.Service?.Name?.split('/')[0]} on ${new Date(item.PoojaDate).toDateString()}.`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  }

  addToCalendar(item: any) {
    const title = encodeURIComponent(item.Service?.Name?.split('/')[0] || 'Puja');
    const date = new Date(item.PoojaDate).toISOString().replace(/-|:|\.\d+/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}`;
    window.open(url, '_blank');
  }

  makePayment(item: any) {
    // TODO: payment gateway
  }

  cancelBooking(item: any) {
    // TODO: confirm alert then API call
  }

  buySamagri(item: any) {
  // open external shop or internal page
  window.open('https://www.amazon.in/s?k=puja+samagri', '_blank');
}



  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


    getStatusEmoji(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return '⏳ Awaiting Pandit Ji';
      case 'CONFIRMED': return '✅ Pandit Ji Confirmed';
      case 'CANCELLED': return '❌ Cancelled';
      case 'COMPLETED': return '🪔 Seva Completed';
      default: return '📿 In Progress';
    }
  }

  loadList() {

    this.api.post(
      `BookingsSelectByQuery?Query=BhaktProfileID=${this.userDetails.UserID} and Status = 'CONFIRMED'`,
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


}
