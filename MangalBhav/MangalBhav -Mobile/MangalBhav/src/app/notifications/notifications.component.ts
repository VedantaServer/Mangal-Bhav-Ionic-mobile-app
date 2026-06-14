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

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CommonBottomTabsComponent, TabscommonheaderComponent]
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
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.apinu.postUrlData(
      `NotificationQueueSelectByQuery?Query=UserID=${this.userDetails.UserID} and Isseen = 0 ORDER BY ID DESC`,
      null
    ).subscribe((res: any) => {
      this.notifications = res?.NotificationQueueList ?? [];
      this.isLoading = false;
      this.markAllSeen();
    }, () => {
      this.isLoading = false;
    });
  }

  markAllSeen() {
    const unread = this.notifications.filter(n => !n.IsSeen);
    if (unread.length === 0) return;
    this.apinu.postUrlData(
      `MarkNotificationsSeen?UserID=${this.userDetails.UserID}&flag=${Number(0)}`,
      null
    ).subscribe();
  }

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
}