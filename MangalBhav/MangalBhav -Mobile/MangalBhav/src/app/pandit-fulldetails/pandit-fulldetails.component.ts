import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
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

  constructor(public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api, private fcm: FcmService,
    private storage: Storage, private router: Router,
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
      TenantID : 1,
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

    this.apinu.postUrlData('GetPanditDetails', null)
      .subscribe((res: any) => {
        console.log(res)
        this.panditList = res;
        this.displayList = res;
      })
  }

  async login(loginUsername: any) {
    await this.storage.clear();
    this.apinu.postUrlData(`VedantaLogin?UserName=${loginUsername}`, null)
      .subscribe(async (res: any) => {
        console.log(res)
        if (res) {
          //  this.fcm.initPush(res.UserID);
          if (res.Role == 'PANDIT') {
            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateForward('/tabs/tab1');
          } else {

            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateForward('/jajmandashboard');
          }
        }
      })
  }
}
