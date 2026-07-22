import { CommonModule } from '@angular/common';
import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

export interface BottomNavTab {
  id: string;
  icon: string;
  label?: string;
  round?: boolean;
  matches: (url: string) => boolean;
}

@Component({
  selector: 'app-bottom-nav-bar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './bottom-nav-bar.component.html',
  styleUrls: ['./bottom-nav-bar.component.scss']
})
export class BottomNavBarComponent implements OnInit, OnDestroy {
  @Input() tabs: BottomNavTab[] = [];
  @Output() tabSelected = new EventEmitter<string>();

  @ViewChild('navWrapper', { static: true }) navWrapperRef!: ElementRef<HTMLElement>;

  navWidth = 390;
  currentPath = '';
  currentUrl = '';

  private fromPath = '';
  private animFrame: any;
  private routerSub?: Subscription;
  private resizeObserver?: ResizeObserver;

  private readonly BUMP_W = 79;
  private readonly H = 70;
  private readonly DIP_H = 81;

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.setupResizeObserver();
    this.recalc();

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentUrl = e.urlAfterRedirects;
        this.recalc();
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.animFrame);
  }

  onTabClick(tab: BottomNavTab) {
    this.tabSelected.emit(tab.id);
  }

  isActive(tab: BottomNavTab): boolean {
    return tab.matches(this.currentUrl);
  }

  private getActiveIndex(): number {
    const idx = this.tabs.findIndex(t => t.matches(this.currentUrl));
    return idx === -1 ? this.tabs.length - 1 : idx;
  }

  private buildPath(idx: number): string {
    const W = this.navWidth;
    const tabW = W / this.tabs.length;
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

  private recalc() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const measured = this.navWrapperRef?.nativeElement?.clientWidth;
        this.navWidth = measured && measured > 0 ? measured : window.innerWidth;
        const idx = this.getActiveIndex();
        if (!this.fromPath) {
          this.currentPath = this.buildPath(idx);
          this.fromPath = this.currentPath;
        } else {
          this.animateBump(idx);
        }
      });
    });
  }

  private setupResizeObserver() {
    if (!this.navWrapperRef?.nativeElement || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width;
      if (!width || Math.round(width) === Math.round(this.navWidth)) return;
      this.navWidth = width;
      const idx = this.getActiveIndex();
      this.currentPath = this.buildPath(idx);
      this.fromPath = this.currentPath;
    });
    this.resizeObserver.observe(this.navWrapperRef.nativeElement);
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

    if (from.length !== to.length) {
      this.currentPath = targetPath;
      this.fromPath = targetPath;
      return;
    }

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