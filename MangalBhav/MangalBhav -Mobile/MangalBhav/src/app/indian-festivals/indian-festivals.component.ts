import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FileOpener } from '@capacitor-community/file-opener';

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
  ) { }

  // ── Panchang downloads (all uploaded dates) ────────────
  panchangDatesList: { dateStr: string; display: string }[] = [];
  isLoadingPanchangDates = true;
  downloadingPanchangDate: string | null = null;


  async ngOnInit() {
    const account = await this.storage.get('account');
    this.language = account?.Languages || 'English';

    this.apinu.postUrlData(`FestivalsSelectByQuery?Query=CanonicalURL = 'Festival'`, null)
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

    // ✅ guarded — only fire if we actually have a logged-in user
    if (account?.UserID) {
      this.apinu.postUrlData(
        `MarkNotificationsSeen?UserID=${account.UserID}&flag=${Number(3)}`,
        null
      ).subscribe();
    }

    this.loadAllPanchangDates(); // now guaranteed to run regardless of account state
  }

  // ── Fetch every distinct panchang date that's been uploaded ─
  loadAllPanchangDates() {
    this.isLoadingPanchangDates = true;

    this.apinu.postUrlData(`DailyPanchangSelectByQuery?Query=1=1`, null).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        const list: any[] = parsed?.DailyPanchangList || [];

        // group rows by date, keep only unique dates
        const seen = new Set<string>();
        const dates: { dateStr: string; display: string; sortKey: number }[] = [];

        list.forEach((row: any) => {
          if (!row.PanchangDate) return;
          const d = new Date(row.PanchangDate);
          const dateStr =
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (seen.has(dateStr)) return;
          seen.add(dateStr);
          dates.push({
            dateStr,
            display: d.toLocaleDateString(this.language === 'Hindi' ? 'hi-IN' : 'en-IN', {
              day: '2-digit', month: 'long', year: 'numeric'
            }),
            sortKey: d.getTime()
          });
        });

        dates.sort((a, b) => b.sortKey - a.sortKey); // newest first
        this.panchangDatesList = dates.map(({ dateStr, display }) => ({ dateStr, display }));
        this.isLoadingPanchangDates = false;
      },
      error: (err: any) => {
        console.error('loadAllPanchangDates failed:', err);
        this.isLoadingPanchangDates = false;
      }
    });
  }

  // ── Download panchang for one specific date ─────────────
  downloadPanchangForDate(dateStr: string) {
    if (this.downloadingPanchangDate) return; // one download at a time

    this.downloadingPanchangDate = dateStr;

    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr =
      `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    const query =
      `PanchangDate >= '${dateStr} 00:00:00.000' AND PanchangDate < '${nextDayStr} 00:00:00.000'`;

    this.apinu.postUrlData(
      `DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`,
      null
    ).subscribe({
      next: async (res: any) => {
        try {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          const list = parsed?.DailyPanchangList || [];

          if (!list.length) {
            this.downloadingPanchangDate = null;
            return;
          }

          const htmlString = await this.buildPanchangHtmlString(list);
          if (htmlString) {
            await this.renderHtmlAndDownload(htmlString, `panchang_${dateStr}.png`);
          }
        } catch (err) {
          console.error('downloadPanchangForDate failed:', err);
        } finally {
          this.downloadingPanchangDate = null;
        }
      },
      error: (err: any) => {
        console.error('DailyPanchang fetch failed for', dateStr, err);
        this.downloadingPanchangDate = null;
      }
    });
  }

  // ── Build the filled-in HTML string from the template + a data list ─
  private async buildPanchangHtmlString(list: any[]): Promise<string> {
    const templateHtml = await firstValueFrom(
      this.http.get('assets/panchang/index.html', { responseType: 'text' })
    );
    if (!templateHtml) return '';

    const doc = new DOMParser().parseFromString(templateHtml, 'text/html');

    const sectionMap = new Map<string, Array<{ key: string; value1: string }>>();
    list.forEach((item: any) => {
      const section = (item.SectionHeading || '').trim();
      const key = (item.Key1 || '').trim();
      const value = item.Value1 != null ? String(item.Value1).trim() : '';
      if (!section) return;
      if (!sectionMap.has(section)) sectionMap.set(section, []);
      if (key || value) sectionMap.get(section)!.push({ key, value1: value });
    });

    const first = list[0];
    if (first) {
      const dateEl = doc.getElementById('panchang-date');
      const locEl = doc.getElementById('panchang-location');
      if (dateEl && first.PanchangDate) {
        dateEl.textContent = new Date(first.PanchangDate).toLocaleDateString('hi-IN', {
          day: '2-digit', month: 'long', year: 'numeric'
        });
      }
      if (locEl) locEl.textContent = first.Location || '';
    }

    doc.querySelectorAll<HTMLElement>('[data-section]').forEach(container => {
      const sectionName = container.getAttribute('data-section')?.trim();
      if (!sectionName || !sectionMap.has(sectionName)) return;
      const items = sectionMap.get(sectionName)!;

      if (container.hasAttribute('data-key')) {
        const key = container.getAttribute('data-key')?.trim();
        const match = items.find(i => i.key === key);
        container.textContent = match?.value1 || '—';
        return;
      }

      const existingRows = container.querySelectorAll('.kv-row, .graha-row, .mini-card');
      existingRows.forEach(row => row.remove());

      items.forEach(item => {
        const row = doc.createElement('div');
        row.className = 'kv-row';
        const labelDiv = doc.createElement('div');
        labelDiv.className = 'label';
        if (item.key) labelDiv.innerHTML = `<span class="ico">◆</span>${item.key}:`;
        const valDiv = doc.createElement('div');
        valDiv.className = 'val';
        valDiv.textContent = item.value1 || '—';
        row.appendChild(labelDiv);
        row.appendChild(valDiv);
        container.appendChild(row);
      });
    });

    doc.querySelectorAll<HTMLImageElement>('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        img.setAttribute('src', `assets/panchang/${src}`);
      }
    });

    return `<!DOCTYPE html><html>${doc.documentElement.innerHTML}</html>`;
  }

  // ── Render an HTML string in a hidden iframe, capture it, save it ─
  private async renderHtmlAndDownload(htmlString: string, fileName: string) {
    const CAPTURE_WIDTH = 1600;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = `${CAPTURE_WIDTH}px`;
    iframe.style.height = '1600px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow!.document;
    doc.open();
    doc.write(htmlString);
    doc.close();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const sheetEl = doc.querySelector('.sheet') as HTMLElement;
    const actualHeight = sheetEl
      ? sheetEl.getBoundingClientRect().height + 48
      : doc.body.scrollHeight;

    iframe.style.height = `${actualHeight}px`;

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: CAPTURE_WIDTH,
      height: actualHeight,
      windowWidth: CAPTURE_WIDTH,
      windowHeight: actualHeight,
    });

    document.body.removeChild(iframe);

    const dataUrl = canvas.toDataURL('image/png');
    await this.savePanchangFile(dataUrl, fileName, 'image/png');
  }

  private async savePanchangFile(dataUrl: string, fileName: string, mimeType: string) {
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.split(',')[1];
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        try {
          await FileOpener.open({ filePath: writeResult.uri, contentType: mimeType });
        } catch {
          await Share.share({
            title: 'Panchang',
            url: writeResult.uri,
            dialogTitle: 'Save or share Panchang'
          });
        }
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.click();
      }
    } catch (err) {
      console.error('savePanchangFile failed:', err);
    }
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