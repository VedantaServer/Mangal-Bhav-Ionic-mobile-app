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

interface SevaItem {
  icon: string; name: string; sound: string; count: number; toast: string;
}
interface PanchangData {
  label: string; value: string; sub: string; auspicious?: boolean; avoid?: boolean;
}
interface Event {
  day: string; month: string; title: string; time: string; location: string; free: boolean;
}
interface Prayer {
  initials: string; name: string; time: string; city: string;
  text: string; blessingsCount: number; userBlessed: boolean;
}

@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    JajmanbottomtabsComponent, TabscommonheaderComponent,
    LoggedoutbottomtabsComponent, PanditjibottomtabsComponent
  ]
})
export class OpenCommunityPageComponent implements OnInit, AfterViewInit, OnDestroy {

  userDetails: any;
  userLoggedIn: boolean = false;

  darshanaCount = 2847;
  private darshanaInterval: any;

  toastVisible = false;
  toastIcon = '🙏';
  toastMessage = '';
  private toastTimer: any;

  isGlowing = false;
  aartiActive = false;
  bellRinging = false;
  mantraPlaying = false;
  shankhPlaying = false;
  private bellAudio: HTMLAudioElement | null = null;
  private mantraAudio: HTMLAudioElement | null = null;
  private shankhAudio: HTMLAudioElement | null = null;
  private chalisaAudio: HTMLAudioElement | null = null;

  // ── Canvas ───────────────────────────────────────────────
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: any[] = [];
  private animationId: number = 0;
  private flowersAutoStopTimer: any;

  private mantraIndex = 0;
  readonly mantras = [
    { sanskrit: 'ॐ हनुमते नमः',            meaning: 'I bow to Lord Hanuman' },
    { sanskrit: 'जय श्री राम',              meaning: 'Victory to Lord Ram' },
    { sanskrit: 'ॐ नमो हनुमते रुद्रावताराय', meaning: 'Salutations to Hanuman, avatar of Rudra' },
    { sanskrit: 'राम राम राम',              meaning: 'Chant of Lord Ram' },
  ];
  currentMantra = this.mantras[0];
  private mantraTimer: any;

  sevaItems: SevaItem[] = [
    { icon: '🧡', name: 'सिंदूर',  sound: 'sindoor', count: 1243, toast: 'सिंदूर चढ़ाया गया 🧡' },
    { icon: '🍬', name: 'प्रसाद',  sound: 'prasad',  count: 988,  toast: 'प्रसाद अर्पित हुआ 🍬' },
    { icon: '🥥', name: 'नारियल', sound: 'narial',  count: 756,  toast: 'नारियल फोड़ा गया 🥥' },
    { icon: '🪷', name: 'कमल',    sound: 'kamal',   count: 2101, toast: 'कमल पुष्प चढ़ाया 🪷' },
  ];

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

  upcomingEvents: Event[] = [
    { day: '27', month: 'MAY', title: 'Mangalwar Sundarkand Path', time: '6:00 AM', location: 'Online', free: true },
    { day: '31', month: 'MAY', title: 'Havan & Prasad Distribution', time: '7:00 AM', location: 'Delhi NCR', free: false },
    { day: '04', month: 'JUN', title: 'Hanuman Jayanti Celebration', time: '5:00 AM', location: 'All Temples', free: true },
  ];

  prayerWall: Prayer[] = [
    { initials: 'R', name: 'Rajesh Sharma', time: '2 hrs ago', city: 'Delhi',
      text: 'बजरंगबली की कृपा से मेरे पुत्र की परीक्षा में सफलता मिली। जय हनुमान 🙏',
      blessingsCount: 128, userBlessed: false },
    { initials: 'S', name: 'Sunita Devi', time: '5 hrs ago', city: 'Varanasi',
      text: 'Please pray for my family\'s health and happiness. Jai Bajrangbali! 🔥',
      blessingsCount: 74, userBlessed: false },
    { initials: 'A', name: 'Amit Tiwari', time: '8 hrs ago', city: 'Lucknow',
      text: 'मेरी माँ की बीमारी के लिए प्रार्थना करें। हनुमान जी जरूर सुनेंगे 🌺',
      blessingsCount: 201, userBlessed: false },
  ];

  allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showAddMandirForm = false;
  isSubmittingMandir = false;
  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;

  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    if (this.userDetails?.LoginID) this.userLoggedIn = true;
    this.startDarshanaCounter();
    this.startMantraRotation();
    this.buildPanchang();
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnDestroy() {
    clearInterval(this.darshanaInterval);
    clearInterval(this.mantraTimer);
    clearInterval(this.chalisaProgressInterval);
    clearTimeout(this.flowersAutoStopTimer);
    clearTimeout(this.toastTimer);
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.stopAllAudio();
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

  // ── Central audio helper ─────────────────────────────────
  private playAudio(
    currentRef: HTMLAudioElement | null,
    src: string,
    onEnded?: () => void
  ): HTMLAudioElement {
    if (currentRef) {
      currentRef.pause();
      currentRef.currentTime = 0;
      currentRef.onended = null;
    }
    const audio = new Audio(src);
    if (onEnded) audio.onended = onEnded;
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
    return audio;
  }

  // ── Mantra toggle ────────────────────────────────────────
  playMantra() {
    if (this.mantraPlaying) {
      this.mantraAudio?.pause();
      if (this.mantraAudio) { this.mantraAudio.currentTime = 0; this.mantraAudio.onended = null; }
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

  // ── Canvas init ──────────────────────────────────────────
  // KEY FIX: do NOT set CSS width/height on the canvas element.
  // Instead, read the container's pixel size and set the canvas
  // PIXEL buffer to match. CSS size stays at 100%/100% via SCSS.
  initCanvas() {
    this.canvas = document.getElementById('flowerCanvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    const container = document.querySelector('.hanuman-container') as HTMLElement;
    if (!container) return;
    // Set pixel buffer = actual rendered size of the container
    const rect = container.getBoundingClientRect();
    this.canvas.width  = Math.round(rect.width);
    this.canvas.height = Math.round(rect.height);
    this.ctx = this.canvas.getContext('2d');
    // Clear any leftover pixels from a previous init
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ── Flowers ──────────────────────────────────────────────
  private startFlowers(type: 'flowers' | 'petals' = 'flowers') {
    // Always re-measure before spawning — image may have loaded since last init
    this.initCanvas();
    if (!this.canvas || !this.ctx) return;

    const emojis = type === 'flowers'
      ? ['🌸', '🌺', '🌼', '🌻', '🪷', '🌹']
      : ['🌸', '🪷', '🌸', '🌺'];

    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = 0; }

    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x:        Math.random() * this.canvas.width,
        y:        -20 - Math.random() * 120,
        size:     16 + Math.random() * 12,
        speed:    1.8 + Math.random() * 2.2,
        drift:    (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        emoji:    emojis[Math.floor(Math.random() * emojis.length)],
        opacity:  1,
      });
    }
    this.animateCanvas();
  }

  private animateCanvas() {
    if (!this.ctx || !this.canvas) return;
    // clearRect before drawing — prevents yellow tint accumulation
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(p => p.y < this.canvas!.height + 30 && p.opacity > 0.05);

    for (const p of this.particles) {
      p.y        += p.speed;
      p.x        += p.drift;
      p.rotation += p.rotSpeed;
      if (p.y > this.canvas.height * 0.65) p.opacity -= 0.012;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.font = `${p.size}px serif`;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillText(p.emoji, 0, 0);
      this.ctx.restore();
    }
    // Reset globalAlpha so nothing bleeds into next frame
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

  // ── Shankh toggle ────────────────────────────────────────
  playShankh() {
    if (this.shankhPlaying) {
      this.shankhAudio?.pause();
      if (this.shankhAudio) this.shankhAudio.onended = null;
      this.shankhAudio = null;
      this.shankhPlaying = false;
      this.stopFlowers();
      this.showToast('🔇', 'शंख रोका गया');
    } else {
      this.shankhPlaying = true;
      this.shankhAudio = this.playAudio(this.shankhAudio, 'assets/audio/shankh.mp3', () => {
        this.shankhPlaying = false;
        this.shankhAudio = null;
        this.stopFlowers();
      });
      this.startFlowers('flowers');
      this.showToast('🙏', 'जय बजरंगबली! शंख बज रहा है...');
    }
  }

  // ── Aarti toggle ─────────────────────────────────────────
  performAarti() {
    if (this.aartiActive) {
      // STOP
      this.aartiActive = false;
      this.isGlowing   = false;
      if (this.shankhAudio) { this.shankhAudio.pause(); this.shankhAudio.onended = null; this.shankhAudio = null; }
      this.shankhPlaying = false;
      this.stopFlowers();
      this.showToast('🪔', 'आरती रोकी गई');
    } else {
      // START — reset stale state first
      if (this.shankhAudio) { this.shankhAudio.pause(); this.shankhAudio.onended = null; this.shankhAudio = null; }
      this.shankhPlaying = false;
      this.aartiActive   = true;
      this.isGlowing     = true;
      this.shankhPlaying = true;
      this.shankhAudio   = this.playAudio(null, 'assets/audio/shankh.mp3', () => {
        this.shankhPlaying = false;
        this.shankhAudio   = null;
        this.aartiActive   = false;
        this.isGlowing     = false;
        this.stopFlowers();
      });
      this.startFlowers('flowers');
      this.showToast('🪔', 'जय बजरंगबली! आरती संपन्न हुई 🙏');
    }
  }

  // ── Bell ─────────────────────────────────────────────────
  ringBell() {
    if (this.bellRinging) return;
    this.bellRinging = true;
    this.bellAudio = this.playAudio(this.bellAudio, 'assets/audio/bell.mp3', () => {
      this.bellRinging = false;
      this.bellAudio = null;
    });
    setTimeout(() => { this.bellRinging = false; }, 2000);
    this.showToast('🔔', 'जय हनुमान! घंटी बजाई 🔔');
  }

  // ── Flowers offer ────────────────────────────────────────
  offerFlowers() {
    this.startFlowers('petals');
    clearTimeout(this.flowersAutoStopTimer);
    this.flowersAutoStopTimer = setTimeout(() => this.stopFlowers(), 4000);
    this.showToast('🌺', 'पुष्पांजलि स्वीकार हुई 🌸');
  }

  // ── Virtual Seva ─────────────────────────────────────────
  offerSeva(seva: SevaItem) {
    seva.count++;
    this.showToast(seva.icon, seva.toast);
    this.startFlowers('petals');
    clearTimeout(this.flowersAutoStopTimer);
    this.flowersAutoStopTimer = setTimeout(() => this.stopFlowers(), 4000);
  }

  // ── Chalisa ──────────────────────────────────────────────
  toggleChalisa() {
    this.chalisaPlaying ? this.pauseChalisa() : this.playChalisa();
  }

  private playChalisa() {
    this.chalisaPlaying = true;
    if (!this.chalisaAudio) this.chalisaAudio = new Audio('assets/audio/hanuman_chalisa.mp3');
    const p = this.chalisaAudio.play();
    if (p !== undefined) p.catch(() => {});
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

  // ── Panchang ─────────────────────────────────────────────
  private buildPanchang() {
    const now = new Date();
    this.todayDate = now.toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.panchangData = [
      { label: 'Tithi',         value: 'एकादशी',       sub: '✨ Shubh',        auspicious: true  },
      { label: 'Nakshatra',     value: 'पुनर्वसु',     sub: 'Punarvasu',       auspicious: true  },
      { label: 'Shubh Muhurat', value: '6:15 AM',      sub: 'Brahma Muhurta',  auspicious: true  },
      { label: 'Rahu Kaal',     value: '3:00–4:30 PM', sub: '⚠ Avoid',         avoid: true       },
      { label: 'Yoga',          value: 'सौभाग्य',      sub: 'Saubhagya',       auspicious: true  },
      { label: 'Sunrise',       value: '5:29 AM',      sub: 'Sunset 7:11 PM',  auspicious: false },
    ];
  }

  rsvpEvent(event: Event) { this.showToast('🗓️', `"${event.title}" के लिए RSVP हो गया!`); }

  blessings(prayer: Prayer) {
    if (prayer.userBlessed) { prayer.blessingsCount--; prayer.userBlessed = false; }
    else { prayer.blessingsCount++; prayer.userBlessed = true; this.showToast('🙏', 'आशीर्वाद भेजा गया!'); }
  }

  openPrayerModal() { this.showToast('✍️', 'प्रार्थना लिखें...'); }
  replyPrayer(prayer: Prayer) { this.showToast('💬', `${prayer.name} को उत्तर दें`); }

  showToast(icon: string, message: string) {
    this.toastIcon = icon;
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  private stopAllAudio() {
    [this.shankhAudio, this.bellAudio, this.chalisaAudio, this.mantraAudio]
      .forEach(a => { if (a) { a.pause(); a.onended = null; } });
    this.shankhAudio = null; this.bellAudio = null;
    this.chalisaAudio = null; this.mantraAudio = null;
    this.mantraPlaying = false; this.shankhPlaying = false;
    this.bellRinging = false; this.aartiActive = false; this.isGlowing = false;
  }
}