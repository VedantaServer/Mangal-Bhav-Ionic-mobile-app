import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from '../../providers';
import { AlertController } from '@ionic/angular';

export interface ReportOption {
  label: string;
  labelHi: string;
  value: string;
  apiUrl: string;
  filters: ('dateRange' | 'name' | 'phone' | 'state' | 'status')[];
}

@Component({
  selector: 'app-admin-reposrts',
  templateUrl: './admin-reposrts.component.html',
  styleUrls: ['./admin-reposrts.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminReposrtsComponent implements OnInit {

  reportOptions: ReportOption[] = [
    {
      label: 'User Referral History Report',
      labelHi: 'यूजर रेफरल इतिहास रिपोर्ट',
      value: 'UserReferralHistoryReport',
      apiUrl: 'UserReferralHistoryReport',
      filters: ['dateRange', 'name', 'phone', 'state']
    },
    {
      label: 'User Referral Summary Report',
      labelHi: 'यूजर रेफरल सारांश रिपोर्ट',
      value: 'UserReferralSummaryReport',
      apiUrl: 'UserReferralSummaryReport',
      filters: ['dateRange', 'name', 'phone', 'state']
    },
    {
      label: 'Booking Report',
      labelHi: 'बुकिंग रिपोर्ट',
      value: 'BookingReport',
      apiUrl: 'BookingReport',
      filters: ['dateRange', 'name', 'phone', 'state', 'status']
    }
  ];

  selectedReport: string | null = null;

  isLoading = false;
  loadError = false;
  hasSearched = false;

  reportData: any[] = [];
  reportColumns: string[] = [];

  // ── Filter model — shared shape, only relevant fields are shown/sent per report ──
  filters = {
    dateFrom: '',   // yyyy-MM-dd
    dateTo: '',     // yyyy-MM-dd
    name: '',
    phone: '',
    state: '',
    status: ''      // Booking only: Pending / Confirmed / Completed / Cancelled etc.
  };

  bookingStatusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  constructor(
    public apinu: ApiNU,
    public api: Api,
    private alertCtrl: AlertController,public routerCtrl: NavController,
  ) { }

  ngOnInit() {
  }

  get selectedReportOption(): ReportOption | undefined {
    return this.reportOptions.find(r => r.value === this.selectedReport);
  }

  showFilter(key: 'dateRange' | 'name' | 'phone' | 'state' | 'status'): boolean {
    return !!this.selectedReportOption?.filters.includes(key);
  }

  onReportChange() {
    this.reportData = [];
    this.reportColumns = [];
    this.hasSearched = false;
    this.loadError = false;
    this.resetFilters();
  }

  resetFilters() {
    this.filters = { dateFrom: '', dateTo: '', name: '', phone: '', state: '', status: '' };
  }

  async onGoClick() {
    if (!this.selectedReport) {
      const alert = await this.alertCtrl.create({
        header: 'Select Report',
        message: 'Please select a report type before clicking Go.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.loadReport();
  }

  private buildFilterQueryString(): string {
    const params: string[] = [];
    const opt = this.selectedReportOption;
    if (!opt) return '';

    if (opt.filters.includes('dateRange')) {
      if (this.filters.dateFrom) params.push(`DateFrom=${encodeURIComponent(this.filters.dateFrom)}`);
      if (this.filters.dateTo) params.push(`DateTo=${encodeURIComponent(this.filters.dateTo)}`);
    }
    if (opt.filters.includes('name') && this.filters.name.trim()) {
      params.push(`Name=${encodeURIComponent(this.filters.name.trim())}`);
    }
    if (opt.filters.includes('phone') && this.filters.phone.trim()) {
      params.push(`Phone=${encodeURIComponent(this.filters.phone.trim())}`);
    }
    if (opt.filters.includes('state') && this.filters.state.trim()) {
      params.push(`State=${encodeURIComponent(this.filters.state.trim())}`);
    }
    if (opt.filters.includes('status') && this.filters.status.trim()) {
      params.push(`Status=${encodeURIComponent(this.filters.status.trim())}`);
    }

    return params.length ? `?${params.join('&')}` : '';
  }

  loadReport() {
    const selected = this.selectedReportOption;
    if (!selected) return;

    this.isLoading = true;
    this.loadError = false;
    this.hasSearched = true;
    this.reportData = [];
    this.reportColumns = [];

    const qs = this.buildFilterQueryString();

    this.apinu.postUrlData(`${selected.apiUrl}${qs}`, null).subscribe({
      next: (res: any) => {
        let data: any = res;

        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch { data = null; }
        }

        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }

        this.reportData = Array.isArray(data) ? data : (data ? [data] : []);
        this.reportColumns = this.reportData.length ? Object.keys(this.reportData[0]) : [];

        console.log(`${selected.apiUrl} response:`, JSON.stringify(this.reportData));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(`${selected.apiUrl} error:`, err);
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  refreshReport(event?: any) {
    if (this.selectedReport) {
      this.loadReport();
    }
    if (event) event.target.complete();
  }

  clearFilters() {
    this.resetFilters();
    if (this.hasSearched) this.loadReport(); // re-run unfiltered if a search was already done
  }

  exportToExcel() {
    if (!this.reportData.length) return;

    const headers = this.reportColumns.join(',');
    const rows = this.reportData.map(row =>
      this.reportColumns.map(col => `"${row[col] ?? ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selectedReport}_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}