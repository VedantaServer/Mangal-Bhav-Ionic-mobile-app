import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-my-mandir',
  templateUrl: './my-mandir.component.html',
  styleUrls: ['./my-mandir.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
 
  ]
})
export class MyMandirComponent implements OnInit {

  userDetails: any;

  // ── View state ─────────────────────────────────────────
  view: 'list' | 'detail' = 'list';

  // ── List ───────────────────────────────────────────────
  mandirMembers: any[] = [];
  listLoading = true;

  // ── Selected mandir ────────────────────────────────────
  selectedMember: any = null;

  // ── Events ─────────────────────────────────────────────
  events: any[] = [];
  eventsLoading = false;

  // ── Add Event form ─────────────────────────────────────
  showEventForm = false;
  isSubmittingEvent = false;

  readonly eventTypes = [
    'पूजा', 'कीर्तन', 'हवन', 'भजन संध्या',
    'जयंती', 'उत्सव', 'प्रसाद वितरण', 'अन्य'
  ];

  newEvent: any = {};

  eventPhotoFile: File | null = null;
  eventPhotoPreview: string | null = null;
  isUploadingEventPhoto = false;

  constructor(
    public api: Api,
    public apinu: ApiNU,
    public routerCtrl: NavController,
    private storage: Storage,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.loadMandirMembers();
  }

  // ── Load list ──────────────────────────────────────────
  loadMandirMembers() {
    this.listLoading = true;

    this.apinu.postUrlData(
      `MandirMemberSelectAllByUserID?userID=${this.userDetails?.UserID}`,
      null
    ).subscribe({

      next: (res: any) => {

        const members = res.MandirMemberList || [];

        if (!members.length) {
          this.mandirMembers = [];
          this.listLoading = false;
          return;
        }

        members.forEach((member: any) => {

          this.apinu.postUrlData(
            `MandirSelectByQuery?Query=mandirID=${member.MandirID}`,
            null
          ).subscribe((mandirRes: any) => {

            const mandir =
              mandirRes?.MandirList?.[0];

            Object.assign(member, mandir);

            this.loadMemberImage(member);

            this.mandirMembers = [...members];
          });

        });

        this.listLoading = false;
      },

      error: () => {
        this.listLoading = false;
      }

    });
  }

  private loadMemberImage(member: any) {
    if (!member.FrontImage) return;
    this.api.getImage('DownloadImages', { imageName: member.FrontImage, imagePurpose: 'ProfilePhoto' }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          member.imageUrl = URL.createObjectURL(blob);
          this.mandirMembers = [...this.mandirMembers];
        }
      },
      error: () => { }
    });
  }

  // ── Detail ─────────────────────────────────────────────
  openDetail(member: any) {
    this.selectedMember = member;
    this.view = 'detail';
    this.events = [];
    this.showEventForm = false;
    this.loadEvents(member.MandirID);
  }

  goBack() {
    this.view = 'list';
    this.selectedMember = null;
    this.events = [];
    this.showEventForm = false;
  }

  // ── Events ─────────────────────────────────────────────
  loadEvents(mandirID: number) {
    this.eventsLoading = true;
    const tenantID = this.userDetails?.TenantID || 1;
    this.apinu.postUrlData(
      `MandirEventSelectByQuery?tenantID=${tenantID}&schoolID=0&Query=MandirID=${mandirID} AND IsVerified =1`, null
    ).subscribe({
      next: (res: any) => {
        this.events = res.MandirEventList || [];
        this.eventsLoading = false;
      },
      error: () => { this.eventsLoading = false; }
    });
  }

  // ── Add Event ──────────────────────────────────────────
  openEventForm() {
    this.newEvent = {
      MandirEventID: 0,
      TenantID: this.userDetails?.TenantID || 1,
      MandirID: this.selectedMember?.MandirID,
      EventType: '',
      EventName: '',
      EventDescription: '',
      EventOrganizerName1: this.userDetails?.FullName || this.userDetails?.UserName || '',
      EventOrganizerName2: '',
      EventOrganizerPhone1: this.userDetails?.Mobile || '',
      EventOrganizerPhone2: '',
      EventCardPhoto1: '',
      EventCardPhoto2: '',
      EventDate: new Date().toISOString().split('T')[0],
      EventTime: '08:00',
      EventDay: '',
      EventStatus: 'Pending',
      IsVerified: false,
      AdminRemarks: '',
      AddedByMandirMemberID: this.selectedMember?.MandirMemberID || 0,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: String(this.userDetails?.UserID || '')
    };
    this.onEventDateChange();
    this.eventPhotoFile = null;
    this.eventPhotoPreview = null;
    this.showEventForm = true;
  }

  onEventDateChange() {
    if (this.newEvent.EventDate) {
      const d = new Date(this.newEvent.EventDate);
      this.newEvent.EventDay = d.toLocaleDateString('hi-IN', { weekday: 'long' });
    }
  }

  onEventPhotoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.eventPhotoFile = file;
    this.newEvent.EventCardPhoto1 = '';
    const reader = new FileReader();
    reader.onload = (e: any) => this.eventPhotoPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  uploadEventPhoto() {
    if (!this.eventPhotoFile) return;
    this.isUploadingEventPhoto = true;
    this.api.uploadImage([this.eventPhotoFile], 'ProfilePhoto', 'mandir', 'ProfilePhoto').subscribe({
      next: (res: any) => {
        this.isUploadingEventPhoto = false;
        if (res?.Status === 'Success') {
          this.newEvent.EventCardPhoto1 = res.FileName;
          this.eventPhotoFile = null;
          this.showToast('📷 फ़ोटो अपलोड हुई ✅');
        }
      },
      error: () => { this.isUploadingEventPhoto = false; this.showToast('❌ अपलोड विफल'); }
    });
  }

  submitEvent() {
    if (!this.newEvent.EventName?.trim()) { this.showToast('⚠️ इवेंट का नाम दर्ज करें'); return; }
    if (!this.newEvent.EventType) { this.showToast('⚠️ इवेंट प्रकार चुनें'); return; }
    if (!this.newEvent.EventDate) { this.showToast('⚠️ तारीख चुनें'); return; }
    if (this.eventPhotoFile) { this.showToast('⚠️ फ़ोटो पहले अपलोड करें ⬆'); return; }

    this.isSubmittingEvent = true;
    this.newEvent.DateModified = new Date();

    this.apinu.postUrlData('MandirEventInsert', this.newEvent).subscribe({
      next: () => {
        this.isSubmittingEvent = false;
        this.showEventForm = false;
        this.showToast('🙏 इवेंट जमा हुआ! Admin अनुमोदन के बाद दिखेगा।');
        this.loadEvents(this.selectedMember?.MandirID);
      },
      error: () => {
        this.isSubmittingEvent = false;
        this.showToast('❌ कुछ गलत हुआ, पुनः प्रयास करें');
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────
  formatEventDate(dateStr: string): { dd: string; mon: string } {
    if (!dateStr) return { dd: '--', mon: '---' };
    const d = new Date(dateStr);
    return {
      dd: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      mon: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
    };
  }

  getStatusClass(status: string): string {
    if (status === 'Approved') return 'status-approved';
    if (status === 'Rejected') return 'status-rejected';
    return 'status-pending';
  }

  private async showToast(message: string) {
    const t = await this.toastController.create({ message, duration: 3000, position: 'top', color: 'dark' });
    t.present();
  }
}