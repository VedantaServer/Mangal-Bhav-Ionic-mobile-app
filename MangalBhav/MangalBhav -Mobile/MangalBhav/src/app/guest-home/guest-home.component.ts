import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, NavController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../../providers';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';
import { BottomNavBarComponent, BottomNavTab } from '../bottom-nav-bar/bottom-nav-bar.component';

@Component({
  selector: 'app-guest-home',
  templateUrl: './guest-home.component.html',
  styleUrls: ['./guest-home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TabscommonheaderComponent, BottomNavBarComponent]
})
export class GuestHomeComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  Language: any = 'English';
  categoryList: any[] = [];
  enrichedCategories: any[] = [];
  serviceBookingCountMap: { [key: string]: number } = {};
  imgBaseUrl = 'https://app.mangalbhav.com/assets/img';
  isCategoryDropdownOpen = false;
  selectedCategory: any = null;
  userReferCode: string = '';
  referCopied = false;

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage
  ) { }

  async ngOnInit() {
    const savedLang = await this.storage.get('language');
    this.Language = savedLang || 'English';
    this.getAllCategories();
    this.loadPujaSection();
  }

  // ── Move these methods here verbatim from login.ts ──
  // getServiceImagePath, loadPujaSection, getServiceEnglishName, getServiceBadge,
  // getAllCategories, getAllServices, getAllCategoryMap, getCategoryIcon,
  // gotToOpenPanditPage, getCategoryImage, slideCarousel, onImgError,
  // getCurrentImage, getServiceImages, startSlideshow, explorePooja,
  // loadAllServiceCounts, copyReferCode, shareReferCode,
  // isCategoryDropdownOpen/selectedCategory/toggleCategoryDropdown/selectCategory,
  // openPage

  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};


  shareReferCode() {
    const code = `MANGAL${this.userReferCode}`;
    const msg = `🪔 Join me on Mangal.Bhav — A platform for booking verified pandits!\nUse my referral code *${code}* and get ₹50 off your first booking.\n\nDownload now: https://app.mangalbhav.com`;

    if (navigator.share) {
      navigator.share({ title: 'Mangal.Bhav Referral', text: msg });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  }


  copyReferCode() {
    const code = `MANGAL${this.userReferCode}`;
    navigator.clipboard.writeText(code).then(() => {
      this.referCopied = true;
      setTimeout(() => this.referCopied = false, 2500);
    });
  }


  loadAllServiceCounts() {
    this.enrichedCategories.forEach((cat: any) => {
      cat.services.forEach((svc: any) => {

        this.serviceBookingCountMap[String(svc.ServiceID)] = 5; // ← default 10

        this.apinu.postUrlData(`PanditServicesSelectAllByServiceID?serviceID=${svc.ServiceID}`, null)
          .subscribe({
            next: (res: any) => {

              const panditServiceIDs = res.PanditServiceList?.map((p: any) => p.PanditServiceID) || [];

              if (panditServiceIDs.length === 0) {
                this.serviceBookingCountMap[String(svc.ServiceID)] = 5; // ← no pandits = 10
                return;
              }

              const bookingCalls = panditServiceIDs.map((psid: any) =>
                this.apinu.postUrlData(`BookingsSelectAllByPanditServiceID?panditServiceID=${psid}`, null)
              );

              forkJoin(bookingCalls).subscribe({
                next: (results: any) => {
                  const totalCount = results.reduce((sum: number, r: any) => {
                    return sum + (r?.BookingList?.length || 0);
                  }, 0);

                  // ← real count + 10
                  this.serviceBookingCountMap[String(svc.ServiceID)] = totalCount + 5;
                },
                error: () => {
                  this.serviceBookingCountMap[String(svc.ServiceID)] = 5; // ← error = 10
                }
              });
            },
            error: () => {
              this.serviceBookingCountMap[String(svc.ServiceID)] = 5; // ← error = 10
            }
          });
      });
    });
  }


  async explorePooja(cat: any) {
    const el = document.getElementById(cat);
    if (!el) return;

    const scrollEl = await this.content.getScrollElement();
    const yOffset = el.offsetTop - 80;

    this.content.scrollToPoint(0, yOffset, 600);
  }



  startSlideshow(serviceName: string) {
    const key = serviceName;

    if (this.imageIntervals[key]) return; // avoid multiple intervals

    this.currentImageIndex[key] = 0;

    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] =
        (this.currentImageIndex[key] + 1) % 3;
    }, 1000000);
  }



  getServiceImages(serviceName: string): string[] {
    const cleanName = serviceName;
    return [
      `${this.imgBaseUrl}/${cleanName}.png`,
      `${this.imgBaseUrl}/${cleanName}2.jfif`,
      `${this.imgBaseUrl}/${cleanName}3.jfif`
    ];
  }


  getCurrentImage(serviceName: string): string {
    const key = serviceName;
    const images = this.getServiceImages(serviceName);

    if (!(key in this.currentImageIndex)) {
      this.startSlideshow(serviceName);
    }

    return images[this.currentImageIndex[key] || 0];
  }


  // Add this property
  brokenImages = new Set<string>();

  // Update getServiceImagePath to check broken state first
  getServiceImagePath(serviceName: string): string {
    if (this.brokenImages.has(serviceName)) {
      return `${this.imgBaseUrl}/default.jpg`;
    }
    const englishName = serviceName.split('/')[0].trim().replace(/\s+/g, '').replace(/&/g, '');
    return `${this.imgBaseUrl}/${englishName}.png`;
  }

  // Update onImgError to just record state, not mutate the DOM
  onImgError(event: Event, serviceName: string) {
    if (!this.brokenImages.has(serviceName)) {
      this.brokenImages.add(serviceName);
    }
  }


  slideCarousel(carouselId: string, direction: 'prev' | 'next') {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const cardWidth = carousel.querySelector('.puja-card')?.clientWidth || 300;
    carousel.scrollBy({ left: direction === 'next' ? cardWidth + 20 : -(cardWidth + 20), behavior: 'smooth' });
  }




  getCategoryImage(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('birth')) return `${this.imgBaseUrl}/PunsavanSanskar2.jfif`;
    if (n.includes('childhood')) return `${this.imgBaseUrl}/AnnaprashanCeremony.jfif`;
    if (n.includes('marriage')) return `${this.imgBaseUrl}/WeddingCeremony(VivahSanskar).jfif`;
    if (n.includes('house') || n.includes('property')) return `${this.imgBaseUrl}/GrihaPraveshPuja.jfif`;
    if (n.includes('dosha') || n.includes('special')) return `${this.imgBaseUrl}/GaneshPuja.jfif`;
    if (n.includes('antim') || n.includes('death')) return `${this.imgBaseUrl}/AntimSanskar.jfif`;
    if (n.includes('navagraha')) return `${this.imgBaseUrl}/NavagrahaShantiPuja3.jfif`;
    if (n.includes('education')) return `${this.imgBaseUrl}/UpanayanCeremony.jfif`;
    return `${this.imgBaseUrl}/default.jpg`;
  }




  gotToOpenPanditPage(categoryid: any, serviceid?: any) {


    this.routerCtrl.navigateForward('/pandit-list', {
      queryParams: {
        categoryid: categoryid,
        serviceid: serviceid || null
      }
    });
  }




  getCategoryIcon(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('birth')) return '🌱';
    if (n.includes('childhood')) return '👶';
    if (n.includes('marriage')) return '💍';
    if (n.includes('house') || n.includes('property')) return '🏡';
    if (n.includes('dosha') || n.includes('special')) return '⭐';
    if (n.includes('antim') || n.includes('death')) return '🕯️';
    if (n.includes('health')) return '🏥';
    if (n.includes('navagraha')) return '🪐';
    if (n.includes('education')) return '📚';
    return '🪔';
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.isCategoryDropdownOpen = false;
    this.explorePooja(cat.CategoryName);
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }


  servicecategoryMapList: any[] = [];

  getAllCategoryMap() {
    this.apinu.postUrlData(`ServiceCategoryMappingSelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.servicecategoryMapList = res.ServiceCategoryMappingList;

      })
  }
  serviceList: any[] = [];


  getAllServices() {
    this.apinu.postUrlData(`ServiceSelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.serviceList = res.ServiceList;

      })
  }

  getAllCategories() {
    this.apinu.postUrlData(`ServiceCategorySelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.categoryList = res.ServiceCategoryList;
        this.selectedCategory = this.categoryList[3];
      })
  }

  getServiceBadge(serviceName: string): string {
    const n = serviceName?.toLowerCase() || '';
    if (n.includes('havan') || n.includes('homa')) return '🔥 Havan';
    if (n.includes('katha') || n.includes('path')) return '📿 Katha';
    if (n.includes('naming') || n.includes('naamkaran')) return '📛 Naming';
    if (n.includes('mundan')) return '✂️ Mundan';
    if (n.includes('annaprash')) return '🍚 First Food';
    if (n.includes('upanayan') || n.includes('thread')) return '🧵 Sacred Thread';
    if (n.includes('wedding') || n.includes('vivah')) return '💍 Vivah';
    if (n.includes('griha')) return '🏡 Griha Pravesh';
    if (n.includes('vastu')) return '🏠 Vastu';
    if (n.includes('navagraha')) return '🪐 Navagraha';
    if (n.includes('lakshmi')) return '🌼 Lakshmi';
    if (n.includes('ganesh')) return '🐘 Ganesh';
    if (n.includes('durga')) return '🦁 Durga';
    if (n.includes('antim') || n.includes('sanskar') && n.includes('antim')) return '🕯️ Antyeshti';
    if (n.includes('shraddha') || n.includes('pitru')) return '🙏 Shraddha';
    return '🔥 Puja';
  }


  getServiceEnglishName(fullName: string): string {
    return fullName?.split('/')?.[0]?.trim() || fullName;
  }

  // getServiceImagePath(serviceName: string): string {
  //   const englishName = serviceName.split('/')[0].trim().replace(/\s+/g, '').replace(/&/g, '');
  //   return `${this.imgBaseUrl}/${englishName}.png`;
  // }


  loadPujaSection() {
    forkJoin({
      categories: this.apinu.postUrlData(`ServiceCategorySelectAll?tenantID=1`, null),
      services: this.apinu.postUrlData(`ServiceSelectAll?tenantID=1`, null),
      mapping: this.apinu.postUrlData(`ServiceCategoryMappingSelectAll?tenantID=1`, null)
    }).subscribe((res: any) => {

      const categories = res.categories.ServiceCategoryList;
      const services = res.services.ServiceList;
      const mapping = res.mapping.ServiceCategoryMappingList;
      this.enrichedCategories = categories.map((cat: any) => {

        const serviceIDs = mapping
          .filter((m: any) => m.CategoryID === cat.CategoryID && m.IsActive)
          .map((m: any) => m.ServiceID);

        const catServices = services
          .filter((s: any) => serviceIDs.includes(s.ServiceID))
          .sort((a: any, b: any) => {
            const orderA = parseInt(a.UpdatedByUser, 10);
            const orderB = parseInt(b.UpdatedByUser, 10);
            const safeA = isNaN(orderA) ? 999 : orderA;
            const safeB = isNaN(orderB) ? 999 : orderB;
            return safeA - safeB;
          });

        return { ...cat, services: catServices };
      });

      console.log('Enriched Categories:', this.enrichedCategories);
      this.loadAllServiceCounts();

    });
  }


  // gotToOpenPanditPage(categoryid: any, serviceid?: any) {
  //   // when a guest taps a service, send them straight to login/register — no query params needed
  //   this.routerCtrl.navigateForward('/login', { queryParams: { redirectServiceId: serviceid, redirectCategoryId: categoryid } });
  //   // OR simplest: just go to /login and let them browse/register; store the pending IDs in storage instead of query params
  // }

  get tabs(): BottomNavTab[] {
    return [
      { id: 'pooja', icon: '/assets/pooja.png', label: 'Pooja', matches: (url) => url.includes('guest-home') },
      { id: 'temple', icon: '/assets/temple.png', label: 'Temple', matches: () => false },
      { id: 'community', icon: '/assets/yagna2.png', round: true, matches: () => false },
      { id: 'pandit', icon: '/assets/pandit.png', label: 'Pandit Ji', matches: () => false },
      { id: 'signup', icon: '/assets/user.png', label: 'Signup', matches: (url) => url.includes('/login') },
    ];
  }

  onTabSelected(id: string) {
    switch (id) {
      case 'pooja': break; // already here
      case 'temple': this.routerCtrl.navigateForward('/openfindmandir'); break;
      case 'community': this.routerCtrl.navigateForward('/open-community-page'); break;
      case 'pandit': this.routerCtrl.navigateForward('/open-find-pandit'); break;
      case 'signup': this.routerCtrl.navigateForward('/login'); break;
    }
  }
}