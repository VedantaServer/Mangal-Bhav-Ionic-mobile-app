import { Component, OnInit } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class NotificationsComponent implements OnInit {

  userDetails: any;
  notifications: any[] = [];
  isLoading = true;

  constructor(
    private alertCtrl: AlertController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  // async ngOnInit() {
  //   this.userDetails = await this.storage.get('account');
  //   this.loadNotifications();
  // }

  // loadNotifications() {
  //   this.isLoading = true;

  //   this.apinu.postUrlData(
  //     `NotificationQueueSelectByQuery?Query=UserID=${this.userDetails.UserID} AND CreatedDate >= DATEADD(DAY,-1,CAST(GETDATE() AS DATE)) ORDER BY ID DESC`,
  //     null
  //   ).subscribe((res: any) => {
  //     this.notifications = res?.NotificationQueueList ?? [];
  //     this.isLoading = false;
  //     this.markAllSeen();
  //   }, () => {
  //     this.isLoading = false;
  //   });
  // }

  markAllSeen() {
    const unread = this.notifications.filter(n => !n.IsSeen);
    if (unread.length === 0) return;
    this.apinu.postUrlData(
      `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&flag=${Number(0)}`,
      null
    ).subscribe();
  }



  // openNotification(notification: any) {

  //   switch (notification.NotificationType) {

  //     case 'BOOKING':
  //     case 'BOOKING_STATUS':
  //       this.routerCtrl.navigateForward('/booking');
  //       break;

  //     case 'PROFILE_LIKE':
  //     case 'PROFILE_VIEW':
  //     case 'PROFILE_SHARE':
  //       this.routerCtrl.navigateForward('/open-find-pandit');
  //       break;

  //     case 'DONATION':
  //       this.routerCtrl.navigateForward('/mytransaction');
  //       break;

  //     case 'FESTIVAL':
  //       this.routerCtrl.navigateForward('/india-festival');
  //       break;

  //     case 'CHAT':
  //       this.routerCtrl.navigateForward('/allchats');
  //       break;

  //     default:
  //       console.log('No navigation configured for:', notification.NotificationType);
  //       break;
  //   }
  // }



  // ── Helpers ──────────────────────────────────────────────

  getTypeConfig(type: string): { icon: string; label: string; color: string } {
    switch (type) {
      case 'FESTIVAL':
        return { icon: '🌺', label: 'Festival', color: 'festival' };
      case 'BOOKING_STATUS':
        return { icon: '📅', label: 'Booking', color: 'booking' };
      case 'SEVA':
        return { icon: '🕉️', label: 'Seva', color: 'seva' };
      case 'REMINDER':
        return { icon: '⏰', label: 'Reminder', color: 'reminder' };
      default:
        return { icon: '🔔', label: 'Update', color: 'default' };
    }
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  goBack() {
    this.routerCtrl.back();
  }


  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;

    this.apinu.postUrlData(
      `NotificationQueueSelectByQuery?Query=UserID=${this.userDetails.UserID} and IsSeen <> 1  ORDER BY ID DESC`,
      null
    ).subscribe((res: any) => {
      const all = res?.NotificationQueueList ?? [];
      this.notifications = all.filter((n: any) => !n.IsSeen);
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  // markOneSeen(notification: any) {
  //   if (notification.IsSeen) return;

  //   const index = this.notifications.indexOf(notification);
  //   if (index > -1) this.notifications.splice(index, 1); // optimistic remove

  //   this.apinu.postUrlData(
  //     `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&NotificationID=${notification.ID}`,
  //     null
  //   ).subscribe({
  //     error: () => {
  //       if (index > -1) this.notifications.splice(index, 0, notification); // rollback
  //     }
  //   });
  // }

  // clearAll() {
  //   if (this.notifications.length === 0) return;

  //   const backup = [...this.notifications];
  //   this.notifications = []; // optimistic clear

  //   this.apinu.postUrlData(
  //     `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&flag=${Number(0)}`,
  //     null
  //   ).subscribe({
  //     error: () => {
  //       this.notifications = backup; // rollback
  //     }
  //   });
  // }

  openNotification(notification: any) {
    this.markOneSeen(notification);

    switch (notification.NotificationType) {
      case 'BOOKING':
      case 'BOOKING_STATUS':
        this.routerCtrl.navigateForward('/booking');
        break;
      case 'PROFILE_LIKE':
      case 'PROFILE_VIEW':
      case 'PROFILE_SHARE':
        this.routerCtrl.navigateForward('/open-find-pandit');
        break;
      case 'DONATION':
        this.routerCtrl.navigateForward('/mytransaction');
        break;
      case 'FESTIVAL':
        this.routerCtrl.navigateForward('/india-festival');
        break;
      case 'CHAT':
        this.routerCtrl.navigateForward('/allchats');
        break;
      default:
        console.log('No navigation configured for:', notification.NotificationType);
        break;
    }
  }




  markOneSeen(notification: any) {
    if (notification.IsSeen) return;

    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications = this.notifications.filter(n => n !== notification); // new array ref
    }
    this.cdr.markForCheck();

    this.apinu.postUrlData(
      `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&flag=${notification.ID}`,
      null
    ).subscribe({
      error: () => {
        this.notifications = [...this.notifications, notification];
        this.cdr.markForCheck();
      }
    });
  }

  clearAll() {
    if (this.notifications.length === 0) return;

    const backup = [...this.notifications];
    this.notifications = [];
    this.cdr.markForCheck();

    this.apinu.postUrlData(
      `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&flag=${Number(0)}`,
      null
    ).subscribe({
      error: () => {
        this.notifications = [];
        this.cdr.markForCheck();
      }
    });
  }
}