import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { ApiNU } from '../../providers';

@Component({
  selector: 'app-admin-broadcast-insert',
  templateUrl: './admin-broadcast-insert.component.html',
  styleUrls: ['./admin-broadcast-insert.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminBroadcastInsertComponent implements OnInit {

  broadcastMessage: string = '';
  isSubmitting = false;
  broadcastList: any[] = [];
  showList = false;
  isLoadingList = false;

  // ── Audience targeting ─────────────────────────────────
  audienceOptions = [
    { value: 'All', label: 'All Users' },
    { value: 'Pandit', label: 'Pandit' },
    { value: 'Yajman', label: 'Yajman' },
  ];
  selectedAudience: string = 'All';

  // Today's date, shown to admin so they know which day this broadcast targets
  todayDisplay: string = '';
  private todayIdentifier: string = '';

  constructor(
    public apinu: ApiNU,
    private alertCtrl: AlertController, public routerCtrl: NavController,
  ) { }

  ngOnInit() {
    const today = new Date();
    this.todayIdentifier =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.todayDisplay = today.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  /** Maps the selected audience to the Domain value used for storage/filtering.
   * 'All' keeps the original domain unchanged (backward compatible with
   * anything reading BroadcastMessage today); Pandit/Yajman get a suffixed domain. */
  private getDomainForAudience(): string {
    return this.selectedAudience === 'All'
      ? 'BroadcastMessage'
      : `BroadcastMessage-${this.selectedAudience}`;
  }

  private getAudienceLabel(): string {
    return this.audienceOptions.find(a => a.value === this.selectedAudience)?.label || 'All Users';
  }

  async onBroadcastClick() {
    if (!this.broadcastMessage.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Message Required',
        message: 'Please enter a message before broadcasting.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // ── Confirmation before actually inserting ──
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirm Broadcast',
      message: `This message will be shown to ${this.getAudienceLabel()} today (${this.todayDisplay}):\n\n"${this.broadcastMessage.trim()}"`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Broadcast',
          handler: () => this.submitBroadcast()
        }
      ]
    });
    await confirmAlert.present();
  }

  private submitBroadcast() {
    this.isSubmitting = true;

    const payload = {
      Domain: this.getDomainForAudience(),
      Identifier: this.todayIdentifier,
      Description: this.broadcastMessage.trim(),
      TenantID: 1,
      DateAdded: new Date().toISOString()
    };

    this.apinu.postUrlData('BroadcastInsert', payload).subscribe({
      next: async (res: any) => {
        this.isSubmitting = false;

        const ok = res?.Table[0]?.MasterDataID > 0;
        const successAlert = await this.alertCtrl.create({
          header: ok ? 'Broadcast Sent ✅' : 'Something Went Wrong',
          message: ok
            ? 'Your message will now be shown to users today.'
            : 'The broadcast could not be saved. Please try again.',
          buttons: ['OK']
        });
        await successAlert.present();

        if (ok) {
          this.broadcastMessage = '';
        }
      },
      error: async (err: any) => {
        this.isSubmitting = false;
        console.error('BroadcastInsert failed:', err);

        const errorAlert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Broadcast could not be sent. Please try again.',
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    });
  }

  onViewClick() {
    if (this.showList) {
      this.showList = false;
      return;
    }

    this.isLoadingList = true;

    // Fetch broadcasts for the currently-selected audience's domain,
    // so the list reflects what's relevant to the dropdown selection.
    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`Domain='${this.getDomainForAudience()}'`)}`,
      null
    ).subscribe({
      next: (res: any) => {
        this.isLoadingList = false;

        const list = typeof res.MasterDataList === 'string'
          ? JSON.parse(res.MasterDataList)
          : res.MasterDataList;

        this.broadcastList = (list || []).sort((a: any, b: any) =>
          new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime()
        );
        this.showList = true;
      },
      error: (err: any) => {
        this.isLoadingList = false;
        console.error('MasterDataSelectByQuery failed:', err);
      }
    });
  }
}