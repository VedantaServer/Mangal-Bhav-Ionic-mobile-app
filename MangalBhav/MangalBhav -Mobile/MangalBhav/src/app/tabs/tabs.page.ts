import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavTab } from '../bottom-nav-bar/bottom-nav-bar.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  userDetails: any;

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

  get tabs(): BottomNavTab[] {
    return [
      { id: 'pooja', icon: '/assets/pooja.png', label: 'Pooja', matches: (url) => url.includes('tab3') || url.includes('loggedin-home') },
      { id: 'temple', icon: '/assets/temple.png', label: 'Temple', matches: (url) => url.includes('openfindmandir') },
      { id: 'community', icon: '/assets/swastik.png', round: true, matches: (url) => url.includes('open-community-page') },
      { id: 'pandit', icon: '/assets/pandit.png', label: 'Pandit Ji', matches: (url) => url.includes('find-pandit') || url.includes('open-find-pandit') },
      { id: 'profile', icon: '/assets/user.png', label: this.userDetails?.FullName?.split(' ')?.[0] || 'Me',
        matches: (url) => url.includes('tab1') },
    ];
  }

  onTabSelected(id: string) {
    switch (id) {
      case 'pooja': this.openTab('tab3'); break;
      case 'temple': this.openTab('openfindmandir'); break;
      case 'community': this.openPage('open-community-page'); break;
      case 'pandit': this.action4(); break;
      case 'profile': this.openTab('tab1'); break;
    }
  }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
  }

  openPage(pageName: string) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  openTab(tab: string) {
    this.router.navigate(['/tabs', tab]);
  }

  async action4() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }
}