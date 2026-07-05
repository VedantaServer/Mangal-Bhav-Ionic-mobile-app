import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-common-bottom-tabs',
  templateUrl: './common-bottom-tabs.component.html',
  styleUrls: ['./common-bottom-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CommonBottomTabsComponent implements OnInit {

  currentUrl: string = '';
  @Input() isLoggedIn = false;
  @Input() userDetails: any;

  navWidth = 390;
  currentPath = '';
  private animFrame: any;
  private fromPath = '';
  private readonly TAB_COUNT = 5;
  private readonly BUMP_W = 79;
  private readonly H = 70;
  private readonly DIP_H = 81;
  private loginTriggeredBy: 'pooja' | 'profile' = 'profile';
  adminloggedin: boolean=false;

  constructor(
    private alertCtrl: AlertController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');

    this.adminloggedin = await this.storage.get('adminloggedin') == 'true';
    this.isLoggedIn = !!this.userDetails?.UserID;
    this.currentUrl = this.router.url;

    const saved = await this.storage.get('loginTriggeredBy');
    this.loginTriggeredBy = saved || 'profile';

    setTimeout(() => {
      this.navWidth = window.innerWidth;
      const idx = this.getActiveIndex();
      this.currentPath = this.buildPath(idx);
      this.fromPath = this.currentPath;   // ← both set to current
      this.animateBump(idx);              // ← force animate on load

     // console.log('navWidth', this.navWidth);
     // console.log('currentUrl', this.currentUrl);
     // console.log('activeIndex', this.getActiveIndex());
     // console.log('path', this.currentPath);
    }, 100);                              // ← slight delay ensures navWidth is real

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(async (e: any) => {
      this.currentUrl = e.urlAfterRedirects;
      this.userDetails = await this.storage.get('account');
      this.isLoggedIn = !!this.userDetails?.UserID;

      if (!this.currentUrl.includes('login')) {
        this.loginTriggeredBy = 'profile';
        this.storage.set('loginTriggeredBy', 'profile');
      }

      this.animateBump(this.getActiveIndex());
    });
  }


  async action5() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  isActive(page: string): boolean {
    return this.currentUrl.includes(page);
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
    const steps = 18;
    let step = 0;
    cancelAnimationFrame(this.animFrame);
    const from = this.parseNums(this.fromPath);
    const to = this.parseNums(targetPath);
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const frame = () => {
      step++;
      const t = ease(Math.min(step / steps, 1));
//       console.log('from', from);
// console.log('to', to);
// console.log('from length', from.length);
// console.log('to length', to.length);
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

  openPooja() {
    if (this.isLoggedIn) {
      this.routerCtrl.navigateForward('/loggedin-home');
    } else {
      this.routerCtrl.navigateForward('/login?from=pooja');  // ← query param
    }
  }

  openProfile() {
    if (!this.isLoggedIn) {
      this.storage.set('openLoginSection', 'true');
      this.routerCtrl.navigateForward('/login?from=profile');  // ← query param
      return;
    }
    this.routerCtrl.navigateForward('/jajmandashboard');
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

  private getActiveIndex(): number {
   // console.log('currentUrl:', this.currentUrl); // ← add this temporarily
    if (this.currentUrl.includes('loggedin-home')) return 0;
    if (this.currentUrl.includes('login') && this.currentUrl.includes('from=pooja')) return 0;
    if (this.currentUrl.includes('openfindmandir')) return 1;
    if (this.currentUrl.includes('open-community-page')) return 2;
    // if (this.currentUrl.includes('/')) return 2;
    if (this.currentUrl.includes('open-find-pandit')) return 3;
    return 4;
  }

  openAdminDashboard() {
    this.router.navigateByUrl('/admindashboard');
  }
  
  isAdminDashboardActive(): boolean {
    return this.router.url.startsWith('/admindashboard');
  }

}