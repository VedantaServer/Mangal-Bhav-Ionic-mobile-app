import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';

interface UserInfo {
  FullName: string;
  PhoneNumber: string;
  Role: string;
}

@Component({
  selector: 'app-all-chats',
  templateUrl: './all-chats.component.html',
  styleUrls: ['./all-chats.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IonicModule]
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
  showpanditbottomtab: boolean = false;
  oneToOneChats: any[] = [];
  oneToOneLoading = false;

  // Reload button state (drives the spin animation + disables re-tap while running)
  isReloading = false;

  // Cache resolved name/phone/role so Support/AskPandit/OneToOne lists never
  // re-fetch the same user's info twice in one session
  private userInfoCache = new Map<number, UserInfo>();

  constructor(
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private api: Api,
    private storage: Storage,
    private http: HttpClient,
    private router: Router
  ) { }

  async ngOnInit() {

    if (this.router.url === '/allchats') {
      this.showpanditbottomtab = true;
    }

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
    this.loadOneToOneChats();
  }

  // ── Reload button handler — refreshes every list on the page.
  //    Clears the name/phone/role cache too, so any user lookups that
  //    failed on first load (e.g. "User 1057" not resolving) get retried. ──
  reloadAll() {
    if (this.isReloading) return;
    this.isReloading = true;
    this.userInfoCache.clear();

    this.loadGroups();
    this.loadOneToOneChats();
    if (this.isSupportPerson) this.loadSupportInbox();
    if (this.isAskPandit) this.loadAskPanditInbox();

    // Give the spin animation a minimum visible duration even if calls are instant
    setTimeout(() => { this.isReloading = false; }, 600);
  }




  loadOneToOneChats() {
    this.oneToOneLoading = true;
    const myID = this.userDetails.UserID;

    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'OneToOne' and (SenderID = ${myID} or ReceiverID = ${myID})`, null
    ).subscribe((res: any) => {
      const messages: any[] = res?.MessageList ?? [];
      const rawList = this.deduplicateOneToOne(messages, myID);

      if (rawList.length === 0) {
        this.oneToOneChats = [];
        this.oneToOneLoading = false;
        return;
      }


      const profileRequests = rawList.map((c: any) =>
        this.apinu.postUrlData(`ProfilesSelectAllByUserID?userId=${c.UserID}`, null)
      );

      forkJoin(profileRequests).subscribe({
        next: (profiles: any[]) => {
          this.oneToOneChats = rawList.map((c: any, i: number) => {
            const profile = profiles[i]?.ProfileList?.[0] || profiles[i]?.Profile || null;
            return {
              ...c,
              DisplayName: profile?.FullName || c.DisplayName
            };
          });
          this.oneToOneLoading = false;
        },
        error: () => {
          // fallback — show as-is if profile fetch fails
          this.oneToOneChats = rawList;
          this.oneToOneLoading = false;
        }
      });
    });
  }


  deduplicateOneToOne(messages: any[], myID: number): any[] {
    const map = new Map<number, any>();
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
        DisplayName: Number(msg.SenderID) === myID
          ? (msg.ReceiverName || `User ${otherID}`)
          : (msg.SenderName || `User ${otherID}`),
        LastMessage: msg.MessageText,
        LastMessageTime: msg.SentAt
      });
    }
    return Array.from(map.values()).reverse();
  }

  openOneToOneChat(userID: number, displayName: string) {
    this.router.navigate(['/chatbox'], {
      queryParams: {
        groupId: 0,
        chatType: 'OneToOne',
        withUserID: userID,
        withUserName: displayName
      }
    });
  }
  // ── Fetch all Support messages → deduplicate by SenderID → resolve real names ──
  loadSupportInbox() {
    this.inboxLoading = true;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'Support'`, null
    ).subscribe((res: any) => {
      const messages: any[] = res?.MessageList ?? [];
      const rawList = this.deduplicateInbox(messages);

      if (rawList.length === 0) {
        this.supportInbox = [];
        this.inboxLoading = false;
        return;
      }

      this.enrichWithUserInfo(rawList).subscribe({
        next: (enriched) => {
          this.supportInbox = enriched;
          this.inboxLoading = false;
        },
        error: () => {
          this.supportInbox = rawList;
          this.inboxLoading = false;
        }
      });
    });
  }

  // ── Fetch all AskPandit messages → deduplicate by SenderID → resolve real names ──
  loadAskPanditInbox() {
    this.inboxLoading = true;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'AskPandit'`, null
    ).subscribe((res: any) => {
      const messages: any[] = res?.MessageList ?? [];
      const rawList = this.deduplicateInbox(messages);

      if (rawList.length === 0) {
        this.askPanditInbox = [];
        this.inboxLoading = false;
        return;
      }

      this.enrichWithUserInfo(rawList).subscribe({
        next: (enriched) => {
          this.askPanditInbox = enriched;
          this.inboxLoading = false;
        },
        error: () => {
          this.askPanditInbox = rawList;
          this.inboxLoading = false;
        }
      });
    });
  }

  // ── Given a deduplicated inbox list, call UserNameRoleByUserID for each unique
  //    UserID (skipping ones already cached) and overlay FullName/PhoneNumber/Role ──
  private enrichWithUserInfo(rawList: any[]) {
    const requests = rawList.map((c: any) => {
      const cached = this.userInfoCache.get(c.UserID);
      if (cached) return of(cached);

      return this.apinu.postUrlData(`UserNameRoleByUserID?UserID=${c.UserID}`, null).pipe(
        map((res: any) => {
          const info = this.extractUserInfo(res, c.UserID);
          this.userInfoCache.set(c.UserID, info);
          return info;
        }),
        catchError(() => of(this.fallbackUserInfo(c.UserID)))
      );
    });

    return forkJoin(requests).pipe(
      map((infos: UserInfo[]) => rawList.map((c: any, i: number) => ({
        ...c,
        DisplayName: infos[i]?.FullName || c.DisplayName,
        PhoneNumber: infos[i]?.PhoneNumber || '',
        Role: infos[i]?.Role || ''
      })))
    );
  }

  private fallbackUserInfo(userID: number): UserInfo {
    return { FullName: `User ${userID}`, PhoneNumber: '', Role: '' };
  }

  // The controller wraps an already-JSON-stringified DataTable inside Ok(...),
  // so depending on how ApiNU deserializes the HTTP body this can arrive as a
  // plain object/array, or as a string that itself needs one more JSON.parse.
  // Unwrap however many layers of string-encoding are present before reading fields.
  private extractUserInfo(res: any, fallbackUserID: number): UserInfo {
    try {
      let parsed = res;
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      const row = Array.isArray(parsed) ? parsed[0] : (parsed?.[0] ?? parsed);
      const fullName = row?.FullName ? String(row.FullName).trim() : '';
      const phoneNumber = row?.PhoneNumber ? String(row.PhoneNumber).trim() : '';
      const role = row?.Role ? String(row.Role).trim() : '';
      return {
        FullName: fullName || `User ${fallbackUserID}`,
        PhoneNumber: phoneNumber,
        Role: role
      };
    } catch {
      return this.fallbackUserInfo(fallbackUserID);
    }
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
        DisplayName: `User ${otherID}`, // placeholder — overwritten by enrichWithUserInfo
        PhoneNumber: '',
        Role: '',
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