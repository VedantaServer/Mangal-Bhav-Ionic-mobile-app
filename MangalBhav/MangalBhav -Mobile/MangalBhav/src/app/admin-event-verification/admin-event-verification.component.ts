import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';

@Component({
  selector: 'app-admin-event-verification',
  templateUrl: './admin-event-verification.component.html',
  styleUrls: ['./admin-event-verification.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    
  ]
})
export class AdminEventVerificationComponent implements OnInit {

  userDetails: any;

  // ── Events ────────────────────────────────────────────
  allEvents: any[] = [];
  filteredEvents: any[] = [];
  isLoading = false;

  // ── Search ────────────────────────────────────────────
  searchQuery = '';

  // ── Tabs: Pending / All-Unverified ────────────────────
  activeTab: 'Pending' | 'Rejected' = 'Pending';

  // ── Expanded card ─────────────────────────────────────
  expandedEventID: number | null = null;

  // ── Per-card admin remarks ─────────────────────────────
  adminRemarksMap: { [key: number]: string } = {};

  // ── Updating state ────────────────────────────────────
  updatingEventID: number | null = null;

  get pendingCount(): number {
    return this.allEvents.filter(e => e.EventStatus === 'Pending').length;
  }

  get rejectedCount(): number {
    return this.allEvents.filter(e => e.EventStatus === 'Rejected').length;
  }

  constructor(
    public api: Api,
    public apinu: ApiNU,
    public routerCtrl: NavController,
    private storage: Storage,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.loadPendingEvents();
  }

  // ── Load all non-Verified events ──────────────────────
  loadPendingEvents() {
    this.isLoading = true;
    this.allEvents = [];
    this.filteredEvents = [];
    const tenantID = this.userDetails?.TenantID || 1;

    this.apinu.postUrlData(
      `MandirEventSelectByQuery?tenantID=${tenantID}&schoolID=0&Query=EventStatus='Pending' OR EventStatus='Rejected'`,
      null
    ).subscribe({
      next: (res: any) => {
        const rawEvents: any[] = res.MandirEventList || [];

        if (!rawEvents.length) {
          this.allEvents = [];
          this.isLoading = false;
          this.applyFilter();
          return;
        }

        this.allEvents = rawEvents.map(e => ({ ...e }));

        // Batch-enrich each unique MandirID
        const uniqueMandirIDs: number[] = [
          ...new Set<number>(rawEvents.map((e: any) => e.MandirID as number))
        ];

        let loadedCount = 0;

        uniqueMandirIDs.forEach((mandirID: number) => {
          this.apinu.postUrlData(
            `MandirSelectByQuery?Query=mandirID=${mandirID}`,
            null
          ).subscribe({
            next: (mandirRes: any) => {
              const mandir = mandirRes?.MandirList?.[0];
              if (mandir) {
                this.allEvents = this.allEvents.map(ev =>
                  ev.MandirID === mandirID ? { ...ev, _mandir: mandir } : ev
                );
              }
              loadedCount++;
              if (loadedCount === uniqueMandirIDs.length) {
                this.isLoading = false;
                this.applyFilter();
                this.allEvents.forEach(ev => this.loadEventPhoto(ev));
              }
            },
            error: () => {
              loadedCount++;
              if (loadedCount === uniqueMandirIDs.length) {
                this.isLoading = false;
                this.applyFilter();
              }
            }
          });
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadEventPhoto(ev: any) {
    if (!ev.EventCardPhoto1) return;
    this.api.getImage('DownloadImages', {
      imageName: ev.EventCardPhoto1,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          ev.photoUrl = URL.createObjectURL(blob);
          this.allEvents = [...this.allEvents];
          this.applyFilter();
        }
      },
      error: () => {}
    });
  }

  // ── Tab switch ────────────────────────────────────────
  switchTab(tab: 'Pending' | 'Rejected') {
    this.activeTab = tab;
    this.expandedEventID = null;
    this.applyFilter();
  }

  // ── Search ────────────────────────────────────────────
  onSearchChange() {
    this.applyFilter();
  }

  applyFilter() {
    let source = this.allEvents.filter(e => e.EventStatus === this.activeTab);

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      source = source.filter(ev =>
        ev.EventName?.toLowerCase().includes(q) ||
        ev.EventType?.toLowerCase().includes(q) ||
        ev._mandir?.MandirName?.toLowerCase().includes(q) ||
        ev.EventOrganizerName1?.toLowerCase().includes(q) ||
        ev._mandir?.City?.toLowerCase().includes(q) ||
        ev._mandir?.State?.toLowerCase().includes(q)
      );
    }

    this.filteredEvents = source;
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilter();
  }

  // ── Card expand/collapse ───────────────────────────────
  toggleExpand(eventID: number) {
    this.expandedEventID = this.expandedEventID === eventID ? null : eventID;
  }

  isExpanded(eventID: number): boolean {
    return this.expandedEventID === eventID;
  }

  // ── Verify / Reject ────────────────────────────────────
  updateEventStatus(ev: any, newStatus: 'Verified' | 'Rejected') {
    this.updatingEventID = ev.MandirEventID;

    const payload = { ...ev };
    delete payload._mandir;
    delete payload.photoUrl;

    payload.EventStatus = newStatus;
    payload.IsVerified = newStatus === 'Verified';
    payload.AdminRemarks = this.adminRemarksMap[ev.MandirEventID]?.trim() || ev.AdminRemarks || '';
    payload.DateModified = new Date();
    payload.UpdatedByUser = String(this.userDetails?.UserID || '');

    this.apinu.postUrlData('MandirEventUpdate', payload).subscribe({
      next: () => {
        this.updatingEventID = null;

        // Update status in-place on allEvents
        const idx = this.allEvents.findIndex(e => e.MandirEventID === ev.MandirEventID);
        if (idx !== -1) {
          this.allEvents[idx].EventStatus = newStatus;
          this.allEvents[idx].IsVerified = newStatus === 'Verified';
          this.allEvents[idx].AdminRemarks = payload.AdminRemarks;
          this.allEvents = [...this.allEvents];
        }

        this.expandedEventID = null;
        this.applyFilter();

        const icon = newStatus === 'Verified' ? '✅' : '❌';
        const label = newStatus === 'Verified' ? 'सत्यापित' : 'अस्वीकृत';
        this.showToast(`${icon} इवेंट ${label} किया गया`);
      },
      error: () => {
        this.updatingEventID = null;
        this.showToast('❌ अपडेट विफल, पुनः प्रयास करें');
      }
    });
  }

  // ── Move rejected back to Pending ─────────────────────
  restoreEvent(ev: any) {
    this.updateEventStatus(ev, 'Pending' as any);
  }

  // ── Helpers ───────────────────────────────────────────
  callOrganizer(phone: string) {
    if (phone) window.open(`tel:${phone}`, '_system');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getEventDaysLeft(dateStr: string): number {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(dateStr);
    event.setHours(0, 0, 0, 0);
    return Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  trackById(_: number, item: any) {
    return item.MandirEventID;
  }

  private async showToast(message: string) {
    const t = await this.toastController.create({
      message, duration: 3000, position: 'top', color: 'dark'
    });
    t.present();
  }
}