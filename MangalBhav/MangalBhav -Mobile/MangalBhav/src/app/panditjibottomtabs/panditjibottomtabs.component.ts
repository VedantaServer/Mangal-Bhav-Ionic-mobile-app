import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommunityService } from '../services/community';
import { OnDestroy, ElementRef, ViewChild } from '@angular/core';
@Component({
  selector: 'app-panditjibottomtabs',
  templateUrl: './panditjibottomtabs.component.html',
  styleUrls: ['./panditjibottomtabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditjibottomtabsComponent implements OnInit {
  userDetails: any;
  profilePhotoUrl: string = 'assets/user.png';
  isLoggedIn = false;
  adminloggedin: boolean = false;
  @ViewChild('navWrapper', { static: true }) navWrapperRef!: ElementRef<HTMLElement>;
  navWidth = 390;
  currentUrl = '';
  currentPath = '';
  private fromPath = '';
  private animFrame: any;
  private loginTriggeredBy: 'pooja' | 'profile' = 'profile';

  private readonly TAB_COUNT = 5;
  private readonly BUMP_W = 79;
  private readonly H = 70;
  private readonly DIP_H = 81;
  private routerSub?: Subscription;
  private resizeObserver?: ResizeObserver;
  constructor(
    private alertCtrl: AlertController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private communityService: CommunityService
  ) {}

  communityAction() {
    if (this.isActive('open-community-page')) {
      this.communityService.openFeedForm$.next();
    } else {
      this.openPage('open-community-page');
    }
  }

  // async ngOnInit() {
  //   await this.storage.create();
  //   this.userDetails = await this.storage.get('account');
  //   this.adminloggedin = await this.storage.get('adminloggedin') == 'true';
  //   this.isLoggedIn = !!this.userDetails?.UserID;
  //   this.currentUrl = this.router.url;

  //   const saved = await this.storage.get('loginTriggeredBy');
  //   this.loginTriggeredBy = saved || 'profile';

  //   setTimeout(() => {
  //     this.navWidth = window.innerWidth;
  //     const idx = this.getActiveIndex();
  //     this.currentPath = this.buildPath(idx);
  //     this.fromPath = this.currentPath;
  //     this.animateBump(idx);
  //   }, 100);

  //   this.router.events.pipe(
  //     filter(e => e instanceof NavigationEnd)
  //   ).subscribe(async (e: any) => {
  //     this.currentUrl = e.urlAfterRedirects;
  //     this.userDetails = await this.storage.get('account');
  //     this.isLoggedIn = !!this.userDetails?.UserID;
  //     this.navWidth = window.innerWidth;

  //     if (!this.currentUrl.includes('login')) {
  //       this.loginTriggeredBy = 'profile';
  //       this.storage.set('loginTriggeredBy', 'profile');
  //     }

  //     this.animateBump(this.getActiveIndex());
  //   });

  //   if (!this.userDetails?.UserID) return;

  //   this.apinu.postUrlData(
  //     `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
  //     null
  //   ).subscribe((res: any) => {
  //     if (res.ProfileList && res.ProfileList.length > 0) {
  //       const rawUrl = res.ProfileList[0].ProfilePhotoUrl;
  //       if (rawUrl) {
  //         // this.loadProfileImage(rawUrl);
  //       }
  //     }
  //   });
  // }

  loadProfileImage(imageName: string) {
    this.api.getImage('DownloadImages', {
      imageName: imageName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          this.profilePhotoUrl = URL.createObjectURL(blob);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.profilePhotoUrl = 'assets/user.png';
      }
    });
  }

  openPage(pageName: string) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  isActive(page: string): boolean {
    return this.currentUrl?.includes(page) ?? false;
  }

  async action4() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }

  openPooja() {
    if (this.isLoggedIn || this.adminloggedin) {
      this.routerCtrl.navigateForward('/tabs/tab3');
    } else {
      this.routerCtrl.navigateForward('/login?from=pooja');
    }
  }

  openProfile() {
    if (!this.isLoggedIn) {
      this.storage.set('openLoginSection', 'true');
      this.routerCtrl.navigateForward('/login?from=profile');
      return;
    }
    this.routerCtrl.navigateForward('/tabs/tab1');
  }

  isPoojaActive(): boolean {
    if (this.currentUrl.includes('loggedin-home')) return true;
    if (this.currentUrl.includes('login') && this.currentUrl.includes('from=pooja')) return true;
    return false;
  }

  isProfileActive(): boolean {
    if (this.currentUrl.includes('jajmandashboard')) return true;
    if (this.currentUrl.includes('login') && this.currentUrl.includes('from=profile')) return true;
    return false;
  }

  openAdminDashboard() {
    this.router.navigateByUrl('/admindashboard');
  }

  isAdminDashboardActive(): boolean {
    return this.router.url.startsWith('/admindashboard');
  }

  private getActiveIndex(): number {
    const url = this.currentUrl || '';
    if (url.includes('loggedin-home')) return 0;
    if (url.includes('login') && url.includes('from=pooja')) return 0;
    if (url.includes('openfindmandir')) return 1;
    if (url.includes('open-community-page')) return 2;
    if (url.includes('find-pandit') || url.includes('open-find-pandit')) return 3;
    return 4;
  }

  private buildPath(idx: number): string {
    const W = this.navWidth;
    const tabW = W / this.TAB_COUNT;
    const cx = tabW * idx + tabW / 2;
    const L = cx - this.BUMP_W / 2;
    const R = cx + this.BUMP_W / 2;
    const pad = 18;
    return [
      `M0,0`,
      `L${L - pad},0`,
      `Q${L},0 ${L + pad / 2},${this.DIP_H * 0.45}`,
      `Q${cx},${this.DIP_H} ${R - pad / 2},${this.DIP_H * 0.45}`,
      `Q${R},0 ${R + pad},0`,
      `L${W},0 L${W},${this.H} L0,${this.H} Z`
    ].join(' ');
  }

  private parseNums(path: string): number[] {
    return (path.match(/-?[\d.]+/g) || []).map(Number);
  }

  private animateBump(targetIdx: number) {
    const targetPath = this.buildPath(targetIdx);

    if (!this.fromPath) {
      this.currentPath = targetPath;
      this.fromPath = targetPath;
      return;
    }

    const steps = 18;
    let step = 0;
    cancelAnimationFrame(this.animFrame);
    const from = this.parseNums(this.fromPath);
    const to = this.parseNums(targetPath);
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const frame = () => {
      step++;
      const t = ease(Math.min(step / steps, 1));
      const nums = from.map((f, i) => f + (to[i] - f) * t);
      let ni = 0;
      this.currentPath = targetPath.replace(/-?[\d.]+/g, () => +nums[ni++].toFixed(2) as any);
      if (step < steps) {
        this.animFrame = requestAnimationFrame(frame);
      } else {
        this.fromPath = targetPath;
      }
    };
    requestAnimationFrame(frame);
  }


  async ngOnInit() {
    await this.storage.create();
    this.userDetails = await this.storage.get('account');
    this.adminloggedin = await this.storage.get('adminloggedin') == 'true';
    this.isLoggedIn = !!this.userDetails?.UserID;
    this.currentUrl = this.router.url;

    const saved = await this.storage.get('loginTriggeredBy');
    this.loginTriggeredBy = saved || 'profile';

    this.recalcBumpWhenReady();
    this.setupResizeObserver();

    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(async (e: any) => {
      this.currentUrl = e.urlAfterRedirects;
      this.userDetails = await this.storage.get('account');
      this.isLoggedIn = !!this.userDetails?.UserID;

      if (!this.currentUrl.includes('login')) {
        this.loginTriggeredBy = 'profile';
        this.storage.set('loginTriggeredBy', 'profile');
      }

      this.recalcBumpWhenReady();
    });

    if (!this.userDetails?.UserID) return;

    this.apinu.postUrlData(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.ProfileList && res.ProfileList.length > 0) {
        const rawUrl = res.ProfileList[0].ProfilePhotoUrl;
        if (rawUrl) {
          // this.loadProfileImage(rawUrl);
        }
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.animFrame);
  }

  /** Watches the nav bar's OWN rendered width directly, so any page-specific
   * layout timing quirk (async content loading, scrollbar appearing/disappearing,
   * fonts loading late, non-tab top-level routes rendering differently) self-corrects
   * immediately instead of requiring a click to "wake up" the calculation. */
  private setupResizeObserver() {
    if (!this.navWrapperRef?.nativeElement || typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width;
      if (!width || Math.round(width) === Math.round(this.navWidth)) return;

      this.navWidth = width;
      const idx = this.getActiveIndex();
      // Snap (no animation) — a resize-driven correction shouldn't visibly "slide"
      this.currentPath = this.buildPath(idx);
      this.fromPath = this.currentPath;
      this.cdr.detectChanges();
    });

    this.resizeObserver.observe(this.navWrapperRef.nativeElement);
  }

  private recalcBumpWhenReady() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.navWidth = window.innerWidth;
        const idx = this.getActiveIndex();
        if (!this.fromPath) {
          this.currentPath = this.buildPath(idx);
          this.fromPath = this.currentPath;
        } else {
          this.animateBump(idx);
        }
        this.cdr.detectChanges();
      });
    });
  }


}