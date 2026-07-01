import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ApiNU } from '../../providers';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-mandir-ledger',
  templateUrl: './mandir-ledger.component.html',
  styleUrls: ['./mandir-ledger.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MandirLedgerComponent implements OnInit, OnDestroy {

  // ── Pending Mandirs state ─────────────────────────────────
  pendingMandirList: any[] = [];
  isLoadingPending = false;
  // ── add property near other state vars ──
  bankDetails: any = null;
  isLoadingBank = false;
  // ── Ledger state ──────────────────────────────────────────
  currentSection: 'pending' | 'ledger' | 'payEntry' = 'pending';
  selectedMandir: any = null;
  ledgerList: any[] = [];
  isLoadingLedger = false;

  // ── Pay Entry form ────────────────────────────────────────
  payForm = {
    Amount: null as number | null,
    PaymentReferenceNo: '',
    Remarks: '',
    UpdatedByUser: '',
  };
  isSaving = false;

  // ── Computed ──────────────────────────────────────────────
  get totalDue(): number {
    return this.ledgerList
      .filter(t => !t.IsCancelled && !t.IsPaid)
      .reduce((s, t) => s + (t.Amount || 0), 0);
  }

  get unpaidCount(): number {
    return this.ledgerList.filter(t => !t.IsCancelled && !t.IsPaid).length;
  }

  private destroy$ = new Subject<void>();

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadPendingMandirs();
  }

  // ── Pending Mandirs ───────────────────────────────────────

  // ── Pending Mandirs ───────────────────────────────────────
  loadPendingMandirs() {
    this.isLoadingPending = true;
    const query = `IsPaid <> 1 AND IsCancelled <> 1`;
    this.apinu
      .postUrlData(`MandirLedgerSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          const rows: any[] = res?.MandirLedgerList ?? [];

          // Group by MandirID and aggregate (no MandirName yet)
          const map = new Map<number, any>();
          for (const row of rows) {
            const id = row.MandirID;
            if (!map.has(id)) {
              map.set(id, {
                MandirID: id,
                MandirName: `Mandir #${id}`,   // placeholder until fetched
                GodName: '',
                Address: '',
                IsVerified: false,
                dueAmount: 0,
                dueCount: 0,
              });
            }
            const entry = map.get(id)!;
            entry.dueAmount += row.Amount || 0;
            entry.dueCount += 1;
          }

          this.pendingMandirList = Array.from(map.values());

          // Now fetch real Mandir details for all collected IDs
          const ids = Array.from(map.keys());
          if (ids.length > 0) {
            this.fetchMandirDetails(ids);
          } else {
            this.isLoadingPending = false;
          }
        },
        error: () => {
          this.pendingMandirList = [];
          this.isLoadingPending = false;
        }
      });
  }

  // Fetch mandir names/details for given IDs and enrich pendingMandirList
  private fetchMandirDetails(ids: number[]) {
    const query = `MandirID IN (${ids.join(',')})`;
    this.apinu
      .postUrlData(`MandirSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          const mandirs: any[] = res?.MandirList ?? [];

          // Build a lookup map by MandirID
          const mandirMap = new Map<number, any>();
          for (const m of mandirs) {
            mandirMap.set(m.MandirID, m);
          }

          // Enrich pendingMandirList with real names
          this.pendingMandirList = this.pendingMandirList.map(entry => {
            const m = mandirMap.get(entry.MandirID);
            if (m) {
              entry.MandirName = m.MandirName || entry.MandirName;
              entry.GodName = m.GodName || '';
              entry.Address = m.Address || '';
              entry.IsVerified = m.IsVerified ?? false;
            }
            return entry;
          });

          this.isLoadingPending = false;
        },
        error: () => {
          // Names stay as placeholders, still show the list
          this.isLoadingPending = false;
        }
      });
  }

  // ── Ledger ────────────────────────────────────────────────
  openLedger(mandir: any) {
    this.selectedMandir = mandir;
    this.ledgerList = [];
    this.currentSection = 'ledger';
    this.loadUnpaidLedger(mandir.MandirID);
  }

  loadUnpaidLedger(mandirID: number | string) {
    this.isLoadingLedger = true;
    const query = `MandirID=${mandirID} AND IsPaid <> 1 AND IsCancelled <> 1`;
    this.apinu
      .postUrlData(`MandirLedgerSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      .subscribe({
        next: (res: any) => {
          this.ledgerList = res?.MandirLedgerList ?? [];
          this.isLoadingLedger = false;
        },
        error: () => {
          this.ledgerList = [];
          this.isLoadingLedger = false;
        }
      });
  }

  backToPending() {
    this.currentSection = 'pending';
    this.selectedMandir = null;
    this.ledgerList = [];
    this.loadPendingMandirs(); // refresh in case something was paid
  }

  // ── Pay Entry ─────────────────────────────────────────────
  // openPayEntry() {
  //   this.payForm = {
  //     Amount: this.totalDue,   // pre-fill with current due
  //     PaymentReferenceNo: '',
  //     Remarks: '',
  //     UpdatedByUser: '8796917944',
  //   };
  //   this.currentSection = 'payEntry';
  // }

  async savePayEntry() {
    if (!this.payForm.Amount || this.payForm.Amount <= 0) {
      this.showToast('Please enter a valid amount', 'warning'); return;
    }
    if (!this.payForm.UpdatedByUser?.trim()) {
      this.showToast('Please enter your name', 'warning'); return;
    }

    this.isSaving = true;
    const now = new Date().toISOString();

    const payload = {
      TenantID: 1,
      MandirID: this.selectedMandir.MandirID,
      TransactionID: 0,
      EntryType: 'PAID',
      SourceType: 'Payment to Mandir',
      Amount: this.payForm.Amount,
      BankAccountID: 0,
      PaymentReferenceNo: this.payForm.PaymentReferenceNo?.trim() || '',
      Remarks: this.payForm.Remarks?.trim() || '',
      IsPaid: true,
      IsCancelled: false,
      DateAdded: now,
      DateModified: now,
      UpdatedByUser: '8796917944',
    };

    this.apinu.postUrlData('MandirLedgerInsert', payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.showToast('Payment recorded successfully 🙏', 'success');
        this.currentSection = 'ledger';
        this.loadUnpaidLedger(this.selectedMandir.MandirID);
      },
      error: () => {
        this.isSaving = false;
        this.showToast('Failed to save. Please try again.', 'danger');
      }
    });
  }

  cancelPayEntry() {
    this.currentSection = 'ledger';
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'bottom' });
    t.present();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openPayEntry() {
  this.payForm = {
    Amount: this.totalDue,
    PaymentReferenceNo: '',
    Remarks: '',
    UpdatedByUser: '8796917944',
  };
  this.bankDetails = null;          // ← reset
  this.currentSection = 'payEntry';
  this.fetchBankDetails(this.selectedMandir.MandirID);   // ← fetch
}

private fetchBankDetails(mandirId: number) {
  this.isLoadingBank = true;
  this.apinu.postUrlData(
    `BankDetailsSelectByQuery?Query= MandirID = ${mandirId}`, null
  ).subscribe({
    next: (res: any) => {
      const list = res?.BankDetailList ?? res ?? [];
      this.bankDetails = Array.isArray(list) ? list[0] : list;  // take first record
      this.isLoadingBank = false;
    },
    error: () => { this.isLoadingBank = false; }
  });
}
}