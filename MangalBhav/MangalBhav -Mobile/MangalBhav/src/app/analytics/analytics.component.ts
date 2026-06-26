import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface DashboardStats {
  TotalBookings: number;
  TotalCategory: number;
  TotalFamily: number;
  TotalFamilyMembers: number;
  TotalLocations: number;
  TotalMandirDonation: number;
  TotalMandirEvents: number;
  TotalMandirMember: number;
  TotalMandirs: number;
  TotalMangalMudraPoints: number;
  TotalPanchang: number;
  TotalPandits: number;
  TotalPanditService: number;
  TotalPoojaBookingAmount: number;
  TotalService: number;
  TotalSocialMedia: number;
  TotalTransaction: number;
  TotalUsers: number;
  TotalYajmans: number;
}

export interface StatCard {
  label: string;
  labelHi: string;
  key: keyof DashboardStats;
  icon: string;
  prefix?: string;
}

export interface StatGroup {
  title: string;
  titleHi: string;
  emoji: string;
  colorClass: string;
  cards: StatCard[];
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AnalyticsComponent implements OnInit {

  stats: DashboardStats | null = null;
  isLoading = true;
  loadError = false;
  skeletonRows = Array(4);
  skeletonCols = Array(4);

  statGroups: StatGroup[] = [
    {
      title: 'Devotees & Community',
      titleHi: 'भक्त और समुदाय',
      emoji: '🙏',
      colorClass: 'group-saffron',
      cards: [
        { label: 'Total Users',      labelHi: 'कुल उपयोगकर्ता',   key: 'TotalUsers',         icon: 'people'        },
        { label: 'Yajmans',          labelHi: 'यजमान',             key: 'TotalYajmans',       icon: 'person-add'    },
        { label: 'Families',         labelHi: 'परिवार',             key: 'TotalFamily',        icon: 'home'          },
        { label: 'Family Members',   labelHi: 'परिवार के सदस्य',   key: 'TotalFamilyMembers', icon: 'people-circle' },
        { label: 'Mandir Members',   labelHi: 'मंदिर सदस्य',       key: 'TotalMandirMember',  icon: 'ribbon'        },
        { label: 'Social Shares',    labelHi: 'सोशल शेयर',         key: 'TotalSocialMedia',   icon: 'share-social'  },
      ]
    },
    {
      title: 'Mandirs & Panchang',
      titleHi: 'मंदिर और पंचांग',
      emoji: '🛕',
      colorClass: 'group-maroon',
      cards: [
        { label: 'Total Mandirs',    labelHi: 'कुल मंदिर',     key: 'TotalMandirs',      icon: 'business'  },
        { label: 'Mandir Events',    labelHi: 'मंदिर आयोजन',   key: 'TotalMandirEvents', icon: 'calendar'  },
        { label: 'Panchang Entries', labelHi: 'पंचांग',         key: 'TotalPanchang',     icon: 'book'      },
        { label: 'Locations',        labelHi: 'स्थान',           key: 'TotalLocations',    icon: 'location'  },
      ]
    },
    {
      title: 'Pandits & Services',
      titleHi: 'पंडित और सेवाएं',
      emoji: '🕉️',
      colorClass: 'group-teal',
      cards: [
        { label: 'Total Pandits',    labelHi: 'कुल पंडित',        key: 'TotalPandits',       icon: 'person'    },
        { label: 'Pandit Services',  labelHi: 'पंडित सेवाएं',      key: 'TotalPanditService', icon: 'sparkles'  },
        { label: 'Services',         labelHi: 'सेवाएं',             key: 'TotalService',       icon: 'construct' },
        { label: 'Categories',       labelHi: 'श्रेणियां',          key: 'TotalCategory',      icon: 'layers'    },
      ]
    },
    {
      title: 'Bookings & Finance',
      titleHi: 'बुकिंग और वित्त',
      emoji: '💰',
      colorClass: 'group-gold',
      cards: [
        { label: 'Total Bookings',     labelHi: 'कुल बुकिंग',  key: 'TotalBookings',          icon: 'bookmarks'                   },
        { label: 'Transactions',       labelHi: 'लेनदेन',       key: 'TotalTransaction',       icon: 'card'                        },
        { label: 'Pooja Amount',       labelHi: 'पूजा राशि',    key: 'TotalPoojaBookingAmount', icon: 'cash',   prefix: '₹'        },
        { label: 'Mandir Donations',   labelHi: 'मंदिर दान',    key: 'TotalMandirDonation',    icon: 'wallet', prefix: '₹'        },
      ]
    },
    {
      title: 'Mangal Mudra Points',
      titleHi: 'मंगल मुद्रा पॉइंट्स',
      emoji: '⭐',
      colorClass: 'group-amber',
      cards: [
        { label: 'Total Points', labelHi: 'कुल पॉइंट्स', key: 'TotalMangalMudraPoints', icon: 'star' },
      ]
    }
  ];

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
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats(event?: any) {
    if (!event) this.isLoading = true;
    this.loadError = false;

    this.apinu.postUrlData('GetDashboardStatistics', null).subscribe({
      next: (res: any) => {
        this.stats = res[0] as DashboardStats;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
        if (event) event.target.complete();
      }
    });
  }

  get totalRevenue(): number {
    if (!this.stats) return 0;
    return (this.stats.TotalPoojaBookingAmount ?? 0) + (this.stats.TotalMandirDonation ?? 0);
  }

  getValue(key: keyof DashboardStats): number {
    return this.stats ? (this.stats[key] ?? 0) : 0;
  }
}