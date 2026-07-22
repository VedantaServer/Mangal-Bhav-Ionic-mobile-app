import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, NavController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import fixWebmDuration from 'fix-webm-duration';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  supportUserID: number = 0;
  AskPanditUserID: number = 0;
  customGroupID: number = 0;
  GroupName: string = '';
  userDetails: any;
  allMessagesOfCurrentChatBox: any;
  withUserID: number = 0;
  chatType: string = '';
  withUserName: string = 'Pandit Ji';
  isLoggedIn: boolean = false;   // ← add this
  // ── Notification sound state ──
private isInitialLoad = true;
private notificationAudioCtx: AudioContext | null = null;

  @ViewChild('chatContent') content!: IonContent;

  // ── Auto-reload (polling) ──────────────────────────────
  private pollHandle: any = null;
  private readonly POLL_MS = 4000; // refetch every 4s while the chat is open

  // ── Default auto-reply sent once, the first time a customer messages
  //    Support or AskPandit — reassures them while staff catch up. ──
  private readonly autoReplyText: Record<string, string> = {
    Support: 'धन्यवाद 🙏 हम आपके संदेश का जल्द ही जवाब देंगे।',
    AskPandit: 'जय श्री राम 🙏 पंडित जी जल्द ही आपके प्रश्न का उत्तर देंगे।'
  };

  constructor(private route: ActivatedRoute,
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private api: Api,
    private storage: Storage,
    private http: HttpClient,
    private router: Router
  ) { }



  private playNotificationSound() {
    try {
      if (!this.notificationAudioCtx) {
        this.notificationAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = this.notificationAudioCtx;
  
      // Some browsers/webviews suspend the context until a user gesture happens.
      // Resuming here is a no-op if it's already running.
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
  
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
  
      const now = ctx.currentTime;
      playTone(880, now, 0.15);         // ding
      playTone(1108, now + 0.18, 0.2);  // dong
    } catch (e) {
      console.error('Notification sound error:', e);
    }
  }


  async ngOnInit() {

    this.userDetails = await this.storage.get('account');
    this.isLoggedIn = !!this.userDetails?.UserID;

    const groupId = this.route.snapshot.queryParamMap.get('groupId');
    const withUserID = this.route.snapshot.queryParamMap.get('withUserID');
    const chatType = this.route.snapshot.queryParamMap.get('chatType');
    const withUserName = this.route.snapshot.queryParamMap.get('withUserName');

    this.withUserID = withUserID ? Number(withUserID) : 0;
    this.chatType = chatType || '';
    this.withUserName = withUserName || 'Pandit Ji';

    if (!this.isLoggedIn) {
      // Just set a header label, skip terms + all data fetching
      this.GroupName = this.chatType === 'OneToOne' ? this.withUserName : 'Chat';
      return;
    }

    this.checkTermsAcceptance();

    // ── OneToOne (Pandit direct chat) ──
    if (this.chatType === 'OneToOne') {
      this.GroupName = this.withUserName;
      this.loadOneToOneMessages();
      this.startPolling(() => this.loadOneToOneMessages());
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
        this.loadSupportMessages(filterID);
        this.startPolling(() => this.loadSupportMessages(filterID));
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
        this.loadAskPanditMessages(filterID);
        this.startPolling(() => this.loadAskPanditMessages(filterID));
      });
      return;
    }

    // ── Custom Group ──
    this.customGroupID = Number(groupId);
    this.apinu.postUrlData(`ChatGroupSelect?chatGroupID=${this.customGroupID}`, null)
      .subscribe((res: any) => {
        this.GroupName = res.ChatGroupList[0]?.GroupName;
        this.loadGroupMessages();
        this.startPolling(() => this.loadGroupMessages());
      });


  }



  // ── Polling helpers ─────────────────────────────────────
  private startPolling(reloadFn: () => void) {
    this.stopPolling();
    this.pollHandle = setInterval(reloadFn, this.POLL_MS);
  }

  private stopPolling() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  // Assigns the freshly-fetched list and, only if the count actually grew
  // (i.e. a genuinely new message arrived — not just a poll re-fetch of the
  // same data), scrolls to bottom so the person sees it without losing their
  // place if they were scrolled up reading older messages.
  // private applyMessages(list: any[]) {
  //   const prevLen = this.allMessagesOfCurrentChatBox?.length || 0;
  //   this.allMessagesOfCurrentChatBox = list || [];
  //   if (this.allMessagesOfCurrentChatBox.length > prevLen) {
  //     setTimeout(() => this.scrollToBottom(), 60);
  //   }
  // }

  private scrollToBottom() {
    this.content?.scrollToBottom(250);
  }

  loadOneToOneMessages() {
    const myID = this.userDetails.UserID;
    const otherID = this.withUserID;
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'OneToOne' and ((SenderID = ${myID} and ReceiverID = ${otherID}) or (SenderID = ${otherID} and ReceiverID = ${myID}))`, null
    ).subscribe((res: any) => {
      this.applyMessages(res.MessageList);
    });
  }

  loadSupportMessages(filterID: number) {
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'Support' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
    ).subscribe((res: any) => {
      this.applyMessages(res.MessageList);
    });
  }

  loadAskPanditMessages(filterID: number) {
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = 'AskPandit' and (SenderID = ${filterID} or ReceiverID = ${filterID})`, null
    ).subscribe((res: any) => {
      this.applyMessages(res.MessageList);
    });
  }

  loadGroupMessages() {
    this.apinu.postUrlData(
      `MessagesSelectByQuery?Query= ChatType = '${this.GroupName}' and chatGroupID=${this.customGroupID}`, null
    ).subscribe((res: any) => {
      this.applyMessages(res.MessageList);
    });
  }

  openLogin() {
    this.storage.set('openLoginSection', 'true');
    this.routerCtrl.navigateForward('/login?from=chat');
  }

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

      const staffID = this.GroupName === 'Support' ? this.supportUserID
        : this.GroupName === 'AskPandit' ? this.AskPanditUserID
          : 0;

      const senderIsCustomer = staffID > 0 && Number(this.userDetails.UserID) !== Number(staffID);

      // Only auto-reply if this is the customer's FIRST message in the thread —
      // i.e. staff (or a previous auto-reply) hasn't sent anything yet.
      const shouldAutoReply = senderIsCustomer
        && (this.GroupName === 'Support' || this.GroupName === 'AskPandit')
        && !this.hasStaffAlreadyReplied(staffID);

      if (shouldAutoReply) {
        this.sendAutoReply(staffID, this.userDetails.UserID);
      } else {
        this.refreshAfterSend();
      }
    });


    this.newMessage = '';
  }

  // ── Fires the canned "we'll help you shortly" reply from the Support/
  //    AskPandit account back to the customer, then refreshes the thread. ──
  private sendAutoReply(staffID: number, customerID: number) {
    const text = this.autoReplyText[this.GroupName] || 'We will get back to you shortly 🙏';

    const autoBody = {
      chatGroupID: 0,
      chatType: this.GroupName,
      senderID: staffID,
      receiverID: customerID,
      messageText: text,
      messageType: 'Text',
      mediaURL: '',
      sentAt: new Date(),
      isDeleted: false
    };

    // Small delay so it visually lands a beat after the customer's message,
    // reading as a reply rather than landing in the exact same instant.
    setTimeout(() => {
      this.apinu.postUrlData(`MessagesInsert`, autoBody).subscribe(() => {
        this.refreshAfterSend();
      });
    }, 800);
  }

  private refreshAfterSend() {
    if (this.chatType === 'OneToOne') {
      this.loadOneToOneMessages();
    } else if (this.GroupName === 'Support') {
      this.loadSupportMessages(this.withUserID || this.userDetails.UserID);
    } else if (this.GroupName === 'AskPandit') {
      this.loadAskPanditMessages(this.withUserID || this.userDetails.UserID);
    } else {
      this.loadGroupMessages();
    }
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

  // Returns true if the staff/support account has already sent at least one
  // message in the currently loaded thread (including a prior auto-reply).
  // Used to gate the auto-reply so it only fires on the customer's FIRST
  // message, not every message.
  private hasStaffAlreadyReplied(staffID: number): boolean {
    const list = this.allMessagesOfCurrentChatBox || [];
    return list.some((m: any) => Number(m.SenderID) === Number(staffID));
  }
  isRecording = false;
  recordingDuration = 0;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private recordingTimer: any = null;

  // Store downloaded audio URLs
  audioUrls: { [key: string]: string } = {};



  async startRecording() {
    try {
      this.audioStream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      this.audioChunks = [];

      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.audioStream, { mimeType })
        : new MediaRecorder(this.audioStream);

      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        console.log(
          'Audio chunk:',
          event.data.size,
          event.data.type
        );

        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {

        const durationMs =
          Date.now() - this.recordingStartTime;

        const usedMimeType =
          this.mediaRecorder?.mimeType ||
          mimeType ||
          'audio/webm';

        console.log('Recording stopped');
        console.log('Duration MS:', durationMs);
        console.log('Chunks:', this.audioChunks.length);

        const rawBlob = new Blob(
          this.audioChunks,
          {
            type: usedMimeType
          }
        );

        console.log(
          'Raw Blob:',
          rawBlob.size,
          rawBlob.type
        );

        // Stop microphone
        this.audioStream
          ?.getTracks()
          .forEach(track => track.stop());

        this.audioStream = null;

        let finalBlob = rawBlob;

        // Fix WebM duration metadata before uploading
        if (usedMimeType.includes('webm')) {

          try {

            finalBlob = await fixWebmDuration(
              rawBlob,
              durationMs
            );

            console.log(
              'Fixed WebM Blob:',
              finalBlob.size,
              finalBlob.type
            );

          }
          catch (error) {

            console.error(
              'WebM duration fix failed:',
              error
            );

            // Continue with original blob
            finalBlob = rawBlob;

          }

        }

        this.uploadAudioMessage(
          finalBlob,
          usedMimeType
        );

      };
      // Start without timeslice
      this.mediaRecorder.start(1000);

      this.isRecording = true;
      this.recordingDuration = 0;

      this.recordingTimer = setInterval(() => {

        this.recordingDuration =
          Math.floor(
            (Date.now() - this.recordingStartTime)
            / 1000
          );

      }, 250);

    }
    catch (error) {

      console.error(
        'Microphone error:',
        error
      );

    }
  }



  stopRecording() {

    if (
      !this.mediaRecorder ||
      this.mediaRecorder.state !== 'recording'
    ) {
      return;
    }

    console.log(
      'Stopping recording after:',
      Date.now() - this.recordingStartTime,
      'ms'
    );

    this.mediaRecorder.stop();

    this.isRecording = false;

    if (this.recordingTimer) {

      clearInterval(
        this.recordingTimer
      );

      this.recordingTimer = null;

    }

  }



  cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }

    this.audioStream?.getTracks().forEach(track => track.stop());
    this.audioStream = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.recordingDuration = 0;
    this.recordingStartTime = 0;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }


  uploadAudioMessage(audioBlob: Blob, mimeType: string) {

    console.log('Uploading MIME:', mimeType);
    console.log('Uploading Blob Size:', audioBlob.size);

    let extension = 'm4a';

    if (mimeType.includes('webm')) {
      extension = 'webm';
    }
    else if (mimeType.includes('ogg')) {
      extension = 'ogg';
    }
    else if (mimeType.includes('mpeg')) {
      extension = 'mp3';
    }
    else if (mimeType.includes('aac')) {
      extension = 'aac';
    }
    else if (mimeType.includes('mp4')) {
      extension = 'm4a';
    }

    const fileName =
      `voice_${Date.now()}.${extension}`;

    const audioFile = new File(
      [audioBlob],
      fileName,
      {
        type: mimeType
      }
    );

    console.log(
      'File being uploaded:',
      audioFile.name,
      audioFile.type,
      audioFile.size
    );

    this.api.uploadFiles(
      [audioFile],
      'Chat',
      this.userDetails.UserID,
      'ChatAudio'
    )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Upload response:',
            res
          );

          if (res?.Status === 'Success') {

            this.sendAudioMessage(
              res.FileName
            );

          }

        },

        error: (err) => {

          console.error(
            'Audio upload failed:',
            err
          );

        }

      });

  }

  sendAudioMessage(fileName: string) {

    let recID = 0;
    let chatTypeToSend = this.GroupName;

    if (this.chatType === 'OneToOne') {

      recID = this.withUserID;
      chatTypeToSend = 'OneToOne';

    }
    else if (this.GroupName === 'Support') {

      recID = this.withUserID
        ? this.withUserID
        : this.supportUserID;

    }
    else if (this.GroupName === 'AskPandit') {

      recID = this.withUserID
        ? this.withUserID
        : this.AskPanditUserID;

    }

    const body = {

      chatGroupID:
        this.chatType === 'OneToOne'
          ? 0
          : Number(this.customGroupID),

      chatType: chatTypeToSend,

      senderID:
        this.userDetails.UserID,

      receiverID:
        recID,

      messageText: '',

      messageType: 'Audio',

      mediaURL: fileName,

      sentAt: new Date(),

      isDeleted: false

    };

    this.apinu
      .postUrlData(
        'MessagesInsert',
        body
      )
      .subscribe(() => {

        this.refreshAfterSend();

      });

  }


  loadAudio(msg: any) {

    if (
      !msg.MediaURL ||
      this.audioUrls[msg.MediaURL]
    ) {
      return;
    }

    this.apinu
      .downloadFile(
        'ChatAudio',
        msg.MediaURL
      )
      .subscribe({

        next: (blob: Blob) => {

          console.log(
            'Audio downloaded:',
            msg.MediaURL,
            blob.type,
            blob.size
          );

          const url =
            URL.createObjectURL(blob);

          this.audioUrls[msg.MediaURL] =
            url;

        },

        error: (err: any) => {

          console.error(
            'Audio download failed:',
            err
          );

        }

      });

  }

  // Chrome writes an invalid/Infinity duration on some MediaRecorder webm
  // blobs, which truncates playback. Seeking to a huge timestamp forces
  // Chrome to scan and recompute the real duration; this warms that up
  // in the background so the <audio> element plays back correctly.
  private fixAudioDuration(url: string) {
    const tempAudio = new Audio();
    tempAudio.src = url;
    tempAudio.preload = 'metadata';

    tempAudio.addEventListener('loadedmetadata', () => {
      if (tempAudio.duration === Infinity || isNaN(tempAudio.duration)) {
        tempAudio.currentTime = 1e101; // force seek past end
        tempAudio.addEventListener('timeupdate', function fixed() {
          tempAudio.removeEventListener('timeupdate', fixed);
          tempAudio.currentTime = 0;
          tempAudio.remove();
        });
      }
    });
  }

  // ── add this alongside your other recording fields ──
  private recordingStartTime = 0;

  // ── ngOnDestroy: revoke blob URLs to avoid leaks ──
  // ngOnDestroy() {
  //   this.stopPolling();
  //   Object.values(this.audioUrls).forEach(url => URL.revokeObjectURL(url));
  // }

  // private applyMessages(list: any[]) {

  //   const prevLen =
  //     this.allMessagesOfCurrentChatBox?.length || 0;

  //   this.allMessagesOfCurrentChatBox =
  //     list || [];

  //   // Load audio files
  //   this.allMessagesOfCurrentChatBox
  //     .filter(
  //       (msg: any) =>
  //         msg.MessageType === 'Audio' &&
  //         msg.MediaURL
  //     )
  //     .forEach(
  //       (msg: any) =>
  //         this.loadAudio(msg)
  //     );

  //   if (
  //     this.allMessagesOfCurrentChatBox.length >
  //     prevLen
  //   ) {

  //     setTimeout(
  //       () => this.scrollToBottom(),
  //       60
  //     );

  //   }

  // }


  // ── add these two helpers anywhere in the class ──


  private applyMessages(list: any[]) {

    const prevLen = this.allMessagesOfCurrentChatBox?.length || 0;
    const newList = list || [];
  
    // Only ring for messages that arrive AFTER the chat has already loaded once,
    // and only if at least one of the new ones wasn't sent by me.
    if (!this.isInitialLoad && newList.length > prevLen) {
      const newArrivals = newList.slice(prevLen);
      const hasIncoming = newArrivals.some((m: any) => !this.isMine(m.SenderID));
      if (hasIncoming) {
        this.playNotificationSound();
      }
    }
  
    this.allMessagesOfCurrentChatBox = newList;
    this.isInitialLoad = false;
  
    // Load audio files
    this.allMessagesOfCurrentChatBox
      .filter((msg: any) => msg.MessageType === 'Audio' && msg.MediaURL)
      .forEach((msg: any) => this.loadAudio(msg));
  
    if (this.allMessagesOfCurrentChatBox.length > prevLen) {
      setTimeout(() => this.scrollToBottom(), 60);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
    Object.values(this.audioUrls).forEach(url => URL.revokeObjectURL(url));
    this.notificationAudioCtx?.close();
  }

  private getSupportedMimeType(): string {

    const platform = Capacitor.getPlatform();

    let preferred: string[];

    if (platform === 'ios') {

      preferred = [
        'audio/mp4',
        'audio/aac'
      ];

    } else {

      // Android / Web
      preferred = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];

    }

    for (const type of preferred) {

      if (MediaRecorder.isTypeSupported(type)) {

        console.log(
          'Selected recording format:',
          type
        );

        return type;
      }

    }

    return '';
  }

  private extensionFromMime(mimeType: string): string {
    if (mimeType.includes('mp4')) return 'm4a';
    if (mimeType.includes('aac')) return 'aac';
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('mpeg')) return 'mp3';
    return 'webm';
  }

  private mimeFromExtension(ext: string): string {
    const map: Record<string, string> = {
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      mp3: 'audio/mpeg'
    };
    return map[ext] || 'audio/webm';
  }
}