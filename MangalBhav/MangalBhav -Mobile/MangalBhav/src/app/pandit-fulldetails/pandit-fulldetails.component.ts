import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, from, map, mergeMap, of, toArray } from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { FcmService } from 'src/providers/fcm/fcm';

@Component({
  selector: 'app-pandit-fulldetails',
  templateUrl: './pandit-fulldetails.component.html',
  styleUrls: ['./pandit-fulldetails.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditFulldetailsComponent implements OnInit {
  panditList: any[] = [];
  displayList: any[] = [];
  searchQuery: string = '';
  PaymentMode: any = '';
  verificationPopupOpen = false;
  selectedVerificationPandit: any = null;
  verificationStatus = '';
  verificationRemarks = '';
  referralPopupOpen = false;
  selectedReferralPandit: any = null;

  referralCode = '';
  referrerUserID = 0;

  constructor(public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api, private fcm: FcmService,
    private storage: Storage, private router: Router, public toastController: ToastController,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController) { }



  get filteredPanditList(): any[] {
    if (!this.searchQuery?.trim()) return this.panditList;
    const q = this.searchQuery.toLowerCase().trim();
    return this.panditList.filter((p: any) =>
      p.FullName?.toLowerCase().includes(q) ||
      p.LoginID?.toLowerCase().includes(q)
    );
  }


  searchPandits() {
    if (!this.searchQuery?.trim()) {
      this.displayList = this.panditList;   // empty query → show all
      return;
    }
    const q = this.searchQuery.toLowerCase().trim();
    this.displayList = this.panditList.filter((p: any) =>
      p.FullName?.toLowerCase().includes(q) ||
      p.LoginID?.toLowerCase().includes(q)
    );
  }

  // ← ADD THIS (clear button)
  clearSearch() {
    this.searchQuery = '';
    this.displayList = this.panditList;
  }

  // ── Pay Popup ──────────────────────────────────────────────
  selectedPandit: any = null;
  payPopupOpen = false;
  payAmount = '';
  payRefNo = '';
  payDonorName = '';
  payPhone = '';
  panditTxList: any[] = [];
  isSubmitting = false;
  isLoadingTx = false;
  MandirTransaction: any = {};

  openPayPopup(pandit: any) {
    this.selectedPandit = pandit;
    this.payAmount = '';
    this.payRefNo = '';
    this.payDonorName = '';
    this.payPhone = '';
    this.panditTxList = [];
    this.payPopupOpen = true;
    this.loadPanditTransactions(pandit.UserID);
  }

  closePayPopup() {
    this.payPopupOpen = false;
    this.selectedPandit = null;
  }

  loadPanditTransactions(userId: any) {
    this.isLoadingTx = true;
    this.apinu.postUrlData(
      `MandirTransactionsSelectByQuery?Query= UserID = '${userId}' and transactiontype = 'MangalBhavDakshina'  order by dateAdded desc`,
      null
    ).subscribe((res: any) => {
      this.panditTxList = res?.MandirTransactionList || [];
      this.isLoadingTx = false;
    });
  }

  async submitPayment() {
    if (!this.payAmount || !String(this.payRefNo ?? '').trim()) {
      const a = await this.alertCtrl.create({
        header: 'Required',
        message: 'Amount and Reference No. are mandatory.',
        buttons: ['OK']
      });
      return a.present();
    }

    this.isSubmitting = true;
    this.MandirTransaction = {
      TenantID: 1,
      MandirID: 0,
      UserID: this.selectedPandit.UserID,
      DonorName: this.payDonorName,
      PaymentMode: this.PaymentMode,
      UpdatedByUser: this.payDonorName,
      Phone: this.payPhone,
      UniqueReferenceNo: this.payRefNo,
      OrderID: this.payRefNo,
      PaymentStatus: 'Success',
      TransactionType: 'MangalBhavDakshina',
      ServiceName: 'MangalBhavDakshina',
      Amount: String(this.payAmount),
      Remarks: `Dakshina for Pandit: ${this.selectedPandit.FullName}`,
      DateAdded: new Date(),
      DateModified: new Date()
    };

    this.apinu.postUrlData('MandirTransactionsInsert', this.MandirTransaction)
      .subscribe({
        next: async () => {
          this.isSubmitting = false;
          this.payAmount = ''; this.payRefNo = '';
          this.payDonorName = ''; this.payPhone = '';
          this.loadPanditTransactions(this.selectedPandit.UserID);
          const a = await this.alertCtrl.create({
            header: '✅ Dakshina Recorded',
            message: `₹${this.MandirTransaction.Amount} recorded for ${this.selectedPandit.FullName}.`,
            buttons: ['OK']
          });
          a.present();
        },
        error: async () => {
          this.isSubmitting = false;
          const a = await this.alertCtrl.create({
            header: 'Error', message: 'Failed to record. Try again.', buttons: ['OK']
          });
          a.present();
        }
      });
  }

  ngOnInit() {

    this.apinu.postUrlData('GetPanditDetails', null).subscribe({
      next: (res: any) => {
        let data: any = res;

        // Unwrap if the response came back as a raw JSON string
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            data = [];
          }
        }

        // Defensive: handle accidental double-array wrapping
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }

        this.panditList = data ?? [];
        this.displayList = [...this.panditList];

        console.log('Pandit List:', this.panditList);
      },
      error: (err: any) => {
        console.error('GetPanditDetails error', err);
        this.panditList = [];
        this.displayList = [];
      }
    });
  }

  async login(loginUsername: any) {
    await this.storage.clear();
    this.apinu.postUrlData(`VedantaLogin?UserName=${loginUsername}`, null)
      .subscribe(async (res: any) => {
        console.log(res)
        if (res) {
          //  this.fcm.initPush(res.UserID);

          await this.storage.set("account", res);
          await this.storage.set("IsUserLoggedIn", "true");
          await this.storage.set("Language", res.Languages);
          this.routerCtrl.navigateForward('/tabs/tab1');

        }
      })
  }

  openReferralPopup(pandit: any) {
    this.selectedReferralPandit = pandit;
    this.referralCode = '';
    this.referrerUserID = 0;
    this.referralPopupOpen = true;
  }

  closeReferralPopup() {
    this.referralPopupOpen = false;
  }

  async submitReferral() {

    if (!this.referralCode.trim()) {

      const alert = await this.alertCtrl.create({
        header: 'Referral Code',
        message: 'Please enter referral code.',
        buttons: ['OK']
      });

      return alert.present();
    }

    // validate referral code
    this.apinu.postUrlData(
      `UserReferralCodeSelectByQuery?Query=ReferralCode='${this.referralCode.trim().toUpperCase()}'`,
      null
    ).subscribe(async (res: any) => {

      if (!res.UserReferralCodeList || res.UserReferralCodeList.length == 0) {

        const a = await this.alertCtrl.create({
          header: 'Invalid',
          message: 'Referral code not found.',
          buttons: ['OK']
        });

        return a.present();
      }

      this.referrerUserID = res.UserReferralCodeList[0].UserID;

      // don't allow self referral
      if (this.referrerUserID == this.selectedReferralPandit.UserID) {

        const a = await this.alertCtrl.create({
          header: 'Invalid',
          message: 'A user cannot refer themselves.',
          buttons: ['OK']
        });

        return a.present();
      }

      // confirmation
      const confirm = await this.alertCtrl.create({
        header: 'Confirm Referral',
        message:
          `Are you sure you want to link referral code <b>${this.referralCode.toUpperCase()}</b> with <b>${this.selectedReferralPandit.FullName}</b>?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Yes',
            handler: () => {

              const body = {
                ReferrerUserID: this.referrerUserID,
                ReferredUserID: this.selectedReferralPandit.UserID,
                ReferralCode: this.referralCode.trim().toUpperCase(),
                ReferralDate: new Date()
              };

              this.apinu.postUrlData(
                `UserReferralHistorySelectByQuery?Query=ReferredUserID='${this.selectedReferralPandit.UserID}'`,
                null
              )
                .subscribe(async (history: any) => {

                  if (history.UserReferralHistoryList?.length) {

                    const a = await this.alertCtrl.create({
                      header: 'Already Referred',
                      message: 'This pandit already has a referral linked.',
                      buttons: ['OK']
                    });

                    return a.present();
                  }

                  // continue with confirmation & insert

                });

              this.apinu.postUrlData(
                'UserReferralHistoryInsert',
                body
              ).subscribe(async () => {

                this.closeReferralPopup();

                const success = await this.alertCtrl.create({
                  header: 'Success',
                  message: 'Referral added successfully.',
                  buttons: ['OK']
                });

                success.present();

              });

            }
          }
        ]
      });

      confirm.present();

    });

  }

  async showToastMessage(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | 'light' | 'dark' = 'primary'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      icon:
        color === 'success'
          ? 'checkmark-circle'
          : color === 'danger'
            ? 'close-circle'
            : color === 'warning'
              ? 'warning'
              : 'information-circle',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  async saveVerification() {

    if (!this.verificationStatus) {
      return this.showToastMessage(
        'Please select verification status.',
        'warning'
      );
    }

    const confirm = await this.alertCtrl.create({
      header: 'Confirm Verification',
      message: `Are you sure you want to mark <b>${this.selectedVerificationPandit.FullName}</b> as <b>${this.verificationStatus}</b>?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {

            // Load profile first
            this.apinu.postUrlData(
              `ProfilesNUSelectByQuery?Query=UserID=${this.selectedVerificationPandit.UserID}`,
              null
            ).subscribe((res: any) => {

              if (!res.ProfileList || res.ProfileList.length === 0) {
                this.showToastMessage('Profile not found.', 'danger');
                return;
              }

              const profile = {
                ...res.ProfileList[0],
                VerificationStatus: this.verificationStatus,
                DateModified: new Date(),
                UpdatedByUser: 'ADMIN' // or logged in UserID
              };

              this.apinu.postUrlData(
                'ProfilesUpdate',
                profile
              ).subscribe(() => {

                // Update UI immediately
                this.selectedVerificationPandit.VerificationStatus = this.verificationStatus;

                this.closeVerificationPopup();

                this.showToastMessage(
                  `Verification status updated to ${this.verificationStatus}.`,
                  'success'
                );

              });

            });

          }
        }
      ]
    });

    confirm.present();
  }
  openVerificationPopup(pandit: any) {
    this.selectedVerificationPandit = pandit;
    this.verificationStatus = pandit.VerificationStatus || '';
    this.verificationRemarks = '';
    this.verificationPopupOpen = true;
  }

  closeVerificationPopup() {
    this.verificationPopupOpen = false;
  }

}
