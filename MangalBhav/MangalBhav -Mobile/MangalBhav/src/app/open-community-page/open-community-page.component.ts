import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { LoggedoutbottomtabsComponent } from '../loggedoutbottomtabs/loggedoutbottomtabs.component';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';
import { IonContent } from '@ionic/angular';
import { ViewChild } from '@angular/core';

interface SevaItem { icon: string; name: string; sound: string; count: number; toast: string; }
interface PanchangData { label: string; value: string; sub: string; auspicious?: boolean; avoid?: boolean; }
interface UpcomingEvent { day: string; month: string; title: string; time: string; location: string; free: boolean; }
interface Prayer { initials: string; name: string; time: string; city: string; text: string; blessingsCount: number; userBlessed: boolean; }
interface AartiStep { icon: string; label: string; sub: string; sub2?: string; }

@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
     TabscommonheaderComponent,
     PanditjibottomtabsComponent, CommonBottomTabsComponent
  ]
})
export class OpenCommunityPageComponent implements OnInit, AfterViewInit, OnDestroy {


  @ViewChild('pageContent', { static: false })
  pageContent!: IonContent;

  userDetails: any;
  todayFestivalsLabel = '🪔 आज के त्यौहार';
  userLoggedIn = false;

  // ── Family Active Mandir (hero display) ───────────────
  familyActiveMandir: any = null;
  familyMandirPhotoUrl: string | null = null;
  familyMandirPhoto2Url: string | null = null;
  familyMandirPhoto3Url: string | null = null;
  familyMandirSlideIndex = 0;
  private familyMandirSlideTimer: any;

  darshanaCount = 2847;
  private darshanaInterval: any;

  // ── Regular Toast ──────────────────────────────────────
  toastVisible = false;
  toastIcon = '🙏';
  toastMessage = '';
  private toastTimer: any;

  // ── Mini Toast (no bg, tiny — for "आरती रोकी गई") ─────
  miniToastVisible = false;
  miniToastMessage = '';
  private miniToastTimer: any;

  isGlowing = false;
  bellRinging = false;
  mantraPlaying = false;
  shankhPlaying = false;
  private bellAudio: HTMLAudioElement | null = null;
  private mantraAudio: HTMLAudioElement | null = null;
  private shankhAudio: HTMLAudioElement | null = null;
  private chalisaAudio: HTMLAudioElement | null = null;
  private aartiBhajan: HTMLAudioElement | null = null;
  // ── Canvas ─────────────────────────────────────────────
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: any[] = [];
  private animationId = 0;
  private flowersAutoStopTimer: any;

  // ── Mantra ─────────────────────────────────────────────
  private mantraIndex = 0;
  readonly mantras = [
    { sanskrit: 'ॐ हनुमते नमः', meaning: 'I bow to Lord Hanuman' },
    { sanskrit: 'जय श्री राम', meaning: 'Victory to Lord Ram' },
    { sanskrit: 'ॐ नमो हनुमते रुद्रावताराय', meaning: 'Salutations to Hanuman, avatar of Rudra' },
    { sanskrit: 'राम राम राम', meaning: 'Chant of Lord Ram' },
  ];
  currentMantra = this.mantras[0];
  private mantraTimer: any;

  // ── 21-Second Mangal Aarti State Machine ───────────────
  aartiPhase: 'idle' | 'running' | 'blessed' = 'idle';
  currentAartiStepData: AartiStep = { icon: '🪔', label: 'मंगल आरती', sub: '' };
  aartiProgress = 0;
  private aartiTimers: any[] = [];
  private aartiSeqInterval: any;
  totalSanchay = 1284;
  blessingCountdown = 60;
  private blessingCDInterval: any;

  // Sequence definition — matches the 21-sec flow
  private readonly aartiSequence: Array<{ time: number; step: AartiStep; action: string }> = [
    { time: 0, action: 'bell', step: { icon: '🔔', label: 'घंटी', sub: 'मंदिर घंटी बजाएं' } },
    { time: 2000, action: 'shankh', step: { icon: '🐚', label: 'शंख नाद', sub: 'शंख ध्वनि' } },
    { time: 4000, action: 'bhajan', step: { icon: '🚩', label: 'हनुमान जी दर्शन', sub: 'ॐ श्री हनुमते नमः' } },
    { time: 6000, action: 'flowers', step: { icon: '🪔', label: 'मंगल आरती', sub: 'मंगल भवन अमंगल हारी,', sub2: 'द्रवहु सो दसरथ अजर बिहारी॥' } },
    { time: 15000, action: 'petals', step: { icon: '🌺', label: 'पुष्प अर्पण', sub: 'भक्ति से पुष्प चढ़ाए' } },
    { time: 18000, action: 'jai', step: { icon: '🙏', label: 'जय श्री राम', sub: 'जय बजरंग बली 🚩' } },
    { time: 33000, action: 'stop_bhajan', step: { icon: '✨', label: 'आशीर्वाद', sub: 'तुम्हारी भक्ति स्वीकार हुई' } },
    { time: 34000, action: 'complete', step: { icon: '✨', label: '', sub: '' } },
  ];
  // ── Seva ───────────────────────────────────────────────
  sevaItems: SevaItem[] = [
    { icon: '🧡', name: 'सिंदूर', sound: 'sindoor', count: 1243, toast: 'सिंदूर चढ़ाया गया 🧡' },
    { icon: '🍬', name: 'प्रसाद', sound: 'prasad', count: 988, toast: 'प्रसाद अर्पित हुआ 🍬' },
    { icon: '🥥', name: 'नारियल', sound: 'narial', count: 756, toast: 'नारियल फोड़ा गया 🥥' },
    { icon: '🪷', name: 'कमल', sound: 'kamal', count: 2101, toast: 'कमल पुष्प चढ़ाया 🪷' },
  ];

  language = 'English';
  chalisaPlaying = false;
  chalisaProgress = 0;
  currentVerse = 0;
  chalisaTimeDisplay = '0:00';
  private chalisaProgressInterval: any;
  readonly chalisaVerses = [
    'श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि',
    'बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि',
    'बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार',
    'बल बुधि बिद्या देहु मोहिं, हरहु कलेस बिकार',
    'जय हनुमान ज्ञान गुन सागर',
    'जय कपीस तिहुँ लोक उजागर',
    'राम दूत अतुलित बल धामा',
    'अंजनि-पुत्र पवनसुत नामा',
  ];

  todayDate = '';
  panchangData: PanchangData[] = [];

  upcomingEvents: UpcomingEvent[] = [
    { day: '27', month: 'MAY', title: 'Mangalwar Sundarkand Path', time: '6:00 AM', location: 'Online', free: true },
    { day: '31', month: 'MAY', title: 'Havan & Prasad Distribution', time: '7:00 AM', location: 'Delhi NCR', free: false },
    { day: '04', month: 'JUN', title: 'Hanuman Jayanti Celebration', time: '5:00 AM', location: 'All Temples', free: true },
  ];

  prayerWall: Prayer[] = [
    { initials: 'R', name: 'Rajesh Sharma', time: '2 hrs ago', city: 'Delhi', text: 'बजरंगबली की कृपा से मेरे पुत्र की परीक्षा में सफलता मिली। जय हनुमान 🙏', blessingsCount: 128, userBlessed: false },
    { initials: 'S', name: 'Sunita Devi', time: '5 hrs ago', city: 'Varanasi', text: 'Please pray for my family\'s health and happiness. Jai Bajrangbali! 🔥', blessingsCount: 74, userBlessed: false },
    { initials: 'A', name: 'Amit Tiwari', time: '8 hrs ago', city: 'Lucknow', text: 'मेरी माँ की बीमारी के लिए प्रार्थना करें। हनुमान जी जरूर सुनेंगे 🌺', blessingsCount: 201, userBlessed: false },
  ];

  todayFestivals: any[] = [];
  festivalLoading = true;

  allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showAddMandirForm = false;
  isSubmittingMandir = false;
  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;
  MangalMudraPoints: number = 0;
  // ── Family Mandir ──────────────────────────────────────
  showFamilyMandirForm = false;
  isSubmittingFamilyMandir = false;

  familyMandir = {
    TenantID: 1, FamilyID: 0,
    MandirName: '', MandirDescription: '', GodName: '',
    MandirPhoto1: '', MandirPhoto2: '', MandirPhoto3: '',
    AartiName1: '', AartiName2: '', AartiName3: '',
    IsActive: false,
    DateAdded: new Date(), DateModified: new Date(),
    UpdatedByUser: ''
  };

  // Photo slots
  fmPhoto1File: File | null = null; fmPhoto1Preview: string | null = null; fmUploading1 = false;
  fmPhoto2File: File | null = null; fmPhoto2Preview: string | null = null; fmUploading2 = false;
  fmPhoto3File: File | null = null; fmPhoto3Preview: string | null = null; fmUploading3 = false;

  // ── Family Mandir Audio slots ──────────────────────────
  fmAudio1File: File | null = null; fmAudio1Name: string | null = null; fmUploadingA1 = false;
  fmAudio2File: File | null = null; fmAudio2Name: string | null = null; fmUploadingA2 = false;
  fmAudio3File: File | null = null; fmAudio3Name: string | null = null; fmUploadingA3 = false;
  // ── Family Mandir Aarti Audio players ──────────────────
  familyAartiCurrentAudio: HTMLAudioElement | null = null;
  familyAartiPlayingSlot: string | null = null;
  familyAartiLoadingSlot: string | null = null;
  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    if (this.userDetails?.LoginID) this.userLoggedIn = true;
    this.language = this.userDetails?.Languages || 'English';
    this.startDarshanaCounter();
    this.startMantraRotation();
    this.buildPanchang();
    this.loadMangalMudraPoints();
    this.loadFamilyActiveMandir();
  }


  loadMangalMudraPoints() {
    this.apinu.postUrlData(`FamilyMangalMudraPointsSelectByQuery?Query=UserID=${this.userDetails?.UserID}`, null)
      .subscribe((res: any) => {
        const result = res.FamilyMangalMudraPointList || [];
        this.MangalMudraPoints = 0;
        result.forEach((item: any) => {
          this.MangalMudraPoints += Number(item.PointsCount || 0);
        });
        console.log(this.MangalMudraPoints);
      });
  }


  ngAfterViewInit() { this.initCanvas(); }

  ngOnDestroy() {
    clearInterval(this.darshanaInterval);
    clearInterval(this.mantraTimer);
    clearInterval(this.chalisaProgressInterval);
    clearInterval(this.aartiSeqInterval);
    clearInterval(this.blessingCDInterval);
    clearTimeout(this.flowersAutoStopTimer);
    clearTimeout(this.toastTimer);
    clearTimeout(this.miniToastTimer);
    clearInterval(this.familyMandirSlideTimer);
    this.aartiTimers.forEach(t => clearTimeout(t));
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.stopAllAudio();
    this.stopFamilyAarti();
  }

  goBack() { this.routerCtrl.back(); }
  openPage(p: any) { this.routerCtrl.navigateForward(`/${p}`); }

  private startDarshanaCounter() {
    this.darshanaInterval = setInterval(() => {
      const delta = Math.floor(Math.random() * 11) - 5;
      this.darshanaCount = Math.max(2000, this.darshanaCount + delta);
    }, 3000);
  }

  private startMantraRotation() {
    this.mantraTimer = setInterval(() => {
      this.mantraIndex = (this.mantraIndex + 1) % this.mantras.length;
      this.currentMantra = this.mantras[this.mantraIndex];
    }, 8000);
  }

  // ── Audio helper ───────────────────────────────────────
  private playAudio(currentRef: HTMLAudioElement | null, src: string, onEnded?: () => void): HTMLAudioElement {
    if (currentRef) { currentRef.pause(); currentRef.currentTime = 0; currentRef.onended = null; }
    const audio = new Audio(src);
    if (onEnded) audio.onended = onEnded;
    audio.play()?.catch(() => { });
    return audio;
  }

  // ── Mantra strip ───────────────────────────────────────
  playMantra() {
    if (this.mantraPlaying) {
      if (this.mantraAudio) { this.mantraAudio.pause(); this.mantraAudio.currentTime = 0; this.mantraAudio.onended = null; }
      this.mantraAudio = null;
      this.mantraPlaying = false;
      this.showToast('🔇', 'मंत्र रोका गया');
    } else {
      this.mantraAudio = this.playAudio(this.mantraAudio, 'assets/audio/mantra.mp3', () => {
        this.mantraPlaying = false;
        this.mantraAudio = null;
      });
      this.mantraPlaying = true;
      this.showToast('🔊', 'मंत्र बज रहा है...');
    }
  }

  // ── Canvas ─────────────────────────────────────────────
  initCanvas() {
    this.canvas = document.getElementById('flowerCanvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    const container = document.querySelector('.hanuman-container') as HTMLElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width);
    this.canvas.height = Math.round(rect.height);
    this.ctx = this.canvas.getContext('2d');
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private startFlowers(type: 'flowers' | 'petals' = 'flowers') {
    this.initCanvas();
    if (!this.canvas || !this.ctx) return;
    const emojis = type === 'flowers' ? ['🌸', '🌺', '🌼', '🌻', '🪷', '🌹'] : ['🌸', '🪷', '🌸', '🌺'];
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = 0; }
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20 - Math.random() * 120,
        size: 16 + Math.random() * 12,
        speed: 1.8 + Math.random() * 2.2,
        drift: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        opacity: 1,
      });
    }
    this.animateCanvas();
  }

  private animateCanvas() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter(p => p.y < this.canvas!.height + 30 && p.opacity > 0.05);
    for (const p of this.particles) {
      p.y += p.speed; p.x += p.drift; p.rotation += p.rotSpeed;
      if (p.y > this.canvas.height * 0.65) p.opacity -= 0.012;
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.font = `${p.size}px serif`;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillText(p.emoji, 0, 0);
      this.ctx.restore();
    }
    this.ctx.globalAlpha = 1;
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animateCanvas());
    } else {
      this.animationId = 0;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private stopFlowers() {
    clearTimeout(this.flowersAutoStopTimer);
    this.particles.forEach(p => { p.opacity = Math.min(p.opacity, 0.25); });
    this.flowersAutoStopTimer = setTimeout(() => {
      this.particles = [];
      if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = 0; }
      if (this.canvas && this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, 700);
  }

  // ── 21-Second Mangal Aarti ─────────────────────────────
  startMangalAarti() {
    if (this.aartiPhase !== 'idle') return;
    this.hideChrome();
    this.aartiPhase = 'running';
    this.isGlowing = true;
    this.aartiProgress = 0;
    this.aartiTimers = [];

    // ✅ Use real wall-clock time — immune to interval drift
    const startTime = Date.now();
    const TOTAL_MS = 34000;

    this.aartiSeqInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.aartiProgress = Math.min(100, (elapsed / TOTAL_MS) * 100);
    }, 100);

    // Schedule each step in the sequence
    this.aartiSequence.forEach(item => {
      const t = setTimeout(() => {
        if (this.aartiPhase !== 'running') return;

        if (item.action !== 'complete') {
          this.currentAartiStepData = item.step;
        }

        switch (item.action) {
          case 'bell':
            this.bellRinging = true;
            this.bellAudio = this.playAudio(this.bellAudio, 'assets/audio/bell.mp3', () => { this.bellAudio = null; });
            setTimeout(() => { this.bellRinging = false; }, 1800);
            break;

          case 'shankh':
            if (this.bellAudio) { this.bellAudio.pause(); this.bellAudio = null; }
            this.shankhAudio = this.playAudio(null, 'assets/audio/shankh.mp3', () => { this.shankhAudio = null; });
            break;

          case 'bhajan':
            if (this.shankhAudio) { this.shankhAudio.pause(); this.shankhAudio = null; }
            this.aartiBhajan = this.playAudio(null, 'assets/audio/aarti_bhajan.mp3', () => {
              this.aartiBhajan = null;
            });
            break;

          case 'stop_bhajan':
            if (this.aartiBhajan) {
              // Fade out gracefully
              const fadeOut = setInterval(() => {
                if (!this.aartiBhajan) { clearInterval(fadeOut); return; }
                this.aartiBhajan.volume = Math.max(0, this.aartiBhajan.volume - 0.1);
                if (this.aartiBhajan.volume <= 0) {
                  this.aartiBhajan.pause();
                  this.aartiBhajan = null;
                  clearInterval(fadeOut);
                }
              }, 80);
            }
            break;

          case 'flowers':
            this.startFlowers('flowers');
            break;

          case 'petals':
            this.startFlowers('petals');
            break;

          case 'end_flowers':
            this.stopFlowers();
            break;

          case 'complete':
            this.completeAarti();
            break;
        }
      }, item.time);

      this.aartiTimers.push(t);
    });
  }

  stopMangalAarti() {
    if (this.aartiPhase !== 'running') return;
    this.aartiTimers.forEach(t => clearTimeout(t));
    this.aartiTimers = [];
    clearInterval(this.aartiSeqInterval);
    this.aartiProgress = 0;
    this.aartiPhase = 'idle';
    this.isGlowing = false;
    this.bellRinging = false;
    this.stopFlowers();
    this.stopAllAudio();
    this.showChrome();
    this.showMiniToast('आरती रोकी गई');
  }

  private completeAarti() {
    this.aartiTimers = [];
    clearInterval(this.aartiSeqInterval);
    this.aartiProgress = 100;
    this.aartiPhase = 'blessed';
    this.isGlowing = false;
    this.stopAllAudio();
    this.stopFlowers();
    this.showChrome();
    this.totalSanchay += 21;


    this.saveMangalMudraPoints();


    // 60-second countdown, then restore button
    this.blessingCountdown = 30;
    this.blessingCDInterval = setInterval(() => {
      this.blessingCountdown--;
      if (this.blessingCountdown <= 0) {
        clearInterval(this.blessingCDInterval);
        this.aartiPhase = 'idle';
        this.aartiProgress = 0;
      }
    }, 1000);
  }

  saveMangalMudraPoints() {

    const userID = this.userDetails?.UserID;
    const tenantID = this.userDetails?.TenantID || 1;

    // Check whether user belongs to a family
    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`,
      null
    ).subscribe({
      next: (res: any) => {

        const list = res.FamilyMemberList || [];

        const payload = {
          TenantID: tenantID,
          FamilyID: list.length > 0 ? list[0].FamilyID : 0,
          UserID: userID,
          PointsCount: String(21),
          IsActive: true,
          DateAdded: new Date(),
          DateModified: new Date(),
          UpdatedByUser: userID.toString()
        };

        this.apinu.postUrlData(
          'FamilyMangalMudraPointsInsert',
          payload
        ).subscribe({
          next: () => {
            console.log('21 points added');
            this.loadMangalMudraPoints();
          },
          error: (err: any) => {
            console.log('Point insert failed', err);
            this.loadMangalMudraPoints();
          }
        });

      }
    });
  }
  // ── Seva grid ──────────────────────────────────────────
  offerSeva(seva: SevaItem) {
    seva.count++;
    this.showToast(seva.icon, seva.toast);
    this.startFlowers('petals');
    clearTimeout(this.flowersAutoStopTimer);
    this.flowersAutoStopTimer = setTimeout(() => this.stopFlowers(), 4000);
  }

  // ── Chalisa ────────────────────────────────────────────
  toggleChalisa() { this.chalisaPlaying ? this.pauseChalisa() : this.playChalisa(); }

  private playChalisa() {
    this.chalisaPlaying = true;
    if (!this.chalisaAudio) this.chalisaAudio = new Audio('assets/audio/hanuman_chalisa.mp3');
    this.chalisaAudio.play()?.catch(() => { });
    this.chalisaProgressInterval = setInterval(() => {
      this.chalisaProgress = Math.min(100, this.chalisaProgress + 0.2);
      const totalSec = Math.floor((this.chalisaProgress / 100) * 504);
      const m = Math.floor(totalSec / 60), s = totalSec % 60;
      this.chalisaTimeDisplay = `${m}:${s.toString().padStart(2, '0')}`;
      this.currentVerse = Math.floor((this.chalisaProgress / 100) * this.chalisaVerses.length) % this.chalisaVerses.length;
      if (this.chalisaProgress >= 100) this.pauseChalisa();
    }, 1000);
  }

  private pauseChalisa() {
    this.chalisaPlaying = false;
    clearInterval(this.chalisaProgressInterval);
    this.chalisaAudio?.pause();
  }

  nextVerse() { this.currentVerse = (this.currentVerse + 1) % this.chalisaVerses.length; }
  previousVerse() { this.currentVerse = (this.currentVerse - 1 + this.chalisaVerses.length) % this.chalisaVerses.length; }

  // ── Panchang / Festivals ───────────────────────────────
  private buildPanchang() {
    const now = new Date();
    this.todayDate = now.toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.fetchTodayFestivals();
  }

  private fetchTodayFestivals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    this.festivalLoading = true;
    this.apinu.postUrlData(`FestivalsSelectByQuery?Query=CONVERT(date, FestivalDate) = '${dateStr}'`, null).subscribe({
      next: (res: any) => {
        const list = res.FestivalList || [];
        if (list.length > 0) {
          this.todayFestivals = list;
          this.todayFestivalsLabel = '🪔 आज के त्यौहार';
          this.festivalLoading = false;
        } else {
          this.fetchNearestFromAll(today);
        }
      },
      error: () => { this.fetchNearestFromAll(today); }
    });
  }

  private fetchNearestFromAll(fromDate: Date) {
    this.apinu.postUrlData(`FestivalSelectAll?tenantID=1`, null).subscribe({
      next: (res: any) => {
        const all: any[] = res.FestivalList || [];
        if (!all.length) { this.todayFestivals = []; this.festivalLoading = false; return; }
        const future = all
          .filter((f: any) => new Date(f.FestivalDate) >= fromDate)
          .sort((a: any, b: any) => new Date(a.FestivalDate).getTime() - new Date(b.FestivalDate).getTime());
        if (!future.length) { this.todayFestivals = []; this.festivalLoading = false; return; }
        const nearest = new Date(future[0].FestivalDate).toDateString();
        this.todayFestivals = future.filter((f: any) => new Date(f.FestivalDate).toDateString() === nearest);
        const d = new Date(future[0].FestivalDate);
        const dayName = d.toLocaleDateString('hi-IN', { weekday: 'long' });
        const dateLabel = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        this.todayFestivalsLabel = `📅 अगला त्यौहार — ${dayName}, ${dateLabel}`;
        this.festivalLoading = false;
      },
      error: () => { this.todayFestivals = []; this.festivalLoading = false; }
    });
  }

  getFestivalEmoji(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('diwali') || n.includes('deepavali')) return '🪔';
    if (n.includes('holi')) return '🎨';
    if (n.includes('navratri')) return '🕺';
    if (n.includes('dussehra') || n.includes('durga')) return '🦁';
    if (n.includes('ganesh')) return '🐘';
    if (n.includes('krishna') || n.includes('janmashtami')) return '🦚';
    if (n.includes('ram') || n.includes('navami')) return '🏹';
    if (n.includes('eid')) return '🌙';
    if (n.includes('christmas')) return '⛪';
    if (n.includes('guru') || n.includes('nanak')) return '🙏';
    if (n.includes('puja')) return '🪷';
    if (n.includes('new year')) return '🎉';
    if (n.includes('pradosh') || n.includes('प्रदोष')) return '🕉️';
    if (n.includes('ekadashi') || n.includes('एकादशी')) return '🌿';
    if (n.includes('purnima') || n.includes('पूर्णिमा')) return '🌕';
    if (n.includes('amavasya') || n.includes('अमावस्या')) return '🌑';
    if (n.includes('sankranti') || n.includes('संक्रांति')) return '🌞';
    if (n.includes('shivratri') || n.includes('शिवरात्रि')) return '🔱';
    if (n.includes('vrat') || n.includes('व्रत')) return '🙏';
    return '🪔';
  }

  getFestivalName(f: any): string { return this.language === 'Hindi' && f.FestivalNameHindi?.trim() ? f.FestivalNameHindi.trim() : f.FestivalName; }
  getFestivalDay(f: any): string { return this.language === 'Hindi' && f.FestivalDayHindi?.trim() ? f.FestivalDayHindi.trim() : f.FestivalDay?.trim(); }
  getFestivalDesc(f: any): string { return this.language === 'Hindi' && f.DescriptionHindi?.trim() ? f.DescriptionHindi.trim() : f.Description?.trim(); }

  // ── Events & Prayer ────────────────────────────────────
  rsvpEvent(event: UpcomingEvent) { this.showToast('🗓️', `"${event.title}" के लिए RSVP हो गया!`); }

  blessings(prayer: Prayer) {
    if (prayer.userBlessed) { prayer.blessingsCount--; prayer.userBlessed = false; }
    else { prayer.blessingsCount++; prayer.userBlessed = true; this.showToast('🙏', 'आशीर्वाद भेजा गया!'); }
  }

  openPrayerModal() { this.showToast('✍️', 'प्रार्थना लिखें...'); }
  replyPrayer(prayer: Prayer) { this.showToast('💬', `${prayer.name} को उत्तर दें`); }

  // ── Toasts ─────────────────────────────────────────────
  showToast(icon: string, message: string) {
    this.toastIcon = icon;
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  showMiniToast(message: string) {
    this.miniToastMessage = message;
    this.miniToastVisible = true;
    clearTimeout(this.miniToastTimer);
    this.miniToastTimer = setTimeout(() => { this.miniToastVisible = false; }, 2000);
  }

  private stopAllAudio() {
    [this.shankhAudio, this.bellAudio, this.chalisaAudio, this.mantraAudio, this.aartiBhajan].forEach(a => {
      if (a) { a.pause(); a.onended = null; }
    });
    this.shankhAudio = null; this.bellAudio = null;
    this.chalisaAudio = null; this.mantraAudio = null;
    this.mantraPlaying = false; this.shankhPlaying = false; this.bellRinging = false; this.aartiBhajan = null;
  }

  // private hideChrome() {
  //   const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
  //   if (fab) fab.style.display = 'none';

  //   const header = document.querySelector('app-tabscommonheader') as HTMLElement;
  //   if (header) header.style.display = 'none';

  //   const bottomTabs = document.querySelector('app-common-bottom-tabs') as HTMLElement;
  //   if (bottomTabs) bottomTabs.style.display = 'none';

  //   const panditTabs = document.querySelector('app-panditjibottomtabs') as HTMLElement;
  //   if (panditTabs) panditTabs.style.display = 'none';
  // }

  // private showChrome() {
  //   const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
  //   if (fab) fab.style.display = 'flex';

  //   const header = document.querySelector('app-tabscommonheader') as HTMLElement;
  //   if (header) header.style.display = '';

  //   const bottomTabs = document.querySelector('app-common-bottom-tabs') as HTMLElement;
  //   if (bottomTabs) bottomTabs.style.display = '';

  //   const panditTabs = document.querySelector('app-panditjibottomtabs') as HTMLElement;
  //   if (panditTabs) panditTabs.style.display = '';
  // }

  // ── NEW property (add near other booleans) ────────────────
  chromeHidden = false;

  // ── REPLACE hideChrome() ──────────────────────────────────
  private hideChrome() {
    this.chromeHidden = true;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'none';
  }

  // ── REPLACE showChrome() ──────────────────────────────────
  private showChrome() {
    this.chromeHidden = false;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }

  // ── Open form — check family first ────────────────────
  openFamilyMandirForm() {
    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');
      this.routerCtrl.navigateForward('/login');
      return;
    }

    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.FamilyMemberList || [];
        if (!list.length) {
          this.showToast('🏠', 'पहले परिवार बनाएं या जॉइन करें');
          this.routerCtrl.navigateForward('/myfamily');
          return;
        }
        // Reset and open
        this.familyMandir = {
          TenantID: this.userDetails?.TenantID || 1,
          FamilyID: list[0].FamilyID,
          MandirName: '', MandirDescription: '', GodName: '',
          MandirPhoto1: '', MandirPhoto2: '', MandirPhoto3: '',
          AartiName1: '', AartiName2: '', AartiName3: '',
          IsActive: false,
          DateAdded: new Date(), DateModified: new Date(),
          UpdatedByUser: String(userID)
        };
        this.fmPhoto1File = null; this.fmPhoto1Preview = null;
        this.fmPhoto2File = null; this.fmPhoto2Preview = null;
        this.fmPhoto3File = null; this.fmPhoto3Preview = null;
        this.showFamilyMandirForm = true;
        this.fmAudio1File = null; this.fmAudio1Name = null;
        this.fmAudio2File = null; this.fmAudio2Name = null;
        this.fmAudio3File = null; this.fmAudio3Name = null;
      }
    });
  }

  // ── Photo select ───────────────────────────────────────
  onFmPhotoSelected(event: any, slot: 1 | 2 | 3) {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if (slot === 1) { this.fmPhoto1File = file; this.familyMandir.MandirPhoto1 = ''; reader.onload = (e: any) => this.fmPhoto1Preview = e.target.result; }
    else if (slot === 2) { this.fmPhoto2File = file; this.familyMandir.MandirPhoto2 = ''; reader.onload = (e: any) => this.fmPhoto2Preview = e.target.result; }
    else { this.fmPhoto3File = file; this.familyMandir.MandirPhoto3 = ''; reader.onload = (e: any) => this.fmPhoto3Preview = e.target.result; }
  }

  // ── Photo upload (same api pattern as MandirInsertUpdate) ─
  uploadFmPhoto(slot: 1 | 2 | 3) {
    const file = slot === 1 ? this.fmPhoto1File : slot === 2 ? this.fmPhoto2File : this.fmPhoto3File;
    if (!file) return;
    if (slot === 1) this.fmUploading1 = true;
    else if (slot === 2) this.fmUploading2 = true;
    else this.fmUploading3 = true;

    this.api.uploadImage([file], 'ProfilePhoto', 'mandir', 'ProfilePhoto').subscribe({
      next: (res: any) => {
        const ok = res?.Status === 'Success';
        if (slot === 1) { this.fmUploading1 = false; if (ok) { this.familyMandir.MandirPhoto1 = res.FileName; this.fmPhoto1File = null; this.showToast('📷', 'फ़ोटो 1 अपलोड हुई ✅'); } }
        else if (slot === 2) { this.fmUploading2 = false; if (ok) { this.familyMandir.MandirPhoto2 = res.FileName; this.fmPhoto2File = null; this.showToast('📷', 'फ़ोटो 2 अपलोड हुई ✅'); } }
        else { this.fmUploading3 = false; if (ok) { this.familyMandir.MandirPhoto3 = res.FileName; this.fmPhoto3File = null; this.showToast('📷', 'फ़ोटो 3 अपलोड हुई ✅'); } }
      },
      error: () => {
        if (slot === 1) this.fmUploading1 = false;
        else if (slot === 2) this.fmUploading2 = false;
        else this.fmUploading3 = false;
        this.showToast('❌', 'अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }

  // ── Submit ─────────────────────────────────────────────
  submitFamilyMandir() {
    if (!this.familyMandir.MandirName.trim()) { this.showToast('⚠️', 'मंदिर का नाम दर्ज करें'); return; }
    if (!this.familyMandir.GodName.trim()) { this.showToast('⚠️', 'देवता का नाम दर्ज करें'); return; }
    if (this.fmPhoto1File) { this.showToast('⚠️', 'फ़ोटो 1 पहले अपलोड करें ⬆'); return; }
    if (this.fmPhoto2File) { this.showToast('⚠️', 'फ़ोटो 2 पहले अपलोड करें ⬆'); return; }
    if (this.fmPhoto3File) { this.showToast('⚠️', 'फ़ोटो 3 पहले अपलोड करें ⬆'); return; }

    if (this.fmAudio1File) { this.showToast('⚠️', 'आरती 1 ऑडियो पहले अपलोड करें ⬆'); return; }
    if (this.fmAudio2File) { this.showToast('⚠️', 'आरती 2 ऑडियो पहले अपलोड करें ⬆'); return; }
    if (this.fmAudio3File) { this.showToast('⚠️', 'आरती 3 ऑडियो पहले अपलोड करें ⬆'); return; }

    this.isSubmittingFamilyMandir = true;
    this.familyMandir.DateModified = new Date();

    this.apinu.postUrlData('FamilyMandirInsert', this.familyMandir).subscribe({
      next: () => {
        this.isSubmittingFamilyMandir = false;
        this.showFamilyMandirForm = false;
        this.showToast('🛕', 'मंदिर जमा हुआ! Admin अनुमोदन के बाद दिखेगा 🙏');
        this.loadFamilyActiveMandir();  // ← add this
      },
      error: () => {
        this.isSubmittingFamilyMandir = false;
        this.showToast('❌', 'कुछ गलत हुआ, पुनः प्रयास करें');
      }
    });
  }
  uploadFmAudio(slot: 1 | 2 | 3) {
    const file = slot === 1 ? this.fmAudio1File : slot === 2 ? this.fmAudio2File : this.fmAudio3File;
    if (!file) return;
    if (slot === 1) this.fmUploadingA1 = true;
    else if (slot === 2) this.fmUploadingA2 = true;
    else this.fmUploadingA3 = true;

    this.api.uploadImage([file], 'AartiAudio', 'aarti', 'AartiAudio').subscribe({
      next: (res: any) => {
        const ok = res?.Status === 'Success';
        if (slot === 1) { this.fmUploadingA1 = false; if (ok) { this.familyMandir.AartiName1 = res.FileName; this.fmAudio1File = null; this.showToast('🎵', 'आरती 1 ऑडियो अपलोड हुआ ✅'); } }
        else if (slot === 2) { this.fmUploadingA2 = false; if (ok) { this.familyMandir.AartiName2 = res.FileName; this.fmAudio2File = null; this.showToast('🎵', 'आरती 2 ऑडियो अपलोड हुआ ✅'); } }
        else { this.fmUploadingA3 = false; if (ok) { this.familyMandir.AartiName3 = res.FileName; this.fmAudio3File = null; this.showToast('🎵', 'आरती 3 ऑडियो अपलोड हुआ ✅'); } }
      },
      error: () => {
        if (slot === 1) this.fmUploadingA1 = false;
        else if (slot === 2) this.fmUploadingA2 = false;
        else this.fmUploadingA3 = false;
        this.showToast('❌', 'ऑडियो अपलोड विफल, पुनः प्रयास करें');
      }
    });
  }
  onFmAudioSelected(event: any, slot: 1 | 2 | 3) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (slot === 1) { this.fmAudio1File = file; this.fmAudio1Name = file.name; this.familyMandir.AartiName1 = ''; }
    else if (slot === 2) { this.fmAudio2File = file; this.fmAudio2Name = file.name; this.familyMandir.AartiName2 = ''; }
    else { this.fmAudio3File = file; this.fmAudio3Name = file.name; this.familyMandir.AartiName3 = ''; }
  }
  loadFamilyActiveMandir() {
    const userID = this.userDetails?.UserID;
    if (!userID) return;

    this.apinu.postUrlData(
      `FamilyMembersSelectByQuery?Query=UserID=${userID} AND IsActive=1`, null
    ).subscribe({
      next: (res: any) => {
        const list = res.FamilyMemberList || [];
        if (!list.length) return;

        const familyID = list[0].FamilyID;
        this.apinu.postUrlData(
          `FamilyMandirSelectByQuery?Query=FamilyID=${familyID} AND IsActive=1`, null
        ).subscribe({
          next: (r: any) => {
            const mandirs = r.FamilyMandirList || [];
            if (!mandirs.length) return;

            this.familyActiveMandir = mandirs[0];
            // Load all 3 photos
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto1, 1);
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto2, 2);
            this.loadFamilyMandirPhotoSlot(this.familyActiveMandir.MandirPhoto3, 3);
            this.startFamilyMandirSlideshow();
          }
        });
      }
    });
  }

  private loadFamilyMandirPhotoSlot(filename: string, slot: 1 | 2 | 3) {
    if (!filename) return;
    this.api.getImage('DownloadImages', {
      imageName: filename, imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (!blob?.type?.startsWith('image/')) return;
        const url = URL.createObjectURL(blob);
        if (slot === 1) this.familyMandirPhotoUrl = url;
        else if (slot === 2) this.familyMandirPhoto2Url = url;
        else this.familyMandirPhoto3Url = url;
      }
    });
  }

  private startFamilyMandirSlideshow() {
    clearInterval(this.familyMandirSlideTimer);
    this.familyMandirSlideTimer = setInterval(() => {
      const count = [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
        .filter(p => !!p).length;
      if (count > 1) {
        this.familyMandirSlideIndex = (this.familyMandirSlideIndex + 1) % count;
      }
    }, 4000);
  }

  get currentFamilyMandirPhoto(): string | null {
    const photos = [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
      .filter(p => !!p);
    return photos[this.familyMandirSlideIndex] || null;
  }

  get familyMandirPhotoCount(): number {
    return [this.familyMandirPhotoUrl, this.familyMandirPhoto2Url, this.familyMandirPhoto3Url]
      .filter(p => !!p).length;
  }
  toggleFamilyAarti(filename: string, slot: string) {
    if (!filename) return;

    // Stop if same slot tapped again
    if (this.familyAartiPlayingSlot === slot) {
      this.stopFamilyAarti();
      return;
    }

    this.stopFamilyAarti();
    this.familyAartiLoadingSlot = slot;

    this.api.getAudio('DownloadAudio', {
      audioName: filename,
      audioPurpose: 'AartiAudio'
    }).subscribe({
      next: (blob: any) => {
        this.familyAartiLoadingSlot = null;
        const url = URL.createObjectURL(blob);
        this.familyAartiCurrentAudio = new Audio(url);
        this.familyAartiPlayingSlot = slot;
        this.scrollToMandirHero();
        this.familyAartiCurrentAudio.play().catch(() => {
          
          this.showToast('❌', 'ऑडियो चला नहीं');
          this.familyAartiPlayingSlot = null;
        });
        this.familyAartiCurrentAudio.onended = () => {
          this.familyAartiPlayingSlot = null;
          URL.revokeObjectURL(url);
        };
      },
      error: () => {
        this.familyAartiLoadingSlot = null;
        this.showToast('❌', 'ऑडियो लोड नहीं हुआ');
      }
    });
  }

  stopFamilyAarti() {
    if (this.familyAartiCurrentAudio) {
      this.familyAartiCurrentAudio.pause();
      this.familyAartiCurrentAudio.onended = null;
      this.familyAartiCurrentAudio = null;
    }
    this.familyAartiPlayingSlot = null;
    this.familyAartiLoadingSlot = null;
  }
 
  async scrollToMandirHero() {
    const el = document.getElementById('mandirHero');
    if (!el) return;
  
    const scrollEl = await this.pageContent.getScrollElement();
    const yOffset = el.offsetTop - 20;
  
    this.pageContent.scrollToPoint(0, yOffset, 600);
  }

  ionViewWillEnter() {
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) {
      fab.style.display = 'none';
    }
  }
  
  ionViewWillLeave() {
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) {
      fab.style.display = 'flex';
    }
  }

}