import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from '../../providers';
import { forkJoin } from 'rxjs';

interface PanditItem {
  UserID: number;
  FullName: string;
  PhoneNumber: string;
  selected: boolean;
}

@Component({
  selector: 'app-send-bulk-support-message',
  templateUrl: './send-bulk-support-message.component.html',
  styleUrls: ['./send-bulk-support-message.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SendBulkSupportMessageComponent implements OnInit {

  supportUserID: number = 0;

  panditList: PanditItem[] = [];
  filteredList: PanditItem[] = [];
  searchText: string = '';

  isLoading: boolean = true;
  isSending: boolean = false;

  messageText: string = '';
  selectAllChecked: boolean = false;

  constructor(
    private apinu: ApiNU,
    private api: Api,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadSupportUserID();
    this.loadPanditList();
  }

  // ── Same lookup chat-box.component.ts uses to get the Support account ──
  private loadSupportUserID() {
    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='Support' and identifier='Support'`}`, null
    ).subscribe({
      next: (res: any) => {
        this.supportUserID = Number(res.MasterDataList[0].Description);
      },
      error: (err:any) => {
        console.error('Failed to load Support UserID:', err);
        this.showToast('Failed to load Support account', 'danger');
      }
    });
  }

  // ── Pandit Ji list ──
  // NOTE: endpoint name assumed as "ProfileSelectByQuery" (table = Profiles),
  // matching your [Entity][Action]ByQuery convention. Rename if different.
  loadPanditList() {
    this.isLoading = true;

    const query = `UserID in (select UserID from Users where Role='PANDIT')`;

    this.apinu.postUrlData(
      `ProfilesNUSelectByQuery?Query=${query}`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.ProfileList || res.ProfilesList || [];
        this.panditList = list.map((p: any) => ({
          UserID: p.UserID,
          FullName: p.FullName,
          PhoneNumber: p.PhoneNumber,
          selected: false
        }));
        this.filteredList = [...this.panditList];
        this.isLoading = false;
      },
      error: (err:any) => {
        console.error('Failed to load Pandit list:', err);
        this.showToast('Failed to load Pandit Ji list', 'danger');
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredList = [...this.panditList];
      return;
    }
    this.filteredList = this.panditList.filter(p =>
      p.FullName?.toLowerCase().includes(term) ||
      p.PhoneNumber?.toLowerCase().includes(term)
    );
  }

  toggleSelectAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.filteredList.forEach(p => p.selected = this.selectAllChecked);
  }

  toggleOne(item: PanditItem) {
    item.selected = !item.selected;
    this.selectAllChecked = this.filteredList.length > 0 &&
      this.filteredList.every(p => p.selected);
  }

  get selectedCount(): number {
    return this.panditList.filter(p => p.selected).length;
  }

  get canSend(): boolean {
    return !!this.messageText?.trim() &&
      this.selectedCount > 0 &&
      this.supportUserID > 0 &&
      !this.isSending;
  }

  async sendBulkMessage() {
    if (!this.canSend) return;

    const selectedPandits = this.panditList.filter(p => p.selected);
    this.isSending = true;

    const requests = selectedPandits.map(p => {
      const body = {
        chatGroupID: 0,
        chatType: 'Support',
        senderID: this.supportUserID,   // sending FROM support account
        receiverID: p.UserID,           // TO this Pandit Ji
        messageText: this.messageText.trim(),
        messageType: 'Text',
        mediaURL: '',
        sentAt: new Date(),
        isDeleted: false
      };
      return this.apinu.postUrlData(`MessagesInsert`, body);
    });

    forkJoin(requests).subscribe({
      next: async () => {
        this.isSending = false;
        await this.showToast(`Message sent to ${selectedPandits.length} Pandit Ji`, 'success');
        this.messageText = '';
        this.panditList.forEach(p => p.selected = false);
        this.selectAllChecked = false;
      },
      error: async (err) => {
        console.error('Bulk send failed:', err);
        this.isSending = false;
        await this.showToast('Some messages failed to send. Please try again.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 3000, color, position: 'top'
    });
    toast.present();
  }
}