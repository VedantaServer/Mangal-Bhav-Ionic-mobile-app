import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiNU } from 'src/providers';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    
    
    
  ],
})
export class FamilyComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('scannerVideo') scannerVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('scannerCanvas') scannerCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrCanvas') qrCanvasRef!: ElementRef<HTMLCanvasElement>;

  userDetails: any;
  family: any = null;
  members: any[] = [];

  loading = true;
  membersLoading = false;
  creating = false;
  joining = false;

  showCreateForm = false;
  showScanner = false;
  showJoinPreview = false;
  showQRSheet = false;

  // Join flow
  manualFamilyID: number | null = null;
  joinPreviewFamily: any = null;
  joinPreviewMemberCount = 0;
  alreadyMember = false;
  scannerError = '';
  MangalMudraPoints: any;
  // Scanner internals
  private stream: MediaStream | null = null;
  private scanInterval: any;
  private jsQR: any = null;

  newFamily = { FamilyName: '', FamilyDescription: '', FamilyAddress: '' };

  private readonly avatarColors = [
    '#8B1A00', '#5c1000', '#3d1000', '#b35a00', '#7a3d00', '#4a2800',
  ];

  constructor(private storage: Storage, private apinu: ApiNU, public routerCtrl: NavController,) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    // Load jsQR dynamically
    this.loadJsQR();
    await this.loadFamily();
    // Check if opened via deep link with fid param
    this.checkDeepLink();
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.stopScanner();
  }

  // ── Deep link check ────────────────────────────────────
  private checkDeepLink() {

    const url = new URL(window.location.href);
    const fid = url.searchParams.get('fid');

    if (!fid) {
      return;
    }

    if (!this.userDetails) {

      this.routerCtrl.navigateForward('/login');

      return;
    }

    if (!this.family) {

      this.manualFamilyID = Number(fid);

      this.joinByID();
    }
  }

  // ── Load jsQR from CDN ─────────────────────────────────
  private loadJsQR() {
    if ((window as any).jsQR) { this.jsQR = (window as any).jsQR; return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => { this.jsQR = (window as any).jsQR; };
    document.head.appendChild(script);
  }

  // ── Load QRious for QR generation ─────────────────────
  private loadQRious(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).QRious) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  // ── Load family ────────────────────────────────────────
  private async loadFamily() {
    this.loading = true;
    const userID = this.userDetails?.UserID;
    if (!userID) { this.loading = false; return; }

    this.apinu.postUrlData(`FamilySelectByQuery?Query=UserID=${userID}`, null).subscribe({
      next: (res: any) => {
        const list = res.FamilyList || [];
        if (list.length > 0) {
          this.family = list[0];
          this.loadMembers(this.family.FamilyID);
          this.loadMangalMudraPoints(this.family.FamilyID)
        } else {
          // Also check if user is a member of any family
          this.checkMembership(userID);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }


  // MangalMudraPoints: number = 0;

  loadMangalMudraPoints(id: any) {
    this.apinu.postUrlData(
      `FamilyMangalMudraPointsSelectByQuery?Query=FamilyID=${id}`,
      null
    ).subscribe((res: any) => {

      const result = res.FamilyMangalMudraPointList || [];

      this.MangalMudraPoints = 0;

      result.forEach((item: any) => {
        this.MangalMudraPoints += Number(item.PointsCount || 0);
      });

      console.log(this.MangalMudraPoints);
    });
  }


  // ── Check if user is member of another family ──────────
  private checkMembership(userID: number) {
    this.apinu.postUrlData(`FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null).subscribe({
      next: (res: any) => {
        const list = res.FamilyMembersList || [];
        if (list.length > 0) {
          const familyID = list[0].FamilyID;
          this.apinu.postUrlData(`FamilySelectByQuery?Query=FamilyID=${familyID}`, null).subscribe({
            next: (r: any) => {
              const fl = r.FamilyList || [];
              if (fl.length > 0) {
                this.family = fl[0];
                this.loadMembers(familyID);
              }
            }
          });
        }
      }
    });
  }

  // ── Load members ───────────────────────────────────────
  private loadMembers(familyID: number) {
    this.membersLoading = true;
    this.apinu.postUrlData(`FamilyMembersSelectByQuery?Query=FamilyID=${familyID}`, null).subscribe({
      next: (res: any) => {
        this.members = (res.FamilyMembersList || []).map((m: any) => ({
          ...m,
          initials: this.getInitials(m.Name || m.UserName || ''),
        }));
        this.membersLoading = false;
      },
      error: () => { this.membersLoading = false; }
    });
  }

  // ── Create family ──────────────────────────────────────
  createFamily() {
    if (!this.newFamily.FamilyName.trim()) return;
    this.creating = true;
    const userID = this.userDetails?.UserID;
    const tenantID = this.userDetails?.TenantID || 1;

    const familyPayload = {
      TenantID: Number(tenantID), UserID: Number(userID),
      FamilyName: this.newFamily.FamilyName.trim(),
      FamilyDescription: this.newFamily.FamilyDescription.trim(),
      FamilyAddress: this.newFamily.FamilyAddress.trim(),
      IsActive: true,
      DateAdded: new Date(), DateModified: new Date(),
      UpdatedByUser: String(userID),
    };

    this.apinu.postUrlData('FamilyInsert', familyPayload).subscribe({
      next: (res: any) => {
        const familyID = res.FamilyID;
        const memberPayload = {
          TenantID: Number(tenantID), FamilyID: Number(familyID),
          UserID: Number(userID), IsActive: true,
          DateAdded: new Date(), DateModified: new Date(),
          UpdatedByUser: String(userID),
        };
        this.apinu.postUrlData('FamilyMembersInsert', memberPayload).subscribe({
          next: () => {
            this.showCreateForm = false;
            this.creating = false;
            this.newFamily = { FamilyName: '', FamilyDescription: '', FamilyAddress: '' };
            this.loadFamily();
          },
          error: () => { this.creating = false; }
        });
      },
      error: () => { this.creating = false; }
    });
  }

  // ── QR Scanner ────────────────────────────────────────
  openJoinScanner() {
    this.showScanner = true;
    this.scannerError = '';
    setTimeout(() => this.startCamera(), 300);
  }

  closeScanner() {
    this.stopScanner();
    this.showScanner = false;
  }

  private async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const video = this.scannerVideoRef?.nativeElement;
      if (video) {
        video.srcObject = this.stream;
        video.play();
        this.scanInterval = setInterval(() => this.scanFrame(), 300);
      }
    } catch (e) {
      this.scannerError = 'Camera access denied. Please allow camera permission.';
    }
  }

  private scanFrame() {
    if (!this.jsQR) return;
    const video = this.scannerVideoRef?.nativeElement;
    const canvas = this.scannerCanvasRef?.nativeElement;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = this.jsQR(imageData.data, imageData.width, imageData.height);

    if (code?.data) {
      this.stopScanner();
      this.showScanner = false;
      this.handleQRData(code.data);
    }
  }

  private stopScanner() {
    clearInterval(this.scanInterval);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  // ── Handle scanned / manual QR data ───────────────────
  private handleQRData(data: string) {
    try {
      // QR contains JSON: { fid: 123, fn: "Sharma Parivar" }
      const parsed = JSON.parse(data);
      const fid = parsed.fid || parsed.FamilyID;
      if (fid) this.fetchFamilyForJoin(fid);
    } catch {
      // Try as plain number (Family ID)
      const fid = parseInt(data, 10);
      if (!isNaN(fid)) this.fetchFamilyForJoin(fid);
      else this.scannerError = 'Invalid QR code. Please scan a valid Mangal Bhav family QR.';
    }
  }

  joinByID() {
    if (!this.manualFamilyID) return;
    this.fetchFamilyForJoin(this.manualFamilyID);
  }

  private fetchFamilyForJoin(familyID: number) {
    this.apinu.postUrlData(`FamilySelectByQuery?Query=FamilyID=${familyID}`, null).subscribe({
      next: (res: any) => {
        const list = res.FamilyList || [];
        if (list.length > 0) {
          this.joinPreviewFamily = list[0];
          // Fetch member count
          this.apinu.postUrlData(`FamilyMembersSelectByQuery?Query=FamilyID=${familyID}`, null).subscribe({
            next: (r: any) => {
              const mlist = r.FamilyMembersList || [];
              this.joinPreviewMemberCount = mlist.length;
              const userID = this.userDetails?.UserID;
              this.alreadyMember = mlist.some((m: any) => m.UserID === userID);
            }
          });
          this.showJoinPreview = true;
        } else {
          alert('Family not found. Please check the ID.');
        }
      },
      error: () => alert('Error fetching family. Please try again.')
    });
  }

  // ── Join family ────────────────────────────────────────
  joinFamily() {
    if (!this.joinPreviewFamily) return;
    this.joining = true;
    const userID = this.userDetails?.UserID;
    const tenantID = this.userDetails?.TenantID || 1;

    const memberPayload = {
      TenantID: Number(tenantID),
      FamilyID: Number(this.joinPreviewFamily.FamilyID),
      UserID: Number(userID),
      IsActive: true,
      DateAdded: new Date(), DateModified: new Date(),
      UpdatedByUser: String(userID),
    };

    this.apinu.postUrlData('FamilyMembersInsert', memberPayload).subscribe({
      next: () => {
        this.joining = false;
        this.showJoinPreview = false;
        this.family = this.joinPreviewFamily;
        this.joinPreviewFamily = null;
        this.manualFamilyID = null;
        this.loadMembers(this.family.FamilyID);
      },
      error: () => { this.joining = false; }
    });
  }

  // ── Show QR Code ───────────────────────────────────────
  async showFamilyQR() {
    this.showQRSheet = true;
    await this.loadQRious();
    setTimeout(() => this.renderQR(), 100);
  }

  private renderQR() {
    const canvas = this.qrCanvasRef?.nativeElement;
    if (!canvas || !(window as any).QRious) return;

    const qrData = JSON.stringify({
      fid: this.family.FamilyID,
      fn: this.family.FamilyName,
      app: 'mangalbhav'
    });

    new (window as any).QRious({
      element: canvas,
      value: qrData,
      size: 220,
      background: '#FFF8E7',
      foreground: '#5c1000',
      level: 'H',
    });
  }

  // Watch showQRSheet to render QR when sheet opens
  get showQRSheetVal() { return this.showQRSheet; }
  set showQRSheetVal(v: boolean) {
    this.showQRSheet = v;
    if (v) { this.loadQRious().then(() => setTimeout(() => this.renderQR(), 150)); }
  }

  // ── WhatsApp Invite ────────────────────────────────────
  inviteOnWhatsApp() {
    const familyName = this.family?.FamilyName || 'हमारा परिवार';
    const familyID = this.family?.FamilyID;
    const userName = this.userDetails?.Name || 'एक सदस्य';

    // Deep link — on Android opens app, on iOS opens app, fallback to Play/App Store
    const appLink = `mangalbhav://join-family?fid=${familyID}`;
    const webFallback =
      `https://app.mangalbhav.com/myfamily?fid=${familyID}`;
    const storeAndroid = `https://play.google.com/store/apps/details?id=mobile.mangalbhav.com`;
    const storeIOS = `https://apps.apple.com/in/app/mangal-bhav/id6764030842`;

    const message =
      `🙏 *नमस्ते!*\n\n` +
      `*${userName}* ने आपको *${familyName}* परिवार में आमंत्रित किया है।\n\n` +
      `🚩 *Mangal Bhav* पर हमारे साथ पूजा, आरती और त्यौहार मनाएं।\n\n` +
      `📲 *App खोलें और Join करें:*\n${webFallback}\n\n` +
      `📥 *App डाउनलोड करें:*\n` +
      `Android: ${storeAndroid}\n` +
      `iOS: ${storeIOS}\n\n` +
      `_Family ID: ${familyID}_\n` +
      `🪔 जय श्री राम 🙏`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // ── Helpers ────────────────────────────────────────────
  avatarColor(i: number) { return this.avatarColors[i % this.avatarColors.length]; }

  private getInitials(name: string): string {
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  }



}