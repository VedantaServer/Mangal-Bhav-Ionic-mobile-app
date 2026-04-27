import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-open-language-change',
  templateUrl: './open-language-change.component.html',
  styleUrls: ['./open-language-change.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OpenLanguageChangeComponent implements OnInit {

  selectedLanguage: string = 'English';
  saveSuccess: boolean = false;

  languages = [
    { code: 'English', label: 'English', native: 'English', script: 'A', region: 'Universal', active: true },
    { code: 'Hindi', label: 'Hindi', native: 'हिन्दी', script: 'अ', region: 'India', active: true },
    { code: 'Sanskrit', label: 'Sanskrit', native: 'संस्कृतम्', script: 'ॐ', region: 'Vedic', active: false },
    { code: 'Tamil', label: 'Tamil', native: 'தமிழ்', script: 'த', region: 'South India', active: false },
    { code: 'Bengali', label: 'Bengali', native: 'বাংলা', script: 'ব', region: 'East India', active: false },
    { code: 'Telugu', label: 'Telugu', native: 'తెలుగు', script: 'త', region: 'South India', active: false },
    { code: 'Marathi', label: 'Marathi', native: 'मराठी', script: 'म', region: 'Maharashtra', active: false },
    { code: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી', script: 'ગ', region: 'Gujarat', active: false },
  ];

  userDetails: any;

  constructor(
    private storage: Storage,
    public routerCtrl: NavController,private router: Router,
  ) { }

  // ✅ FIX 1: Initialize storage and load saved language
  async ngOnInit() {
    await this.storage.create();
    const saved = await this.storage.get('language');
    if (saved) {
      this.selectedLanguage = saved;
    }
  }

  goBack(){
     this.router.navigateByUrl('/login', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  // ✅ FIX 2: selectLanguage – called from the HTML card click
  selectLanguage(lang: { code: string; active: boolean }) {
    if (!lang.active) return; // ignore disabled/coming-soon languages
    this.selectedLanguage = lang.code;
    this.saveSuccess = false;  // reset tick if user switches after saving
    this.saveLanguage();       // auto-save on selection (remove if you want explicit save)
  }

  // ✅ FIX 3: saveLanguage – persists the choice to storage
  async saveLanguage() {
    await this.storage.set('language', this.selectedLanguage);
    this.saveSuccess = true;
    console.log('Language saved:', this.selectedLanguage);

    // Reset the "Saved!" indicator after 2 seconds
    setTimeout(() => (this.saveSuccess = false), 2000);
  }

  // ✅ FIX 4: toggleLanguage uses correct property name
  toggleLanguage() {
    this.selectedLanguage = this.selectedLanguage === 'English' ? 'Hindi' : 'English';
    this.storage.set('language', this.selectedLanguage);
    console.log('Current Language:', this.selectedLanguage);
  }
}