import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
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
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { CommonBottomTabsComponent } from '../common-bottom-tabs/common-bottom-tabs.component';

@Component({
  selector: 'app-jajman-dashboard',
  templateUrl: './jajman-dashboard.component.html',
  styleUrls: ['./jajman-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, CommonBottomTabsComponent,JajmanbottomtabsComponent, TabscommonheaderComponent]
})
export class JajmanDashboardComponent implements OnInit {
  userDetails: any;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  sloganName!: any;
  pendingPanditServiceID: any;
  labels = {
    en: {
      myFamily: 'My Family',
      greeting: 'Namaste 🙏',
      greetingTitle: "Let's Plan Your Next Puja",
      followUs: 'Follow us on social media',
      quickActions: 'Quick Actions',
      logoTitle: 'Mangal.Bhav',
      myBookings: 'My Bookings',
      profile: 'Profile',
      festivals: 'Hindu Calender',
      logoSub: '✦ Peace · Prosperity · Protection ✦',
      explore: 'Explore Life',
      me: 'Me',
      myTransactions: 'My Transactions',
      myMandirs: 'My Mandirs',
    },

    hi: {
      myFamily: 'मेरा परिवार',
      myMandirs: 'मेरे मंदिर',
      myTransactions: 'मेरे लेन-देन',
      greeting: 'नमस्ते 🙏',
      greetingTitle: 'अपनी अगली पूजा की योजना बनाएं',
      logoSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      quickActions: 'त्वरित कार्य',

      myBookings: 'मेरी बुकिंग्स',
      profile: 'प्रोफ़ाइल',
      logoTitle: 'मंगल.भाव:',
      festivals: 'हिंदू पंचांग',
      followUs: 'सोशल मीडिया पर फॉलो करें',
      explore: 'जीवन देखें',
      me: 'मैं'
    }
  };
  language: any;

  constructor(private alertCtrl: AlertController, private storage: Storage, public apinu: ApiNU,
    public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider, public routerCtrl: NavController, private http: HttpClient) { }


  async openWhatsApp() {
    await Browser.open({
      url: 'https://wa.me/918796917944?text=' + encodeURIComponent('Need help')
    });
  }

  async ngOnInit() {

    this.userDetails = await this.storage.get("account");
    this.language = this.userDetails.Languages;
    // console.log(this.userDetails);
    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'BHAKT'
    ) {
      this.routerCtrl.navigateForward('/login');
    }


    if (
      await this.storage.get("languageChange")
    ) {
      await this.storage.remove('languageChange');
      this.routerCtrl.navigateForward('/languagechange');
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

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
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
    this.routerCtrl.navigateForward(`/loggedin-home`);
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
    this.routerCtrl.navigateForward('/login');
  }


  action1() {
    console.log('Call clicked');
  }

  action2() {
    console.log('Chat clicked');
  }

  action3() {
    console.log('Mail clicked');
  }

  action4() {
    console.log('Location clicked');
  }

  followOn(platform: 'facebook' | 'instagram' | 'linkedin') {

    
    const urls: any = {
      facebook:  'https://www.facebook.com/profile.php?id=61575446319952',   // 🔁 your page URL
      instagram: 'https://www.instagram.com/mangal_bhav_official/',  // 🔁 your handle
      linkedin:  'https://www.youtube.com/@mangal_bhav_official' // 🔁 your company page
    };
    Browser.open({ url: urls[platform] });
  }

}
