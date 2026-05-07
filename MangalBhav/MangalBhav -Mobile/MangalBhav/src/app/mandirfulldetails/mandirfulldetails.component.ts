import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, ToastController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-mandirfulldetails',
  templateUrl: './mandirfulldetails.component.html',
  styleUrls: ['./mandirfulldetails.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
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
  }

  mandirID: any = null;
  mandir: any = null;
  isLoading = true;

  FrontImageUrl: string | null = null;
  InsideImageUrl: string | null = null;

  activeSlide = 0;  // 0 = front, 1 = inside

  // Donate sheet
  showDonateSheet = false;
  donateAmount = '';
  donateCustomAmount: any;
  donateName = null;
  donateMobile = null;
  donateMessage = '';
  isDonating = false;
  presetAmounts = [21, 51, 101];
  orderID: any;
  amt: string = '';
  isProcessingPayment: boolean = false;
  userDetails: any;

  constructor(
    private route: ActivatedRoute,
    public routerCtrl: NavController,
    public api: Api,
    public apinu: ApiNU, private storage: Storage,
    public toastController: ToastController, private zone: NgZone
  ) { }

  async ngOnInit() {


    this.userDetails = await this.storage.get('account');

    if (this.userDetails) {
      this.donateMobile = this.userDetails.LoginID;
      this.donateName = this.userDetails.FullName;
    }


    this.mandirID = this.route.snapshot.paramMap.get('id');
    if (this.mandirID) this.loadMandir();

    this.MandirTransaction.MandirID = Number(this.mandirID);

    this.apinu.postUrlData(`MasterDataSelectByQuery?tenantID=-1&Query=${`domain='RazorPay' and identifier='publictoken'`}`, null)
      .subscribe((res: any) => {
        const dateAdded = res?.MasterDataList?.[0]?.DateModified;

        if (dateAdded) {
          const addedDate = new Date(dateAdded);
          const today = new Date();

          // Difference in milliseconds → convert to days
          const diffTime = today.getTime() - addedDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 40) {

            // alert('dd')
            this.apinu.postUrlData('refreshRazorPaySchoolCredentials', null).subscribe((response: any) => {
              console.log('API called because record is older than 30 days', response);

              const publictoken = response.data.public_token;
              const accesstoken = response.data.access_token;
              const refreshtoken = response.data.refresh_token;

              this.apinu
                .postUrlData(
                  `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`domain='RazorPay'`)}`,
                  null
                )
                .subscribe((res: any) => {
                  const masterDataList = res.MasterDataList || [];

                  console.log(masterDataList)

                  const tokenMap: any = {
                    publictoken: publictoken,
                    access_token: accesstoken,
                    refresh_token: refreshtoken
                  };

                  const updatedObjects = masterDataList
                    .filter((x: any) => tokenMap[x.Identifier] !== undefined)
                    .map((x: any) => {
                      x.Value = tokenMap[x.Identifier];
                      x.DateModified = new Date(); // update modified date
                      return x;
                    });

                  console.log(updatedObjects)

                  updatedObjects.forEach((obj: any) => {
                    this.apinu.postUrlData('MasterDataUpdate', obj).subscribe(
                      (updateRes: any) => {
                        console.log(`${obj.Identifier} updated successfully`);
                      },
                      (err: any) => {
                        console.error(`${obj.Identifier} update failed`, err);
                      }
                    );
                  });
                });


            });
          } else {
            console.log('less')
          }
        }
      })


  }

  loadMandir() {
    this.isLoading = true;
    this.apinu.postUrlData(
      `MandirSelectByQuery?Query=MandirID=${this.mandirID}`, null
    ).subscribe({
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
      }
    });
  }

  loadImages() {
    if (this.mandir?.FrontImage) {
      this.api.getImage('DownloadImages', {
        imageName: this.mandir.FrontImage,
        imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (blob?.type?.startsWith('image/'))
            this.FrontImageUrl = URL.createObjectURL(blob);
        }
      });
    }
    if (this.mandir?.InsideImage) {
      this.api.getImage('DownloadImages', {
        imageName: this.mandir.InsideImage,
        imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (blob?.type?.startsWith('image/'))
            this.InsideImageUrl = URL.createObjectURL(blob);
        }
      });
    }
  }

  // ── Slider ─────────────────────────────────────────────────
  get slideImages(): { url: string; label: string }[] {
    const imgs = [];
    if (this.FrontImageUrl) imgs.push({ url: this.FrontImageUrl, label: '🏛 Front View' });
    if (this.InsideImageUrl) imgs.push({ url: this.InsideImageUrl, label: '🛕 Inside View' });
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

  // ── Donate ─────────────────────────────────────────────────
  openDonate() { this.showDonateSheet = true; }
  closeDonate() { this.showDonateSheet = false; }

  selectPreset(amount: number) {
    this.donateAmount = String(amount);
    this.donateCustomAmount = Number(amount);
  }

  get finalAmount(): number {
    return Number(this.donateCustomAmount || this.donateAmount) || 0;
  }

  initiatePayment() {

    const name = this.donateName || ' ';
    const mobile = this.donateMobile;

    // Name + Mobile required
    if (!name || !mobile) {
      this.showToast('Please enter your name and mobile 🙏', 'warning');
      return;
    }

    // Name validation
    if (name.length < 3) {
      this.showToast('Name should be at least 3 characters 🙏', 'warning');
      return;
    }

    // Mobile validation (exactly 10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
      this.showToast('Please enter a valid 10-digit mobile number 🙏', 'warning');
      return;
    }

    this.isDonating = true;
    if (!this.finalAmount || this.finalAmount < 1) {
      this.showToast('Please select or enter a donation amount 🙏', 'warning');
      return;
    }

    this.amt = String(this.finalAmount + 5) + '00'

    this.apinu.postUrlData(`getRazorPayUniqueOrderID?amount=${this.amt}`, null)
      .subscribe((res: any) => {
        console.log(res);
        this.orderID = res.orderID;
        this.processPayment(res.orderID);
      })
  }



  processPayment(or: any) {


    this.apinu.postUrlData(`MasterDataSelectByQuery?tenantID=-1&Query=${`domain='RazorPay' and identifier='publictoken'`}`, null)
      .subscribe((res: any) => {
        const ckey = res.MasterDataList[0].Description;
        // alert(ckey)
        const options: any = {
          key: ckey,
          amount: this.amt,
          currency: "INR",
          name: "Mangal Bhav",
          description: "Mangal Bhav Donation",
          image: "https://mangalbhav.com/assets/mangalbhavlogo1.jpeg",

          order_id: or,

          webview_intent: true,

          handler: (response: any) => {

            this.zone.run(() => {
              this.isProcessingPayment = true;
            });

            const paymentId = response.razorpay_payment_id;
            const orderId = response.razorpay_order_id;
            const signature = response.razorpay_signature;

            this.apinu.postUrlData(
              `verifyRazorPayPayment?paymentId=${paymentId}&orderId=${orderId}&signature=${signature}`,
              null
            ).subscribe({
              next: (res: any) => {

                if (res.success) {

                  this.MandirTransaction.DonorName = this.donateName || '';
                  this.MandirTransaction.UpdatedByUser = this.donateName || '';
                  this.MandirTransaction.Phone = this.donateMobile || '';
                  this.MandirTransaction.UniqueReferenceNo = paymentId;
                  this.MandirTransaction.OrderID = orderId;
                  this.MandirTransaction.DateAdded = new Date();
                  this.MandirTransaction.DateModified = new Date();
                  this.MandirTransaction.PaymentStatus = 'Success';
                  this.MandirTransaction.TransactionType = 'Donation';
                  this.MandirTransaction.ServiceName = 'General Donation';
                  this.MandirTransaction.Amount = String(this.finalAmount);

                  this.apinu.postUrlData(`MandirTransactionsInsert`, this.MandirTransaction)
                    .subscribe(() => {

                      this.zone.run(() => {
                        this.isProcessingPayment = false;
                        this.showDonateSheet = false; // close modal
                        this.isDonating = false;
                      });

                      alert('Payment Success');
                      this.submitDonation();
                    });
                }
              }
            });
          },

          // handler: (response: any) => {

          //   this.isProcessingPayment = true;

          //   const paymentId = response.razorpay_payment_id;
          //   const orderId = response.razorpay_order_id;
          //   const signature = response.razorpay_signature;


          //   this.apinu.postUrlData(`verifyRazorPayPayment?paymentId=${paymentId}&orderId=${orderId}&signature=${signature}`, null)
          //     .subscribe({
          //       next: (res: any) => {
          //         console.log(res);
          //         if (res.success) {


          //           this.MandirTransaction.DonorName = this.donateName || '';
          //           this.MandirTransaction.UpdatedByUser = this.donateName || '';
          //           this.MandirTransaction.Phone = this.donateMobile || '';
          //           this.MandirTransaction.UniqueReferenceNo = paymentId;
          //           this.MandirTransaction.OrderID = orderId;
          //           this.MandirTransaction.DateAdded = new Date();
          //           this.MandirTransaction.DateModified = new Date();
          //           this.MandirTransaction.PaymentStatus = 'Success';
          //           this.MandirTransaction.TransactionType = 'Donation';
          //           this.MandirTransaction.ServiceName = 'General Donation';
          //           this.MandirTransaction.Amount = String(this.finalAmount);

          //           this.apinu.postUrlData(`MandirTransactionsInsert`, this.MandirTransaction)
          //             .subscribe((res: any) => {
          //               this.isProcessingPayment = false;
          //               alert("Payment Successs");
          //               this.closeDonate();
          //               this.submitDonation();
          //             })



          //         } else {
          //           this.isProcessingPayment = false;
          //           alert("Payment verification failed ❌");
          //         }
          //       },
          //       error: (err: any) => {
          //         console.error(err);
          //         this.isProcessingPayment = false; // ✅ STOP LOADER
          //         alert("Something went wrong ❌");
          //       }
          //     });
          // },
          prefill: {
            name: this.donateName,
            contact: this.donateMobile
          },

          notes: {
            contact: this.donateMobile
          },

          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.open();
      })

    //alert(or)


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
  }

  openMaps() {
    if (this.mandir?.Latitude && this.mandir?.Longitude) {
      window.open(
        `https://maps.google.com/?q=${this.mandir.Latitude},${this.mandir.Longitude}`,
        '_blank'
      );
    }
  }

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 4000, color, position: 'top'
    });
    toast.present();
  }
}