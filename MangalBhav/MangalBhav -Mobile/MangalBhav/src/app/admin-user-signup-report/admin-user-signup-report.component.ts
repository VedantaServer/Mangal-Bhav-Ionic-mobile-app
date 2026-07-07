import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-admin-user-signup-report',
  templateUrl: './admin-user-signup-report.component.html',
  styleUrls: ['./admin-user-signup-report.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminUserSignupReportComponent implements OnInit {

  isLoading = false;
  loadError = false;
  hasSearched = false;

  reportData: any[] = [];
  reportColumns: string[] = [];

  filters = {
    dateAdded: '',
    role: ''
  };

  roleOptions = [
    'PANDIT',
    'BHAKT'
  ];

  isLoadingUsers = false;
  showUserDetails = false;
  userDetailsList: any[] = [];
  selectedRole = '';
  selectedDateDisplay = '';
  constructor(
    public apinu: ApiNU,
    public api: Api,
    private alertCtrl: AlertController, public routerCtrl: NavController,
  ) { }

  ngOnInit() {
  }

  async onGoClick() {
    this.loadReport();
  }

  private buildQueryString(): string {
    const params: string[] = [];

    if (this.filters.dateAdded) {
      params.push(`DateAdded=${encodeURIComponent(this.filters.dateAdded)}`);
    }

    if (this.filters.role) {
      params.push(`Role=${encodeURIComponent(this.filters.role)}`);
    }

    return params.length ? `?${params.join('&')}` : '';
  }

  loadReport() {

    this.isLoading = true;
    this.loadError = false;
    this.hasSearched = true;

    this.reportData = [];
    this.reportColumns = [];

    const qs = this.buildQueryString();

    this.apinu.postUrlData(`UsersSignupCountByDateAndRole${qs}`, null).subscribe({
      next: (res: any) => {

        let data: any = res;

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            data = null;
          }
        }

        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }

        this.reportData = Array.isArray(data) ? data : (data ? [data] : []);
        this.reportColumns = this.reportData.length ? Object.keys(this.reportData[0]) : [];

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  refreshReport(event?: any) {
    this.loadReport();

    if (event) {
      event.target.complete();
    }
  }

  clearFilters() {
    this.filters = {
      dateAdded: '',
      role: ''
    };

    this.loadReport();
  }

  exportToExcel() {

    if (!this.reportData.length) {
      return;
    }

    const headers = this.reportColumns.join(',');

    const rows = this.reportData.map(row =>
      this.reportColumns.map(col => `"${row[col] ?? ''}"`).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `UserSignupReport_${new Date().getTime()}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  onRowClick(row: any) {
    const role = row['Role'];
    const rawDate = row['SignupDate'];

    if (!role || !rawDate) {
      console.warn('Row missing Role or SignupDate, cannot fetch user details.', row);
      return;
    }

    const dateObj = new Date(rawDate);
    const dateStr =
      `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    this.selectedRole = role;
    this.selectedDateDisplay = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    this.fetchUserDetails(role, dateStr);
  }

  // private fetchUserDetails(role: string, dateStr: string) {
  //   this.isLoadingUsers = true;
  //   this.showUserDetails = false;
  //   this.userDetailsList = [];

  //   const query = `Role = '${role}' and cast(dateadded as date) = cast('${dateStr}' as date)`;

  //   this.apinu.postUrlData(
  //     `UsersNUSelectByQuery?Query=${encodeURIComponent(query)}`,
  //     null
  //   ).subscribe({
  //     next: (res: any) => {
  //       this.isLoadingUsers = false;

  //       let data: any = res;
  //       if (typeof data === 'string') {
  //         try { data = JSON.parse(data); } catch { data = null; }
  //       }
  //       if (Array.isArray(data) && Array.isArray(data[0])) {
  //         data = data[0];
  //       }

  //       this.userDetailsList = Array.isArray(data) ? data : (data ? [data] : []);
  //       this.showUserDetails = true;
  //     },
  //     error: (err: any) => {
  //       this.isLoadingUsers = false;
  //       console.error('UsersNUSelectByQuery failed:', err);
  //       this.showUserDetails = true;
  //       this.userDetailsList = [];
  //     }
  //   });
  // }

  private fetchUserDetails(role: string, dateStr: string) {
    this.isLoadingUsers = true;
    this.showUserDetails = false;
    this.userDetailsList = [];

    const query = `Role = '${role}' and cast(dateadded as date) = cast('${dateStr}' as date)`;

    this.apinu.postUrlData(
      `UsersNUSelectByQuery?Query=${encodeURIComponent(query)}`,
      null
    ).subscribe({
      next: (res: any) => {

        let data: any = res;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch { data = null; }
        }

        const rawList: any[] = data?.UserList || [];

        if (!rawList.length) {
          this.isLoadingUsers = false;
          this.showUserDetails = true;
          this.userDetailsList = [];
          return;
        }

        // For each user, fetch their profile in parallel
        const profileRequests = rawList.map((u: any) =>
          this.apinu.postUrlData(`ProfilesSelectAllByUserID?userId=${u.UserID}`, null).pipe(
            catchError(err => {
              console.error(`ProfilesSelectAllByUserID failed for UserID ${u.UserID}:`, err);
              return of(null);
            })
          )
        );

        forkJoin(profileRequests).subscribe((profileResults: any[]) => {

          this.userDetailsList = rawList.map((u: any, i: number) => {
            let profileData: any = profileResults[i];

            if (typeof profileData === 'string') {
              try { profileData = JSON.parse(profileData); } catch { profileData = null; }
            }

            const profileList = profileData?.ProfileList || [];
            const profile = Array.isArray(profileList) ? profileList[0] : profileList;

            return {
              ...u,
              ...(profile || {})
            };
          });

          this.isLoadingUsers = false;
          this.showUserDetails = true;
        });
      },
      error: (err: any) => {
        this.isLoadingUsers = false;
        console.error('UsersNUSelectByQuery failed:', err);
        this.showUserDetails = true;
        this.userDetailsList = [];
      }
    });
  }
}