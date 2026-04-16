import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-all-chats',
  templateUrl: './all-chats.component.html',
  styleUrls: ['./all-chats.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,PanditjibottomtabsComponent]
})
export class AllChatsComponent implements OnInit {

  userDetails: any;
  groups: any[] = [];
  loading = true;

  isSupportPerson: boolean = false;
  isAskPandit: boolean = false;

  // Inbox lists for Support / AskPandit staff
  supportInbox: any[] = [];      // unique users who texted Support
  askPanditInbox: any[] = [];    // unique users who texted AskPandit
  inboxLoading = false;

  constructor(
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private api: Api,
    private storage: Storage,
    private http: HttpClient,
    private router: Router
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');

    // Check Support role
    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='Support' and identifier='Support'`}`, null
    ).subscribe((res: any) => {
      if (res.MasterDataList.length > 0) {
        this.isSupportPerson = Number(res.MasterDataList[0].Description) === Number(this.userDetails.UserID);
        if (this.isSupportPerson) this.loadSupportInbox();
      }
    });

    // Check AskPandit role
    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='AskPandit' and identifier='AskPandit'`}`, null
    ).subscribe((res: any) => {
      if (res.MasterDataList.length > 0) {
        this.isAskPandit = Number(res.MasterDataList[0].Description) === Number(this.userDetails.UserID);
        if (this.isAskPandit) this.loadAskPanditInbox();
      }
    });

    this.loadGroups();
  }

  // ── Fetch all Support messages → deduplicate by SenderID ──
  loadSupportInbox() {
    this.inboxLoading = true;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'Support'`, null
    ).subscribe((res: any) => {
      const messages: any[] = res?.MessageList ?? [];
      this.supportInbox = this.deduplicateInbox(messages);
      this.inboxLoading = false;
    });
  }

  // ── Fetch all AskPandit messages → deduplicate by SenderID ──
  loadAskPanditInbox() {
    this.inboxLoading = true;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'AskPandit'`, null
    ).subscribe((res: any) => {
      const messages: any[] = res?.MessageList ?? [];
      this.askPanditInbox = this.deduplicateInbox(messages);
      this.inboxLoading = false;
    });
  }

  // ── Build one card per unique user (exclude self), keep latest message ──
  deduplicateInbox(messages: any[]): any[] {
    const myID = Number(this.userDetails.UserID);
    const map = new Map<number, any>();

    // Sort oldest→newest so the last write per user = latest message
    const sorted = [...messages].sort(
      (a, b) => new Date(a.SentAt).getTime() - new Date(b.SentAt).getTime()
    );

    for (const msg of sorted) {
      const otherID = Number(msg.SenderID) === myID
        ? Number(msg.ReceiverID)
        : Number(msg.SenderID);

      if (!otherID || otherID === myID) continue;

      map.set(otherID, {
        UserID: otherID,
        DisplayName: msg.SenderName || `User ${otherID}`,
        LastMessage: msg.MessageText,
        LastMessageTime: msg.SentAt,
        ChatType: msg.ChatType
      });
    }

    // Newest conversation first
    return Array.from(map.values()).reverse();
  }

  // ── Navigate — pass userID so chatbox filters that conversation ──
  openSupportChat(userID: number) {
    this.router.navigate(['/chatbox'], {
      queryParams: { groupId: -1, withUserID: userID }
    });
  }

  openAskPanditChat(userID: number) {
    this.router.navigate(['/chatbox'], {
      queryParams: { groupId: -2, withUserID: userID }
    });
  }

  loadGroups() {
    this.loading = true;
    this.apinu.postUrlData(
      `ChatGroupParticipantsSelectAllByUserID?userID=${this.userDetails.UserID}`, null
    ).subscribe({
      next: (res: any) => {
        const participants = res?.ChatGroupParticipantList ?? [];
        if (participants.length === 0) {
          this.groups = [];
          this.loading = false;
          return;
        }
        const groupRequests = participants.map((p: any) =>
          this.apinu.postUrlData(`ChatGroupSelect?chatGroupID=${p.ChatGroupID}`, null)
        );
        forkJoin(groupRequests).subscribe({
          next: (responses: any) => {
            this.groups = responses
              .flatMap((r: any) => r?.ChatGroupList ?? [])
              .filter(Boolean);
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  openChat(groupId: number) {
    this.router.navigate(['/chatbox'], { queryParams: { groupId } });
  }
  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

}