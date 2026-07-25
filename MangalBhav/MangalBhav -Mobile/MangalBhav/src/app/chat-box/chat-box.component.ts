import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
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
  isLoggedIn: boolean = false;
  headerTitle: string = '';

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

  constructor(
    private route: ActivatedRoute,
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private api: Api,
    private storage: Storage,
    private http: HttpClient,
    private router: Router,
    public toastController: ToastController
  ) { }

  private playNotificationSound() {
    try {
      if (!this.notificationAudioCtx) {
        this.notificationAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = this.notificationAudioCtx;

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
      playTone(880, now, 0.15);
      playTone(1108, now + 0.18, 0.2);
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
      this.GroupName = this.chatType === 'OneToOne' ? this.withUserName : 'Chat';
      this.headerTitle = this.GroupName;
      return;
    }

    this.checkTermsAcceptance();

    // ── OneToOne (Pandit direct chat) ──
    if (this.chatType === 'OneToOne') {
      this.GroupName = this.withUserName;
      this.headerTitle = this.withUserName;
      this.loadOneToOneMessages();
      this.startPolling(() => this.loadOneToOneMessages());
      return;
    }

    // ── Support ──
    if (Number(groupId) === -1) {
      this.GroupName = 'Support';
      this.headerTitle = this.withUserID && this.withUserName
        ? `Support · ${this.withUserName}`
        : 'Support';
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
      this.headerTitle = this.withUserID && this.withUserName
        ? `AskPandit · ${this.withUserName}`
        : 'AskPandit';
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
        this.headerTitle = this.GroupName;
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

  private hasStaffAlreadyReplied(staffID: number): boolean {
    const list = this.allMessagesOfCurrentChatBox || [];
    return list.some((m: any) => Number(m.SenderID) === Number(staffID));
  }

  // ══════════════════════════════════════════════════════════
  // AUDIO RECORDING
  // ══════════════════════════════════════════════════════════

  isRecording = false;
  recordingDuration = 0;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private recordingTimer: any = null;
  private recordingStartTime = 0;

  // Store downloaded audio URLs
  audioUrls: { [key: string]: string } = {};

  async startRecording() {

    if (this.isRecording || this.audioStream) {
      console.warn('Recording already in progress — ignoring tap');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.showToast('Microphone not supported on this device', 'danger');
      return;
    }

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.audioStream, { mimeType })
        : new MediaRecorder(this.audioStream);

      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error);
        this.showToast('Recording failed — please try again', 'danger');
        this.cancelRecording();
      };

      this.mediaRecorder.onstop = async () => {

        const usedMimeType = this.mediaRecorder?.mimeType || mimeType || 'audio/webm';

        const rawBlob = new Blob(this.audioChunks, { type: usedMimeType });

        this.audioStream?.getTracks().forEach(track => track.stop());
        this.audioStream = null;

        try {
          // Convert to WAV so playback never depends on the WebView correctly
          // streaming/seeking a WebM+Opus (or AAC/MP4) container — WAV is raw
          // PCM with a trivial header, which every <audio> element decodes
          // fully and reliably regardless of platform/WebView version.
          const wavBlob = await this.convertToWav(rawBlob);
          this.uploadAudioMessage(wavBlob, 'audio/wav');
        } catch (error) {
          console.error('WAV conversion failed, falling back to original format:', error);
          this.uploadAudioMessage(rawBlob, usedMimeType);
        }
      };

      this.mediaRecorder.start(1000);

      this.isRecording = true;
      this.recordingDuration = 0;

      this.recordingTimer = setInterval(() => {
        this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      }, 250);

    } catch (error: any) {
      console.error('Microphone error:', error);

      this.audioStream?.getTracks().forEach(track => track.stop());
      this.audioStream = null;
      this.mediaRecorder = null;
      this.isRecording = false;

      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        this.showToast('Microphone permission denied. Enable it in device settings.', 'danger');
      } else if (error?.name === 'NotFoundError') {
        this.showToast('No microphone found on this device', 'danger');
      } else if (error?.name === 'NotReadableError') {
        this.showToast('Microphone is busy — try again', 'danger');
      } else {
        this.showToast('Could not start recording. Please try again.', 'danger');
      }
    }
  }

  stopRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;

    this.mediaRecorder.stop();
    this.isRecording = false;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
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

  // Decodes the recorded blob (whatever container/codec MediaRecorder used)
  // via Web Audio API and re-encodes it as a plain 16-bit PCM WAV file.
  // WAV has no complex sample-table/seek structure to be misparsed by
  // WebViews, which is what was causing playback to stop partway through
  // otherwise perfectly valid WebM/Opus and AAC/MP4 recordings.
  private async convertToWav(blob: Blob): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitDepth = 16;

    const samples = audioBuffer.length * numChannels;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    await audioCtx.close();
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 4000, color, position: 'top'
    });
    toast.present();
  }

  uploadAudioMessage(audioBlob: Blob, mimeType: string) {

    console.log('Uploading MIME:', mimeType);
    console.log('Uploading Blob Size:', audioBlob.size);

    let extension = 'm4a';

    if (mimeType.includes('wav')) {
      extension = 'wav';
    }
    else if (mimeType.includes('webm')) {
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

    const fileName = `voice_${Date.now()}.${extension}`;

    const audioFile = new File([audioBlob], fileName, { type: mimeType });

    console.log('File being uploaded:', audioFile.name, audioFile.type, audioFile.size);

    this.api.uploadFiles(
      [audioFile],
      'Chat',
      this.userDetails.UserID,
      'ChatAudio'
    ).subscribe({
      next: (res: any) => {
        console.log('Upload response:', res);
        if (res?.Status === 'Success') {
          this.sendAudioMessage(res.FileName);
        }
      },
      error: (err) => {
        console.error('Audio upload failed:', err);
        this.showToast('Failed to send voice message', 'danger');
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
      recID = this.withUserID ? this.withUserID : this.supportUserID;
    }
    else if (this.GroupName === 'AskPandit') {
      recID = this.withUserID ? this.withUserID : this.AskPanditUserID;
    }

    const body = {
      chatGroupID: this.chatType === 'OneToOne' ? 0 : Number(this.customGroupID),
      chatType: chatTypeToSend,
      senderID: this.userDetails.UserID,
      receiverID: recID,
      messageText: '',
      messageType: 'Audio',
      mediaURL: fileName,
      sentAt: new Date(),
      isDeleted: false
    };

    this.apinu.postUrlData('MessagesInsert', body).subscribe(() => {
      this.refreshAfterSend();
    });
  }

  private readonly chatAudioBaseUrl = 'https://app.mangalbhav.com/assets/ChatAudio/';

  getAudioUrl(mediaURL: string): string {
    //console.log(`${this.chatAudioBaseUrl}${mediaURL}`)
    return mediaURL ? `${this.chatAudioBaseUrl}${mediaURL}` : '';
  }


  trackByMessageId(index: number, msg: any): any {
    return msg.MessageID ?? index;
  }


  fixAudioElementDuration(event: Event) {
    const audio = event.target as HTMLAudioElement;
    console.log('duration:', audio.duration, 'readyState:', audio.readyState, 'src:', audio.src);

    audio.addEventListener('ended', () => {
      console.log('ENDED at currentTime:', audio.currentTime, 'vs duration:', audio.duration);
    }, { once: true });

    audio.addEventListener('error', () => {
      console.log('AUDIO ERROR:', audio.error?.code, audio.error?.message);
    }, { once: true });

    audio.addEventListener('stalled', () => console.log('STALLED'), { once: true });
    audio.addEventListener('suspend', () => console.log('SUSPEND'), { once: true });
  }


  private applyMessages(list: any[]) {

    const prevLen = this.allMessagesOfCurrentChatBox?.length || 0;
    const newList = list || [];

    if (!this.isInitialLoad && newList.length > prevLen) {
      const newArrivals = newList.slice(prevLen);
      const hasIncoming = newArrivals.some((m: any) => !this.isMine(m.SenderID));
      if (hasIncoming) {
        this.playNotificationSound();
      }
    }

    this.allMessagesOfCurrentChatBox = newList;
    this.isInitialLoad = false;



    if (this.allMessagesOfCurrentChatBox.length > prevLen) {
      setTimeout(() => this.scrollToBottom(), 60);
    }
  }

  ngOnDestroy() {
    this.stopPolling();

    this.notificationAudioCtx?.close();

    if (this.isRecording) {
      this.cancelRecording();
    }
  }

  private getSupportedMimeType(): string {

    const platform = Capacitor.getPlatform();

    let preferred: string[];

    if (platform === 'ios') {
      preferred = ['audio/mp4', 'audio/aac'];
    } else {
      preferred = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
    }

    for (const type of preferred) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Selected recording format:', type);
        return type;
      }
    }

    return '';
  }
}