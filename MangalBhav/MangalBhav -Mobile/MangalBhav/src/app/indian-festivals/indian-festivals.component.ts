import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-indian-festivals',
  templateUrl: './indian-festivals.component.html',
  styleUrls: ['./indian-festivals.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class IndianFestivalsComponent implements OnInit {

  @ViewChild(IonContent) content!: IonContent;
  isLoading: boolean = true;
  festivalList: any[] = [];
  filteredFestivals: any[] = [];
  selectedMonth: number | null = null;
  availableMonths: { label: string, value: number }[] = [];
  upcomingFestival: any = null;
  language: string = 'English';

  labels = {
    en: {
     title: 'Dainik Panchang',
      sub: '✦ Mangal.Bhav ✦',
      all: 'All',
      next: 'Next',
      festivals: 'Festival',
      festivalsPlural: 'Festivals',
      loading: 'Loading festivals...',
      day: 'Day',
      year: 'Year',
      type: 'Type',
      location: 'Location',
      states: 'States',
    },
    hi: {
      title: 'दैनिक पंचांग',
      sub: '✦ मंगल.भाव ✦',
      all: 'सभी',
      next: 'अगला',
      festivals: 'त्यौहार',
      festivalsPlural: 'त्यौहार',
      loading: 'त्यौहार लोड हो रहे हैं...',
      day: 'दिन',
      year: 'वर्ष',
      type: 'प्रकार',
      location: 'स्थान',
      states: 'राज्य',
    }
  };

  get t() {
    return this.language === 'Hindi' ? this.labels.hi : this.labels.en;
  }

  // Returns name based on language
  getFestivalName(festival: any): string {
    return this.language === 'Hindi' && festival.FestivalNameHindi?.trim()
      ? festival.FestivalNameHindi.trim()
      : festival.FestivalName;
  }

  getFestivalDay(festival: any): string {
    return this.language === 'Hindi' && festival.FestivalDayHindi?.trim()
      ? festival.FestivalDayHindi.trim()
      : festival.FestivalDay?.trim();
  }

  getFestivalDesc(festival: any): string {
    return this.language === 'Hindi' && festival.DescriptionHindi?.trim()
      ? festival.DescriptionHindi.trim()
      : festival.Description;
  }

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private route: ActivatedRoute,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const account = await this.storage.get('account');
    this.language = account?.Languages || 'English';

    this.apinu.postUrlData(`FestivalSelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.festivalList = res.FestivalList
          .sort((a: any, b: any) =>
            new Date(a.FestivalDate).getTime() - new Date(b.FestivalDate).getTime()
          );
        this.filteredFestivals = [...this.festivalList];
        this.buildMonthFilter();
        this.findUpcomingFestival();
        this.isLoading = false;
      });

      this.apinu.postUrlData(
        `MarkNotificationsSeen?UserID=${account.UserID}&flag=${Number(3)}`,
        null
      ).subscribe();
  }

  buildMonthFilter() {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsHi = ['जन', 'फर', 'मार', 'अप्र', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्त', 'नव', 'दिस'];
    const months = new Set<number>();
    this.festivalList.forEach(f => months.add(new Date(f.FestivalDate).getMonth()));
    this.availableMonths = Array.from(months)
      .sort((a, b) => a - b)
      .map(m => ({
        label: this.language === 'Hindi' ? monthsHi[m] : monthsEn[m],
        value: m
      }));
  }

  filterByMonth(month: number | null) {
    this.selectedMonth = month;
    this.filteredFestivals = month === null
      ? [...this.festivalList]
      : this.festivalList.filter(f => new Date(f.FestivalDate).getMonth() === month);
  }

  findUpcomingFestival() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.upcomingFestival = this.festivalList.find(f => new Date(f.FestivalDate) >= today);
  }

  goToUpcomingFestival() {
    if (!this.upcomingFestival) return;

    // If already showing all, no need to reset filter (avoids re-render)
    if (this.selectedMonth !== null) {
      this.filterByMonth(null);
    }

    // Wait longer for DOM to fully settle after potential filter change
    setTimeout(() => {
      const el = document.getElementById('festival-' + this.upcomingFestival.FestivalID);
      if (!el) return;

      // Use IonContent scroll instead of native scrollIntoView
      // scrollIntoView can cause viewport shifts on mobile WebView
      const elTop = el.getBoundingClientRect().top;
      this.content.getScrollElement().then(scrollEl => {
        const currentScroll = scrollEl.scrollTop;
        const offset = 80; // leave some space from top
        const targetScroll = currentScroll + elTop - offset;

        this.content.scrollToPoint(0, targetScroll, 400); // smooth scroll

        // Highlight after scroll lands
        setTimeout(() => {
          el.classList.add('festival-highlight');
          setTimeout(() => el.classList.remove('festival-highlight'), 2000);
        }, 420);
      });
    }, 250); // longer delay so filterByMonth re-render finishes
  }

  getFestivalEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('diwali') || n.includes('deepavali') || n.includes('दीवाली')) return '🪔';
    if (n.includes('holi') || n.includes('होली')) return '🎨';
    if (n.includes('navratri') || n.includes('नवरात्रि')) return '🕺';
    if (n.includes('dussehra') || n.includes('durga') || n.includes('दुर्गा')) return '🦁';
    if (n.includes('ganesh') || n.includes('गणेश')) return '🐘';
    if (n.includes('krishna') || n.includes('janmashtami') || n.includes('जन्माष्टमी')) return '🦚';
    if (n.includes('ram') || n.includes('navami') || n.includes('राम')) return '🏹';
    if (n.includes('eid') || n.includes('ईद')) return '🌙';
    if (n.includes('christmas') || n.includes('क्रिसमस')) return '⛪';
    if (n.includes('guru') || n.includes('nanak') || n.includes('गुरु')) return '🙏';
    if (n.includes('puja') || n.includes('पूजा')) return '🪷';
    if (n.includes('new year') || n.includes('नव वर्ष')) return '🎉';
    if (n.includes('independence') || n.includes('republic') || n.includes('gandhi')) return '🇮🇳';
    if (n.includes('bhai') || n.includes('raksha') || n.includes('रक्षा')) return '🤝';
    if (n.includes('chhat') || n.includes('छठ')) return '🌅';
    if (n.includes('pradosh') || n.includes('प्रदोष')) return '🕉️';
    if (n.includes('ekadashi') || n.includes('एकादशी')) return '🌿';
    if (n.includes('purnima') || n.includes('पूर्णिमा')) return '🌕';
    if (n.includes('amavasya') || n.includes('अमावस्या')) return '🌑';
    if (n.includes('sankranti') || n.includes('संक्रांति')) return '🌞';
    if (n.includes('shivratri') || n.includes('शिवरात्रि')) return '🔱';
    if (n.includes('vrat') || n.includes('व्रत')) return '🙏';
    return '🪔';
  }
}