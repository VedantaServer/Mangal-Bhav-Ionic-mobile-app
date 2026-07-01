import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from '../../providers';
import { AlertController } from '@ionic/angular';

export interface ReportOption {
  label: string;
  labelHi: string;
  value: string;
  apiUrl: string;
}

@Component({
  selector: 'app-admin-reposrts',
  templateUrl: './admin-reposrts.component.html',
  styleUrls: ['./admin-reposrts.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminReposrtsComponent implements OnInit {

  // Report dropdown options
  reportOptions: ReportOption[] = [
    {
      label: 'User Referral History Report',
      labelHi: 'यूजर रेफरल इतिहास रिपोर्ट',
      value: 'UserReferralHistoryReport',
      apiUrl: 'UserReferralHistoryReport'
    },
    {
      label: 'User Referral Summary Report',
      labelHi: 'यूजर रेफरल सारांश रिपोर्ट',
      value: 'UserReferralSummaryReport',
      apiUrl: 'UserReferralSummaryReport'
    },
    {
      label: 'Booking Report',
      labelHi: 'बुकिंग रिपोर्ट',
      value: 'BookingReport',
      apiUrl: 'BookingReport'
    }
  ];

  selectedReport: string | null = null;

  isLoading = false;
  loadError = false;
  hasSearched = false;

  reportData: any[] = [];
  reportColumns: string[] = [];

  constructor(
    public apinu: ApiNU,
    public api: Api,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  onReportChange() {
    // Reset previous results whenever the user picks a different report
    this.reportData = [];
    this.reportColumns = [];
    this.hasSearched = false;
    this.loadError = false;
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

  loadReport() {
    const selected = this.reportOptions.find(r => r.value === this.selectedReport);
    if (!selected) return;

    this.isLoading = true;
    this.loadError = false;
    this.hasSearched = true;
    this.reportData = [];
    this.reportColumns = [];

    // Called without any parameters, as per your API pattern
    this.apinu.postUrlData(selected.apiUrl, null).subscribe({
      next: (res: any) => {
        let data: any = res;

        // Unwrap if the response came back as a raw JSON string
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            data = null;
          }
        }

        // Handle accidental double-array wrapping
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }

        this.reportData = Array.isArray(data) ? data : (data ? [data] : []);

        // Derive table columns dynamically from the first row's keys
        this.reportColumns = this.reportData.length
          ? Object.keys(this.reportData[0])
          : [];

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