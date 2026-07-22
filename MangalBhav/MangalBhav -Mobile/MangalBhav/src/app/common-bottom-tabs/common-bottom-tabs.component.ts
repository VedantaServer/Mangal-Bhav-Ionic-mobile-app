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
import { CommunityService } from '../services/community';
import { BottomNavBarComponent, BottomNavTab } from '../bottom-nav-bar/bottom-nav-bar.component';

@Component({
  selector: 'app-common-bottom-tabs',
  templateUrl: './common-bottom-tabs.component.html',
  styleUrls: ['./common-bottom-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavBarComponent]
})
export class CommonBottomTabsComponent implements OnInit {

  currentUrl: string = '';
  @Input() isLoggedIn = false;
  @Input() userDetails: any;
  adminloggedin: boolean = false;
  private loginTriggeredBy: 'pooja' | 'profile' = 'profile';

  constructor(
    private alertCtrl: AlertController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private communityService: CommunityService,
    private http: HttpClient
  ) { }

  get tabs(): BottomNavTab[] {
    return [
      { id: 'pooja', icon: '/assets/pooja.png', label: 'Pooja', matches: () => this.isPoojaActive() },
      { id: 'temple', icon: '/assets/temple.png', label: 'Temple', matches: (url) => url.includes('openfindmandir') },
      { id: 'community', icon: '/assets/swastik.png', round: true, matches: (url) => url.includes('open-community-page') },
      { id: 'pandit', icon: '/assets/pandit.png', label: 'Pandit ji', matches: (url) => url.includes('open-find-pandit') },
      this.adminloggedin
        ? { id: 'profile', icon: '/assets/user.png', label: 'Admin', matches: () => this.isAdminDashboardActive() }
        : { id: 'profile', icon: '/assets/user.png',
            label: this.isLoggedIn ? (this.userDetails?.FullName?.split(' ')[0] || 'Me') : 'Signup',
            matches: () => this.isProfileActive() },
    ];
  }

  onTabSelected(id: string) {
    switch (id) {
      case 'pooja': this.openPooja(); break;
      case 'temple': this.openPage('openfindmandir'); break;
      case 'community': this.communityAction(); break;
      case 'pandit': this.action5(); break;
      case 'profile': this.adminloggedin ? this.openAdminDashboard() : this.openProfile(); break;
    }
  }

  communityAction() {
    if (this.isActive('open-community-page')) {
      this.communityService.openFeedForm$.next();
    } else {
      this.openPage('open-community-page');
    }
  }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.adminloggedin = await this.storage.get('adminloggedin') == 'true';
    this.isLoggedIn = !!this.userDetails?.UserID;
    this.currentUrl = this.router.url;

    const saved = await this.storage.get('loginTriggeredBy');
    this.loginTriggeredBy = saved || 'profile';

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

  openPooja() {
    if (this.isLoggedIn || this.adminloggedin) {
      this.routerCtrl.navigateForward('/loggedin-home');
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

  openAdminDashboard() {
    this.router.navigateByUrl('/admindashboard');
  }

  isAdminDashboardActive(): boolean {
    return this.router.url.startsWith('/admindashboard');
  }
}