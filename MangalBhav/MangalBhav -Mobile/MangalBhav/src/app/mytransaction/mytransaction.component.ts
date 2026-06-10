import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../../providers';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { concatMap, forkJoin, map, of } from 'rxjs';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';

@Component({
  selector: 'app-mytransaction',
  templateUrl: './mytransaction.component.html',
  styleUrls: ['./mytransaction.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CommonBottomTabsComponent,JajmanbottomtabsComponent]
})
export class MytransactionComponent implements OnInit {

  userDetails: any;
  language: any;
  transactions: any[] = [];
  isLoading = true;
  selectedTxn: any = null;
  modalLoading = false;

  // booking modal data
  enrichedBooking: any = null;

  // mandir modal data
  selectedMandir: any = null;
  mandirFrontImageUrl: string | null = null;
  mandirInsideImageUrl: string | null = null;

  labels = {
    en: {
      appTitle: 'Mangal.Bhav',
      appSub: '✦ Peace · Prosperity · Protection ✦',
      bannerSub: 'Your Sacred',
      bannerTitle: 'Transactions',
      noTransactions: 'No transactions found',
      noTransactionsSub: 'Your puja bookings and donations will appear here.',
      donation: 'Mandir Donation',
      booking: 'Pandit Booking',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      loadingText: 'Fetching your transactions...',
      transactionId: 'Txn ID',
      pandit: 'Pandit',
      mandir: 'Mandir',
      pooja: 'Pooja',
    },
    hi: {
      appTitle: 'मंगल.भाव:',
      appSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      bannerSub: 'आपके पवित्र',
      bannerTitle: 'लेन-देन',
      noTransactions: 'कोई लेन-देन नहीं मिला',
      noTransactionsSub: 'आपकी पूजा बुकिंग और दान यहाँ दिखेंगे।',
      donation: 'मंदिर दान',
      booking: 'पंडित बुकिंग',
      amount: 'राशि',
      date: 'दिनांक',
      status: 'स्थिति',
      loadingText: 'लेन-देन लोड हो रहे हैं...',
      transactionId: 'Txn ID',
      pandit: 'पंडित',
      mandir: 'मंदिर',
      pooja: 'पूजा',
    }
  };

  get t() {
    return this.language === 'Hindi' ? this.labels.hi : this.labels.en;
  }

  constructor(
    public routerCtrl: NavController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.language = this.userDetails?.Languages;
    this.loadTransactions();
  }


  shareOnWhatsapp(txn: any) {
  let message = '';

  if (txn._type === 'donation') {
    const mandir = txn._mandir;
    message =
      `🛕 *Mandir Donation - Mangal Bhav*\n\n` +
      `🕌 Mandir   : ${mandir?.MandirName || 'N/A'}\n` +
      `📍 Location : ${mandir?.City || ''}${mandir?.State ? ', ' + mandir.State : ''}\n` +
      `💰 Amount   : ₹${txn.Amount || txn.TransactionAmount}\n` +
      `🗓️ Date      : ${this.formatDate(txn.DateAdded)}\n` +
      `🔖 Txn ID   : #${txn.TransactionID || txn.MandirTransactionID}\n\n` +
      `✦ हर हर महादेव · जय माता दी ✦\n` +
      `_Powered by Mangal Bhav App_`;

  } else if (txn._type === 'booking') {
    const booking = txn._booking;
    message =
      `🙏 *Pandit Booking - Mangal Bhav*\n\n` +
      `🔱 Pooja    : ${booking?.PoojaName || booking?.ServiceName || 'N/A'}\n` +
      `👤 Pandit   : ${booking?.PanditName || booking?.FullName || 'N/A'}\n` +
      `💰 Amount   : ₹${txn.Amount || txn.TransactionAmount}\n` +
      `🗓️ Date      : ${this.formatDate(txn.DateAdded)}\n` +
      `🔖 Txn ID   : #${txn.TransactionID || txn.MandirTransactionID}\n\n` +
      `✦ जय श्री राम · शुभ पूजा ✦\n` +
      `_Powered by Mangal Bhav App_`;
  }

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

  loadTransactions() {
    this.isLoading = true;
    const phone = this.userDetails?.LoginID;

    this.apinu.postUrlData(
      `MandirTransactionsSelectByQuery?Query= Phone = '${phone}'`,
      null
    ).subscribe({
      next: async (res: any) => {
        const list: any[] = res.MandirTransactionList || [];

        // enrich each transaction with mandir or booking details
        const enriched = await Promise.all(
          list.map(txn => this.enrichTransaction(txn))
        );

        // newest first
        this.transactions = enriched.sort(
          (a, b) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime()
        );
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Transaction fetch error:', err);
        this.isLoading = false;
      }
    });
  }

  enrichTransaction(txn: any): Promise<any> {
    return new Promise((resolve) => {

      // ── MANDIR DONATION ──────────────────────────────────────────
      if (txn.MandirID && Number(txn.MandirID) > 0) {
        this.apinu.postUrlData(
          `MandirSelectByQuery?Query= MandirID = ${txn.MandirID}`,
          null
        ).subscribe({
          next: (res: any) => {
            const mandir = res.MandirList?.[0] || null;
            resolve({ ...txn, _type: 'donation', _mandir: mandir });
          },
          error: () => resolve({ ...txn, _type: 'donation', _mandir: null })
        });

        // ── PANDIT BOOKING ───────────────────────────────────────────
      } else if (txn.UserID && Number(txn.UserID) > 0) {

        console.log(txn)
      
        this.apinu.postUrlData(
          `BookingsSelectByQuery?Query= BookingID = ${txn.UserID}`,
          null
        ).subscribe({
          next: (res: any) => {
            const booking = res.BookingList?.[0] || null;
            resolve({ ...txn, _type: 'booking', _booking: booking });
          },
          error: () => resolve({ ...txn, _type: 'booking', _booking: null })
        });

        // ── UNKNOWN ──────────────────────────────────────────────────
      } else {
        resolve({ ...txn, _type: 'unknown' });
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    const s = status.toUpperCase();
    if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') return 'status-success';
    if (s === 'FAILED' || s === 'CANCELLED') return 'status-failed';
    return 'status-pending';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  openDetail(txn: any) {
    console.log(txn)
    this.selectedTxn = txn;
    this.enrichedBooking = null;
    this.selectedMandir = null;
    this.mandirFrontImageUrl = null;
    this.mandirInsideImageUrl = null;

    if (txn.TransactionType === 'Pooja') {
      this.loadEnrichedBooking(txn.UserID);
    } else if (txn.TransactionType === 'Donation') {
      this.loadMandirDetail(txn._mandir || null, txn.MandirID);
    }
  }

  closeDetail() {
    this.selectedTxn = null;
  }

  loadEnrichedBooking(bookingID: number) {
    this.modalLoading = true;

    this.apinu.postUrlData(
      `BookingsSelectByQuery?Query=BookingID=${bookingID}`,
      null
    ).pipe(
      concatMap((bookingRes: any) => {
        const booking = bookingRes?.BookingList?.[0];
        if (!booking) return of(null);

        return this.apinu.postUrlData(
          `PanditServiceSelect?panditServiceID=${booking.PanditServiceID}&tenantID=${this.userDetails.TenantID}`,
          null
        ).pipe(
          concatMap((psRes: any) => {
            const panditService = psRes?.PanditServiceList?.[0];
            if (!panditService) return of({ ...booking });

            return forkJoin({
              serviceRes: this.apinu.postUrlData(
                `ServiceSelect?serviceID=${panditService.ServiceID}&tenantId=${panditService.TenantID}`, null
              ),
              locationRes: this.apinu.postUrlData(
                `LocationSelect?locationID=${panditService.LocationID}&tenantID=${panditService.TenantID}`, null
              ),
              userRes: this.apinu.postUrlData(
                `ProfilesSelectAllByUserID?userId=${panditService.ProfileID}`, null
              )
            }).pipe(
              map((extra: any) => ({
                ...booking,
                PanditService: panditService,
                Service: extra.serviceRes?.ServiceList?.[0] || null,
                Location: extra.locationRes?.LocationList?.[0] || null,
                Profile: extra.userRes?.ProfileList?.[0] || null
              }))
            );
          })
        );
      })
    ).subscribe({
      next: (result: any) => {
        this.enrichedBooking = result;
        this.modalLoading = false;
        console.log(this.enrichedBooking)
        if (result?.Profile?.ProfilePhotoUrl) {
          this.loadPanditPhoto(result.Profile.ProfilePhotoUrl);
        }
      },
      error: () => { this.modalLoading = false; }
    });
  }

  panditPhotoUrl: string | null = null;

  loadPanditPhoto(photoName: string) {
    this.api.getImage('DownloadImages', {
      imageName: photoName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/'))
          this.panditPhotoUrl = URL.createObjectURL(blob);
      }
    });
  }

  loadMandirDetail(existingMandir: any, mandirID: number) {
    this.modalLoading = true;

    if (existingMandir) {
      this.selectedMandir = existingMandir;
      this.modalLoading = false;
      this.loadMandirImages(existingMandir);
      return;
    }

    this.apinu.postUrlData(
      `MandirSelectByQuery?Query=MandirID=${mandirID}`, null
    ).subscribe({
      next: (res: any) => {
        this.selectedMandir = res?.MandirList?.[0] || null;
        this.modalLoading = false;
        if (this.selectedMandir) this.loadMandirImages(this.selectedMandir);
      },
      error: () => { this.modalLoading = false; }
    });
  }

  loadMandirImages(mandir: any) {
    if (mandir?.FrontImage) {
      this.api.getImage('DownloadImages', {
        imageName: mandir.FrontImage,
        imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (blob?.type?.startsWith('image/'))
            this.mandirFrontImageUrl = URL.createObjectURL(blob);
        }
      });
    }
    if (mandir?.InsideImage) {
      this.api.getImage('DownloadImages', {
        imageName: mandir.InsideImage,
        imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (blob?.type?.startsWith('image/'))
            this.mandirInsideImageUrl = URL.createObjectURL(blob);
        }
      });
    }
  }
}