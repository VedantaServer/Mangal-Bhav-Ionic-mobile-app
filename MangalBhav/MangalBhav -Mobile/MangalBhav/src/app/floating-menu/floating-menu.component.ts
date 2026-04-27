import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FloatingMenuComponent implements OnInit {
  userDetails: any;
  floatingMenuVisible: boolean = false;


  constructor(public routerCtrl: NavController, private router: Router, private storage: Storage) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async () => {
        await this.checkLogin();
      });

  }

  async checkLogin() {
    await this.storage.create();

    this.userDetails = await this.storage.get("account");

 //   console.log('USER DETAILS:', this.userDetails);

    this.floatingMenuVisible = !!this.userDetails?.LoginID;
  }

  openPage(route: string) {
    this.router.navigate([`/${route}`]);
  }

  async action4() {
    console.log('Location clicked');
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');

    this.routerCtrl.navigateForward(`/find-pandit`);

  }

  async action5(){
    await localStorage.setItem('openfindPanditThroghtFloating', 'openfindPanditThroghtFloating');

    this.routerCtrl.navigateForward(`/open-find-pandit`);
  }



  async ngOnInit() {
    await this.checkLogin();
  }

  fabOpen = false;

  toggleFab() {
    this.fabOpen = !this.fabOpen;
  }

  closeFab() {
    this.fabOpen = false;
  }

  // Wrapper methods — one per menu item
  openChats() { this.openPage('allchats'); this.closeFab(); }
  openMandir() { this.openPage('openfindmandir'); this.closeFab(); }
  openLanguage() { this.openPage('languagechange'); this.closeFab(); }
  openSearch() { this.action4(); this.closeFab(); }
  openFestivals() { this.openPage('india-festival'); this.closeFab(); }
}
