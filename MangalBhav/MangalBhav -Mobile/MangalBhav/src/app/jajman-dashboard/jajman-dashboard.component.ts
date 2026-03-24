import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValueLookUpComponent } from 'src/components/value-look-up/value-look-up';
import { IndiaDateComponent } from 'src/components/india-date/india-date';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jajman-dashboard',
  templateUrl: './jajman-dashboard.component.html',
  styleUrls: ['./jajman-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class JajmanDashboardComponent implements OnInit {
  userDetails: any;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  sloganName!: any;
  pendingPanditServiceID: any;

  constructor(private alertCtrl: AlertController, private storage: Storage, public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider, public routerCtrl: NavController, private http: HttpClient) { }

  async ngOnInit() {

    this.userDetails = await this.storage.get("account");
    // console.log(this.userDetails);
    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'BHAKT'
    ) {
      this.routerCtrl.navigateRoot('/login');
    }


    this.pendingPanditUserID = await this.storage.get('pendingPanditUserID');
    this.pendingPanditCategoryID = await this.storage.get('pendingPanditCategoryID');


    this.pendingPanditServiceID = await this.storage.get('pendingPanditServiceID');


    if (Number(this.pendingPanditServiceID) > 0) {
      this.router.navigate(['/book-pooja'], {
        queryParams: { id: this.pendingPanditServiceID }
      });
    }



    if (this.pendingPanditCategoryID && this.pendingPanditUserID) {
      // await this.storage.remove('pendingPanditUserID');
      // await this.storage.remove('pendingPanditCategoryID');
      this.router.navigate(['/book-pooja'], {
        queryParams: { id: -1 }
      });
    }


    this.getSlogan();

  }

  @ViewChild(IonContent) content!: IonContent;

  scrollToTop() {
    this.content.scrollToTop(500);
  }
  getSlogan() {
    const randomIndex = Math.floor(Math.random() * 40);
    this.sloganName = this.api.getChalisaLine(randomIndex);
  }

  toggleLanguage() {

  }


  goToLoggedInHomePage() {
    this.routerCtrl.navigateRoot(`/loggedin-home`);
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  openPageBookPooja() {
    this.router.navigate(['/book-pooja'], {
      queryParams: { id: 0 }
    });
  }


  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateRoot('/login');
  }


}
