import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, elementAt, forkJoin, map, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { Router } from '@angular/router';


@Component({
  selector: 'app-indian-festivals',
  templateUrl: './indian-festivals.component.html',
  styleUrls: ['./indian-festivals.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class IndianFestivalsComponent implements OnInit {

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage, private route: ActivatedRoute,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }


  isLoading: boolean = true;
  festivalList: any[] = [];
  filteredFestivals: any[] = [];
  selectedMonth: number | null = null;
  availableMonths: { label: string, value: number }[] = [];
upcomingFestival: any = null;
  ngOnInit() {
    this.api.post(`FestivalSelectAll?tenantID=1`, null)
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
  }

  buildMonthFilter() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = new Set<number>();
    this.festivalList.forEach(f => {
      months.add(new Date(f.FestivalDate).getMonth());
    });
    this.availableMonths = Array.from(months)
      .sort((a, b) => a - b)
      .map(m => ({ label: monthNames[m], value: m }));
  }

  filterByMonth(month: number | null) {
    this.selectedMonth = month;
    if (month === null) {
      this.filteredFestivals = [...this.festivalList];
    } else {
      this.filteredFestivals = this.festivalList.filter(f =>
        new Date(f.FestivalDate).getMonth() === month
      );
    }
  }

  getFestivalEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('diwali') || n.includes('deepavali')) return '🪔';
    if (n.includes('holi')) return '🎨';
    if (n.includes('navratri')) return '🕺';
    if (n.includes('dussehra') || n.includes('durga')) return '🦁';
    if (n.includes('ganesh')) return '🐘';
    if (n.includes('krishna') || n.includes('janmashtami')) return '🦚';
    if (n.includes('ram') || n.includes('navami')) return '🏹';
    if (n.includes('eid')) return '🌙';
    if (n.includes('christmas')) return '⛪';
    if (n.includes('guru') || n.includes('nanak')) return '🙏';
    if (n.includes('puja')) return '🪷';
    if (n.includes('new year')) return '🎉';
    if (n.includes('independence') || n.includes('republic') || n.includes('gandhi')) return '🇮🇳';
    if (n.includes('bhai') || n.includes('raksha')) return '🤝';
    if (n.includes('chhat')) return '🌅';
    if (n.includes('hanukkah')) return '🕎';
    if (n.includes('halloween')) return '🎃';
    return '🪔';
  }

  // call this after festivalList is loaded
findUpcomingFestival() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.upcomingFestival = this.festivalList.find(f =>
    new Date(f.FestivalDate) >= today
  );
}

goToUpcomingFestival() {
  if (!this.upcomingFestival) return;

  // reset filter to All so card is visible
  this.filterByMonth(null);

  setTimeout(() => {
    const el = document.getElementById('festival-' + this.upcomingFestival.FestivalID);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('festival-highlight');
      setTimeout(() => el.classList.remove('festival-highlight'), 2000);
    }
  }, 100);
}

}
