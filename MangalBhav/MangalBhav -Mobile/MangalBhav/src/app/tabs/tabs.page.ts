import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  userDetails: any;

  navWidth = 390;
  currentUrl = '';
  currentPath = '';
  private fromPath = '';
  private animFrame: any;

  private readonly TAB_COUNT = 5;
  private readonly BUMP_W = 79;
  private readonly H = 70;
  private readonly DIP_H = 81;

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
  ) {}

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.currentUrl = this.router.url;

    setTimeout(() => {
      this.navWidth = window.innerWidth;
      const idx = this.getActiveIndex();
      this.currentPath = this.buildPath(idx);
      this.fromPath = this.currentPath;
      this.animateBump(idx);
    }, 100);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(async (e: any) => {
      this.currentUrl = e.urlAfterRedirects;
      this.userDetails = await this.storage.get('account');
      this.navWidth = window.innerWidth;
      this.animateBump(this.getActiveIndex());
    });
  }

  openPage(pageName: string) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  openTab(tab: string) {
    this.router.navigate(['/tabs', tab]);
  }

  isActive(page: string): boolean {
    return this.currentUrl?.includes(page) ?? false;
  }

  async action4() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }

  private getActiveIndex(): number {
    const url = this.currentUrl || '';
    if (url.includes('tab3') || url.includes('loggedin-home')) return 0;
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
}