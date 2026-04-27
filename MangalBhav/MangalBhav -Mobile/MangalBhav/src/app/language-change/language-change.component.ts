import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-language-change',
  templateUrl: './language-change.component.html',
  styleUrls: ['./language-change.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PanditjibottomtabsComponent]
})
export class LanguageChangeComponent implements OnInit {

  selectedLanguage: string = 'English';
  saveSuccess: boolean = false;

  languages = [
    {
      code: 'English',
      label: 'English',
      native: 'English',
      script: 'A',
      region: 'Universal',
      active: true
    },
    {
      code: 'Hindi',
      label: 'Hindi',
      native: 'हिन्दी',
      script: 'अ',
      region: 'India',
      active: true
    },
    {
      code: 'Sanskrit',
      label: 'Sanskrit',
      native: 'संस्कृतम्',
      script: 'ॐ',
      region: 'Vedic',
      active: false
    },
    {
      code: 'Tamil',
      label: 'Tamil',
      native: 'தமிழ்',
      script: 'த',
      region: 'South India',
      active: false
    },
    {
      code: 'Bengali',
      label: 'Bengali',
      native: 'বাংলা',
      script: 'ব',
      region: 'East India',
      active: false
    },
    {
      code: 'Telugu',
      label: 'Telugu',
      native: 'తెలుగు',
      script: 'త',
      region: 'South India',
      active: false
    },
    {
      code: 'Marathi',
      label: 'Marathi',
      native: 'मराठी',
      script: 'म',
      region: 'Maharashtra',
      active: false
    },
    {
      code: 'Gujarati',
      label: 'Gujarati',
      native: 'ગુજરાતી',
      script: 'ગ',
      region: 'Gujarat',
      active: false
    }
  ];
  userDetails: any;

  constructor(
    private storage: Storage,
    public routerCtrl: NavController
  ) { }

  async ngOnInit() {

 

    const account = await this.storage.get('account');
    if (account?.Languages) {
      this.selectedLanguage = account.Languages;
    }

    this.userDetails = await this.storage.get("account");
  }


  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  async selectLanguage(lang: any) {

    await this.storage.set('languageChange', 'yes');
    // ❌ block inactive
    if (!lang.active) return;

    // ✅ set selected
    this.selectedLanguage = lang.code;

    // ✅ save immediately
    const account = await this.storage.get('account');

    if (account) {
      account.Languages = this.selectedLanguage;
      await this.storage.set('account', account);
    }

    // ✅ UI feedback (tick already visible, this is optional)
    this.saveSuccess = true;

    // ✅ reload app
    setTimeout(() => {
      this.saveSuccess = false;
      window.location.reload();
    }, 600); // faster response
  }

  async saveLanguage() {
    const account = await this.storage.get('account');
    if (account) {
      account.Languages = this.selectedLanguage;
      await this.storage.set('account', account);
    }

    this.saveSuccess = true;

    setTimeout(() => {
      this.saveSuccess = false;
      window.location.reload(); // 🔥 reload full app
    }, 1200);
  }
}