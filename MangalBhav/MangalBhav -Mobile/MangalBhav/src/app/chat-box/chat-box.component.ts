import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { group } from 'console';
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
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ChatBoxComponent implements OnInit {
  supportUserID: number = 0;
  AskPanditUserID: number = 0;
  customGroupID: number = 0;
  GroupName: string = '';
  userDetails: any;
  allMessagesOfCurrentChatBox: any;
  withUserID: number = 0;
  chatType: string = '';
  withUserName: string = 'Pandit Ji';


  constructor(private route: ActivatedRoute,
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private api: Api,
    private storage: Storage,
    private http: HttpClient,
    private router: Router
  ) { }




  async ngOnInit() {
    this.userDetails = await this.storage.get('account');

    this.checkTermsAcceptance();
    const groupId = this.route.snapshot.queryParamMap.get('groupId');
    const withUserID = this.route.snapshot.queryParamMap.get('withUserID');
    const chatType = this.route.snapshot.queryParamMap.get('chatType');
    const withUserName = this.route.snapshot.queryParamMap.get('withUserName');

    this.withUserID = withUserID ? Number(withUserID) : 0;
    this.chatType = chatType || '';
    this.withUserName = withUserName || 'Pandit Ji';

    // ── OneToOne (Pandit direct chat) ──
    if (this.chatType === 'OneToOne') {
      this.GroupName = this.withUserName;
      this.loadOneToOneMessages();
      return;
    }

    // ── Support ──
    if (Number(groupId) === -1) {
      this.GroupName = 'Support';
      this.apinu.postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='Support' and identifier='Support'`}`, null
      ).subscribe((res: any) => {
        this.supportUserID = Number(res.MasterDataList[0].Description);
        const filterID = this.withUserID || this.userDetails.UserID;
        this.apinu.postUrlData(
          `MessagesSelectByQuery?Query= ChatType = 'Support' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
        ).subscribe((res: any) => {
          this.allMessagesOfCurrentChatBox = res.MessageList;
        });
      });
      return;
    }

    // ── AskPandit ──
    if (Number(groupId) === -2) {
      this.GroupName = 'AskPandit';
      this.apinu.postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${`domain='AskPandit' and identifier='AskPandit'`}`, null
      ).subscribe((res: any) => {
        this.AskPanditUserID = Number(res.MasterDataList[0].Description);
        const filterID = this.withUserID || this.userDetails.UserID;
        this.apinu.postUrlData(
          `MessagesSelectByQuery?Query= ChatType = 'AskPandit' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
        ).subscribe((res: any) => {
          this.allMessagesOfCurrentChatBox = res.MessageList;
        });
      });
      return;
    }

    // ── Custom Group ──
    this.customGroupID = Number(groupId);
    this.apinu.postUrlData(`ChatGroupSelect?chatGroupID=${this.customGroupID}`, null)
      .subscribe((res: any) => {
        this.GroupName = res.ChatGroupList[0]?.GroupName;
        this.apinu.postUrlData(
          `MessagesSelectByQuery?Query= ChatType = '${this.GroupName}' and chatGroupID=${this.customGroupID}`, null
        ).subscribe((res: any) => {
          this.allMessagesOfCurrentChatBox = res.MessageList;
        });
      });


  }

  loadOneToOneMessages() {
    const myID = this.userDetails.UserID;
    const otherID = this.withUserID;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'OneToOne' and ((SenderID = ${myID} and ReceiverID = ${otherID}) or (SenderID = ${otherID} and ReceiverID = ${myID}))`, null
    ).subscribe((res: any) => {
      this.allMessagesOfCurrentChatBox = res.MessageList;
    });
  }
  // async ngOnInit() {

  //   this.userDetails = await this.storage.get('account');
  //   const groupId = this.route.snapshot.queryParamMap.get('groupId');
  //   const withUserID = this.route.snapshot.queryParamMap.get('withUserID');
  //   this.withUserID = withUserID ? Number(withUserID) : 0;
  //   console.log('Received groupId:', groupId);
  //   console.log('Received userID:', withUserID);

  //   if (Number(groupId) === -1) {
  //     this.GroupName = 'Support';
  //     this.apinu.postUrlData(`MasterDataSelectByQuery?tenantID=-1&Query=${`domain='Support' and identifier='Support'`}`, null)
  //       .subscribe((res: any) => {
  //         this.supportUserID = Number(res.MasterDataList[0].Description);

  //         // ── Staff viewing a user's chat vs user viewing own chat ──
  //         const filterID = this.withUserID || this.userDetails.UserID;

  //         this.apinu.postUrlData(
  //           `MessagesSelectByQuery?Query= ChatType = 'Support' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
  //         ).subscribe((res: any) => {
  //           this.allMessagesOfCurrentChatBox = res.MessageList;
  //         });
  //       });

  //   } else if (Number(groupId) === -2) {
  //     this.GroupName = 'AskPandit';
  //     this.apinu.postUrlData(`MasterDataSelectByQuery?tenantID=-1&Query=${`domain='AskPandit' and identifier='AskPandit'`}`, null)
  //       .subscribe((res: any) => {
  //         this.AskPanditUserID = Number(res.MasterDataList[0].Description);

  //         // ── Staff viewing a user's chat vs user viewing own chat ──
  //         const filterID = this.withUserID || this.userDetails.UserID;

  //         this.apinu.postUrlData(
  //           `MessagesSelectByQuery?Query= ChatType = 'AskPandit' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
  //         ).subscribe((res: any) => {
  //           this.allMessagesOfCurrentChatBox = res.MessageList;
  //         });
  //       });
  //   } else {
  //     this.customGroupID = Number(groupId);
  //     this.apinu.postUrlData(`ChatGroupSelect?chatGroupID=${this.customGroupID}`, null).subscribe((res: any) => {
  //       this.GroupName = res.ChatGroupList[0]?.GroupName;
  //       this.apinu.postUrlData(`MessagesSelectByQuery?Query= ChatType = '${this.GroupName}' and chatGroupID=${this.customGroupID}`, null)
  //         .subscribe((res: any) => {
  //           this.allMessagesOfCurrentChatBox = res.MessageList;
  //           console.log(res)
  //         })
  //     })
  //   }
  // }

  newMessage: string = '';

  isDifferentDay(prev: string, curr: string): boolean {
    if (!prev || !curr) return false;
    return new Date(prev).toDateString() !== new Date(curr).toDateString();
  }

  sendMessage() {
    if (!this.newMessage?.trim()) return;

    let recID = 0;
    let chatTypeToSend = this.GroupName;

    if (this.chatType === 'OneToOne') {
      recID = this.withUserID;
      chatTypeToSend = 'OneToOne';
    } else if (this.GroupName === 'Support') {
      recID = this.withUserID ? this.withUserID : this.supportUserID;
    } else if (this.GroupName === 'AskPandit') {
      recID = this.withUserID ? this.withUserID : this.AskPanditUserID;
    }

    const body = {
      chatGroupID: this.chatType === 'OneToOne' ? Number(0) : Number(this.customGroupID),
      chatType: chatTypeToSend,
      senderID: this.userDetails.UserID,
      receiverID: recID,
      messageText: this.newMessage,
      messageType: 'Text',
      mediaURL: '',
      sentAt: new Date(),
      isDeleted: false
    };

    this.apinu.postUrlData(`MessagesInsert`, body).subscribe(() => {
      if (this.chatType === 'OneToOne') {
        this.loadOneToOneMessages();
      } else {
        const filterID = this.withUserID || this.userDetails.UserID;
        this.apinu.postUrlData(
          `MessagesSelectByQuery?Query= ChatType = '${chatTypeToSend}' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
        ).subscribe((r: any) => {
          this.allMessagesOfCurrentChatBox = r.MessageList;
        });
      }
    });

    this.newMessage = '';
  }

  goBack() {
    this.routerCtrl.back();
  }

  // Add this helper method
  isMine(senderID: number): boolean {
    return Number(senderID) === Number(this.userDetails?.UserID);
  }
  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  showTermsModal = false;
  termsChecked = false;


  private checkTermsAcceptance() {
    const accepted = localStorage.getItem('chatTermsAccepted');
    if (!accepted) {
      this.showTermsModal = true;
    }
  }

  acceptTerms() {
    localStorage.setItem('chatTermsAccepted', 'true');
    this.showTermsModal = false;
  }

  declineTerms() {
    this.goBack();
  }
}
