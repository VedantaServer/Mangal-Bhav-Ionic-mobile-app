import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,

})
export class Tab1Page {
  userDetails!: any;
  labels = {
    en: {
      appTitle: '🕉️ Mangal Bhav',
      greetingTitle: 'Namaste 🙏, ',
      greetingSubtitle: 'Ready for today’s seva?',

      kshetra: 'Kshetra',
      addSeva: 'Add Service',
      bookings: 'Yajman Bookings',
      pending: 'Pending Puja',
      cancelled: 'Rejected Pooja',   // ✅ Added
      dakshina: 'Dakshina',
      profile: 'Pandit Profile',

      today: 'Today',
      upcoming: 'Upcoming',
      completed: 'Done',

      currentLocation: 'Current Location',
      available: 'Available'
    },

    hi: {
      appTitle: '🕉️ मंगल भाव',
      greetingTitle: 'नमस्ते 🙏, ',
      greetingSubtitle: 'आज की सेवा के लिए तैयार हैं?',

      kshetra: 'क्षेत्र',
      addSeva: 'सेवा जोड़ें',
      bookings: 'यजमान बुकिंग',
      pending: 'लंबित पूजा',
      cancelled: 'रद्द की गई पूजा',   // ✅ Added
      dakshina: 'दक्षिणा',
      profile: 'पंडित प्रोफाइल',

      today: 'आज',
      upcoming: 'आगामी',
      completed: 'पूर्ण',

      currentLocation: 'वर्तमान स्थान',
      available: 'उपलब्ध'
    }
  };
  language: any;
  FullName: any;
  sloganName:any;
  constructor(private alertCtrl: AlertController, private storage: Storage, public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider,
    private datePipe: DatePipe, public routerCtrl: NavController, private http: HttpClient
  ) { }


  toggleLanguage(){

  }
  async ngOnInit() {
    this.getSlogan();
    this.language = await this.storage.get("Language");
    this.userDetails = await this.storage.get("account");
    this.FullName = this.userDetails.FullName;

    if (this.FullName == null) {
      const alert = await this.alertCtrl.create({
        header: '🙏 Profile Incomplete',
        subHeader: 'Your sacred profile awaits',
        message: 'Please complete your profile before proceeding. You will not be able to create service and get bookings.',
        cssClass: 'sacred-alert',
        buttons: [
          {
            text: 'Complete Profile →',
            cssClass: 'alert-btn-confirm',
            handler: () => {
              this.routerCtrl.navigateForward('/user-profile');
            }
          }
        ]
      });

      await alert.present();
      return;
    }
    console.log(this.userDetails);
    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'PANDIT'
    ) {
      this.routerCtrl.navigateRoot('/login');
    }
  }

   getSlogan() {
    const randomIndex = Math.floor(Math.random() * 40);
    this.sloganName = this.api.getChalisaLine(randomIndex);
    //alert(this.sloganName)
  }


  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  openPageee(pageName: any) {
    this.router.navigate([`/${pageName}`], {
      queryParams: { id: 0 }
    });
  }

  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateRoot('/login');
  }


}
