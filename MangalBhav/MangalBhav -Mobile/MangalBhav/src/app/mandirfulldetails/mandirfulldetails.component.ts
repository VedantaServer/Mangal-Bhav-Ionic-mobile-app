import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, ToastController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';

import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';

import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-mandirfulldetails',
  templateUrl: './mandirfulldetails.component.html',
  styleUrls: ['./mandirfulldetails.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent]
})
export class MandirfulldetailsComponent implements OnInit {

  MandirTransaction = {
    TenantID: Number(1),
    MandirID: 0,
    UserID: 0,
    TransactionType: '',
    ServiceName: '',
    DonorName: '',
    Phone: '',
    Amount: '',
    PaymentMode: '',
    OrderID: '',
    UniqueReferenceNo: '',
    PaymentStatus: '',
    PaymentGatewayResponse: '',
    Remarks: '',
    DateAdded: new Date(),
    DateModified: new Date(),
    UpdatedByUser: '',
  };

  mandirID: any = null;
  mandir: any = null;
  isLoading = true;

  FrontImageUrl: string | null = null;
  InsideImageUrl: string | null = null;

  activeSlide = 0;

  // ── Donate sheet ───────────────────────────

  donationSummary: any = null;
  showDonorList = false;
  donorListLoaded = false;

  donateAmount = '';
  donateCustomAmount: any = 21;
  donateName: any = null;
  donateMobile: any = null;
  donateMessage = '';
  donateWish = '';
  donatePurpose = 'General Donation';

  isDonating = false;
  isProcessingPayment = false;

  presetAmounts = [21, 51, 101];
  orderID: any;
  amt: string = '';

  userDetails: any;
  MandirTransactionList: any = [];
  successDonationData: any = null;
  currentSection: 'main' | 'donate' | 'preview' | 'success' = 'main';

  showStampPopup = false;
  supportMangalBhav = true;
  platformFee = 5;
  paidTransactionIds = new Set<number>();
  // ── Community / Membership ───────────────────────────
  isMember = false;
  isJoining = false;
  isMembershipLoading = true;
  memberCount = 0;
  memberSince: Date | null = null;

  /** Purpose options shown in the dropdown */
  purposeOptions = [
    'General Donation',
    'Prasad Seva',
    'Diya & Oil Seva',
    'Temple Renovation',
    'Annadanam (Food Offering)',
    'Festival Celebration',
    'Abhishek Puja Seva',
    'Maintenance & Upkeep',
    'Other',
  ];
  events: any = [];

  constructor(
    private route: ActivatedRoute,
    public routerCtrl: NavController,
    public api: Api,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController,
    private zone: NgZone
  ) { }

  // ─────────────────────────────────────────────────────────────
  async ngOnInit() {
    // this.createSparks();
    this.userDetails = await this.storage.get('account');
    if (this.userDetails) {
      this.donateMobile = this.userDetails.LoginID;
      this.donateName = this.userDetails.FullName;
    }

    //  this.mandirID = this.route.snapshot.paramMap.get('id');


    this.mandirID = this.route.snapshot.paramMap.get('id')
      || this.route.snapshot.params['id'];

    if (this.mandirID) {
      
      this.loadMandir(); 
      this.loadUpcomingEvents();
    }
    // this.loadTransaction();
    this.loadDonationSummary();
    this.checkMembership();
    this.MandirTransaction.MandirID = Number(this.mandirID);

    this.apinu
      .postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='RazorPay' and identifier='publictoken'`}`,
        null
      )
      .subscribe((res: any) => {
        const dateAdded = res?.MasterDataList?.[0]?.DateModified;
        if (!dateAdded) return;

        const diffDays = Math.floor(
          (new Date().getTime() - new Date(dateAdded).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 40) {
          this.apinu
            .postUrlData('refreshRazorPaySchoolCredentials', null)
            .subscribe((response: any) => {
              const { public_token: publictoken, access_token: accesstoken, refresh_token: refreshtoken } = response.data;

              this.apinu
                .postUrlData(
                  `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`domain='RazorPay'`)}`,
                  null
                )
                .subscribe((res2: any) => {
                  const tokenMap: any = { publictoken, access_token: accesstoken, refresh_token: refreshtoken };
                  (res2.MasterDataList || [])
                    .filter((x: any) => tokenMap[x.Identifier] !== undefined)
                    .map((x: any) => { x.Value = tokenMap[x.Identifier]; x.DateModified = new Date(); return x; })
                    .forEach((obj: any) => {
                      this.apinu.postUrlData('MasterDataUpdate', obj).subscribe();
                    });
                });
            });
        }
      });
  }


  checkMembership() {
    if (!this.userDetails?.UserID) {
      this.isMembershipLoading = false;
      this.loadMemberCount(); // still show member count to guests
      return;
    }
  
    const query = `MandirID = ${this.mandirID} AND UserID = ${this.userDetails.UserID} AND IsActive = 1`;
    this.apinu
      .postUrlData(`MandirMemberSelectByQuery?tenantID=1&schoolID=0&Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          const list: any[] = res?.MandirMemberList ?? [];
          this.isMember = list.length > 0;
          this.memberSince = list.length > 0 ? new Date(list[0].DateAdded) : null;
          this.isMembershipLoading = false;
          this.loadMemberCount();
        },
        error: () => {
          this.isMembershipLoading = false;
          this.loadMemberCount();
        }
      });
  }
  
  loadMemberCount() {
    const query = `MandirID = ${this.mandirID} AND IsActive = 1`;
    this.apinu
      .postUrlData(`MandirMemberSelectByQuery?tenantID=1&schoolID=0&Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          this.memberCount = res?.MandirMemberList?.length ?? 0;
        }
      });
  }
  
  joinMandir() {
    if (!this.userDetails?.UserID) {
      this.showToast('Please login to join this mandir community 🙏', 'warning');
      return;
    }
  
    this.isJoining = true;
  
    const member = {
      MandirMemberID: 0,
      TenantID: 1,
      MandirID: Number(this.mandirID),
      UserID: Number(this.userDetails.UserID),
      MemberRole: 'Member',
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: this.userDetails.FullName || ''
    };
  
    this.apinu.postUrlData('MandirMemberInsert', member).subscribe({
      next: () => {
        this.isMember = true;
        this.memberSince = new Date();
        this.memberCount++;
        this.isJoining = false;
        this.showToast('🙏 You have joined this mandir\'s community!', 'success');
      },
      error: () => {
        this.isJoining = false;
        this.showToast('Could not join. Please try again 🙏', 'danger');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────

  checkPaidToMandir(transactions: any[]) {
    if (!transactions?.length) return;

    const ids = transactions.map(t => t.TransactionID).join(',');
    const query = `TransactionID IN (${ids}) AND IsPaid = 1 AND IsCancelled <> 1`;

    this.apinu
      .postUrlData(`MandirLedgerSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          const ledgerRows: any[] = res?.MandirLedgerList ?? [];
          this.paidTransactionIds = new Set(ledgerRows.map(r => r.TransactionID));
        },
        error: () => {
          this.paidTransactionIds = new Set();
        }
      });
  }

  // Update loadTransaction() to call it after fetch
  loadTransaction() {
    this.apinu
      .postUrlData(
        `MandirTransactionsSelectByQuery?Query= MandirID = '${this.mandirID}' and transactiontype = 'Donation' and paymentstatus = 'Success' order by dateAdded desc`,
        null
      )
      .subscribe((res: any) => {
        this.MandirTransactionList = res.MandirTransactionList;
        this.checkPaidToMandir(this.MandirTransactionList); // ← add this
      });
  }

  loadUpcomingEvents() {

    const today = new Date().toISOString().split('T')[0];
  
    const query =
      `MandirID=${this.mandirID} AND IsVerified = 1
       AND CONVERT(date, EventDate, 23) >= CONVERT(date, GETDATE())
       ORDER BY CONVERT(date, EventDate, 23) ASC`;
  
    this.apinu
      .postUrlData(
        `MandirEventSelectByQuery?Query=${encodeURIComponent(query)}`,
        null
      )
      .subscribe((res: any) => {
        this.events = res?.MandirEventList || [];
      });
  }



  loadMandir() {
    this.isLoading = true;
    this.apinu
      .postUrlData(`MandirSelectByQuery?Query=MandirID=${this.mandirID}`, null)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const list = res?.MandirList ?? [];
          if (list.length > 0) {
            this.mandir = list[0];
            this.loadImages();
          }
        },
        error: () => {
          this.isLoading = false;
          this.showToast('Could not load mandir details', 'danger');
        },
      });
  }

  createSparks(): void {

    const sparks = document.getElementById('sparks') as HTMLElement;

    if (!sparks) {
      return;
    }

    const emojis: string[] = ['✨', '⭐', '🌟', '✦', '🔆'];

    for (let i = 0; i < 12; i++) {

      const s = document.createElement('span');

      s.className = 'spark';

      s.textContent = emojis[i % emojis.length];

      s.style.left = `${Math.random() * 100}%`;

      s.style.top = `${Math.random() * 100}%`;

      s.style.animationDelay = `${Math.random() * 2.5}s`;

      s.style.animationDuration = `${2 + Math.random() * 2}s`;

      sparks.appendChild(s);
    }
  }

  loadImages() {
    if (this.mandir?.FrontImage) {
      this.api
        .getImage('DownloadImages', { imageName: this.mandir.FrontImage, imagePurpose: 'ProfilePhoto' })
        .subscribe({ next: (blob: any) => { if (blob?.type?.startsWith('image/')) this.FrontImageUrl = URL.createObjectURL(blob); } });
    }
    if (this.mandir?.InsideImage) {
      this.api
        .getImage('DownloadImages', { imageName: this.mandir.InsideImage, imagePurpose: 'ProfilePhoto' })
        .subscribe({ next: (blob: any) => { if (blob?.type?.startsWith('image/')) this.InsideImageUrl = URL.createObjectURL(blob); } });
    }
  }

  // ── Slider ────────────────────────────────────────────────────
  get slideImages(): { url: string; label: string }[] {
    const imgs: { url: string; label: string }[] = [];

    // ✅ Inside image first
    if (this.InsideImageUrl) {
      imgs.push({ url: this.InsideImageUrl, label: '🛕 Inside View' });
    }

    // ✅ Front image second
    if (this.FrontImageUrl) {
      imgs.push({ url: this.FrontImageUrl, label: '🏛 Front View' });
    }

    return imgs;
  }

  prevSlide() {
    if (this.slideImages.length < 2) return;
    this.activeSlide = (this.activeSlide - 1 + this.slideImages.length) % this.slideImages.length;
  }

  nextSlide() {
    if (this.slideImages.length < 2) return;
    this.activeSlide = (this.activeSlide + 1) % this.slideImages.length;
  }

  // ── Sheet controls ────────────────────────────────────────────
  openDonate() {
    this.currentSection = 'donate';
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'none';
  }
  closeDonate() {
    this.currentSection = 'main';
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }
  backToDonate() {
    this.currentSection = 'donate';
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';

  }


  closeAll() {
    this.currentSection = 'main';
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }

  backToMain() {
    this.currentSection = 'main';
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }


  goBack() {
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;

    if (fab) {
      fab.style.display = 'flex';
    }

    this.routerCtrl.back();
  }
  selectPreset(amount: number) {
    this.donateAmount = String(amount);
    this.donateCustomAmount = Number(amount);
  }

  get finalAmount(): number {
    return Number(this.donateCustomAmount || this.donateAmount) || 0;
  }

  // ── STEP 1: Validate on donate sheet → show preview ──────────
  proceedToPreview() {
    const name = this.donateName || '';
    const mobile = this.donateMobile || '';

    if (!this.finalAmount || this.finalAmount < 1) {
      this.showToast('Please select or enter a donation amount 🙏', 'warning');
      return;
    }
    if (!name || name.length < 3) {
      this.showToast('Name should be at least 3 characters 🙏', 'warning');
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      this.showToast('Please enter a valid 10-digit mobile number 🙏', 'warning');
      return;
    }

    this.currentSection = 'preview';

  }

  // ── STEP 2: Initiate payment from preview sheet ───────────────
  initiatePayment() {
    this.isDonating = true;

    const totalAmount = this.finalAmount + (this.supportMangalBhav ? this.platformFee : 0);
    this.amt = String(totalAmount) + '00';

    this.apinu.postUrlData(`getRazorPayUniqueOrderID?amount=${this.amt}`, null)
      .subscribe((res: any) => {
        this.orderID = res.orderID;
        this.processPayment(res.orderID);
      });
  }

  processPayment(or: any) {
    this.apinu
      .postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='RazorPay' and identifier='publictoken'`}`,
        null
      )
      .subscribe((res: any) => {
        const ckey = res.MasterDataList[0].Description;

        const options: any = {
          key: ckey,
          amount: this.amt,
          currency: 'INR',
          name: 'Mangal Bhav',
          description: this.donatePurpose || 'Mangal Bhav Donation',
          image: 'https://app.mangalbhav.com/assets/mangalbhavlogo1.jpeg',
          order_id: or,
          webview_intent: true,

          handler: (response: any) => {
            this.zone.run(() => { this.isProcessingPayment = true; });

            const { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature } = response;

            this.apinu
              .postUrlData(`verifyRazorPayPayment?paymentId=${paymentId}&orderId=${orderId}&signature=${signature}`, null)
              .subscribe({
                next: (res2: any) => {
                  if (res2.success) {
                    this.MandirTransaction.DonorName = this.donateName || '';
                    this.MandirTransaction.UpdatedByUser = this.donateName || '';
                    this.MandirTransaction.Phone = this.donateMobile || '';
                    this.MandirTransaction.UniqueReferenceNo = paymentId;
                    this.MandirTransaction.OrderID = orderId;
                    this.MandirTransaction.DateAdded = new Date();
                    this.MandirTransaction.DateModified = new Date();
                    this.MandirTransaction.PaymentStatus = 'Success';
                    this.MandirTransaction.TransactionType = 'Donation';
                    this.MandirTransaction.ServiceName = this.donatePurpose || 'General Donation';
                    this.MandirTransaction.Amount = String(this.finalAmount);
                    this.MandirTransaction.Remarks = this.donateWish || '';

                    this.apinu.postUrlData(`MandirTransactionsInsert`, this.MandirTransaction)
                      .subscribe(() => {

                        this.successDonationData = {
                          amount: this.finalAmount,
                          platformFee: this.supportMangalBhav ? this.platformFee : 0,
                          donorName: this.donateName,
                          purpose: this.donatePurpose || 'General Donation',
                          wish: this.donateWish,
                          paymentId: paymentId,
                          date: new Date()
                        };

                        this.zone.run(() => {

                          this.isProcessingPayment = false;

                          //   this.showPreviewSheet = false;

                          //  this.showDonateSheet = false;

                          // this.isDonating = false;

                          //this.showDonationSuccessModal = true;
                          this.isDonating = false;
                          this.currentSection = 'success';

                        });

                        this.showToast('Payment Successful 🙏', 'success');

                        this.submitDonation();

                        this.loadTransaction();
                      });
                  }
                },
              });
          },

          prefill: {
            name: this.donateName,
            contact: this.donateMobile,
          },
          notes: { contact: this.donateMobile, wish: this.donateWish, mandirID: this.mandirID },
          theme: { color: '#FF9500' },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
  }

  async submitDonation() {
    await this.showToast(
      `🙏 Thank you! ₹${this.finalAmount} donated to ${this.mandir?.MandirName}`,
      'success'
    );
    this.donateAmount = '';
    this.donateCustomAmount = '';
    this.donateName = null;
    this.donateMobile = null;
    this.donateMessage = '';
    this.donateWish = '';
    this.donatePurpose = '';
  }

  openMaps() {
    if (this.mandir?.Latitude && this.mandir?.Longitude) {
      window.open(`https://maps.google.com/?q=${this.mandir.Latitude},${this.mandir.Longitude}`, '_blank');
    }
  }

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({ message, duration: 4000, color, position: 'top' });
    toast.present();
  }

  async shareMandir() {
    const shareUrl = `https://app.mangalbhav.com/mandirfulldetails/${this.mandirID}`;
    const name = this.mandir?.MandirName || 'Mandir';
    const god = this.mandir?.GodName || '';
    const canShare = await Share.canShare();
    if (canShare.value) {
      await Share.share({
        title: name,
        text: `🛕 ${name}${god ? ' — ' + god : ''}\n\nVisit on Mangal Bhav 🙏`,
        url: shareUrl,
        dialogTitle: 'Share this Mandir',
      });
    } else {
      await Clipboard.write({ string: shareUrl });
      this.showToast('Link copied to clipboard 📋', 'success');
    }
  }

  shareOnWhatsApp() {
    const shareUrl = `https://app.mangalbhav.com/mandirfulldetails/${this.mandirID}`;
    const name = this.mandir?.MandirName || 'Mandir';
    const god = this.mandir?.GodName || '';
    const text = encodeURIComponent(`🛕 *${name}*${god ? '\n✦ ' + god : ''}\n\nVisit on Mangal Bhav 🙏\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  /** WhatsApp support chat */
  async openWhatsApp() {
    await Browser.open({
      url: 'https://wa.me/918796917944?text=' + encodeURIComponent('Need help'),
    });
  }

  formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
  
    return {
      dd: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      mon: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
    };
  }

  shareDonationOnWhatsApp() {

    this.currentSection = 'main';
    const amount = this.successDonationData?.amount || 0;

    const purpose = this.successDonationData?.purpose || 'General Donation';

    const donor = this.successDonationData?.donorName || 'A devotee';

    const wish = this.successDonationData?.wish || '';

    const mandirName = this.mandir?.MandirName || 'Mandir';

    const shareUrl = `https://app.mangalbhav.com/mandirfulldetails/${this.mandirID}`;

    const message =
      `
🪔 *Donation Seva Completed Successfully* 🙏

✨ ${donor} has offered a donation of ₹${amount}
to *${mandirName}*

🌸 Purpose:
${purpose}

${wish ? `🌟 Prayer/Wish:\n"${wish}"\n` : ''}

🙏 May divine blessings bring peace, prosperity & happiness to all.

🔗 Visit Mandir:
${shareUrl}

📿 Shared via Mangal Bhav
`;

    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }

  lightboxImageUrl: string | null = null;

  openLightbox(url: string) {
    this.lightboxImageUrl = url;
  }

  closeLightbox() {
    this.lightboxImageUrl = null;
  }
  loadDonationSummary() {
    this.apinu
      .postUrlData(
        `MandirDonationSummary?mandirID=${this.mandirID}`,
        null
      )
      .subscribe((res: any) => {

        this.donationSummary = res[0];

        console.log(this.donationSummary);
      });
  }

  showDonors() {

    this.showDonorList = true;

    if (!this.donorListLoaded) {

      this.loadTransaction();

      this.donorListLoaded = true;
    }
  }
}