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

interface PanchangDateEntry {
  dateKey: string;
  dateLabel: string;
  panchangImage?: string;
  panchangLoading?: boolean;
}

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
      loading: 'Loading...',
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
      loading: 'त्लोड हो रहे हैं...',
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
  panchangEntries: PanchangDateEntry[] = [];
  panchangFeedLoading = false;
  panchangAllLoaded = false;
  private panchangWindowEnd: Date | null = null;
  private panchangEmptyStreak = 0;
  private readonly panchangMaxEmptyWindows = 6;
  private readonly panchangWindowDays = 5;
  private panchangKeyOrder: Map<string, number> = new Map();



  async ngOnInit() {
    const account = await this.storage.get('account');
    this.language = account?.Languages || 'English';

    if (account?.UserID) {
      this.apinu.postUrlData(
        `MarkNotificationsSeen?UserID=${account.UserID}&flag=${Number(3)}`,
        null
      ).subscribe();
    }

    this.loadMorePanchang();
  }

  async loadMorePanchang() {
    if (this.panchangFeedLoading || this.panchangAllLoaded) return;
    this.panchangFeedLoading = true;
    try {
      if (!this.panchangWindowEnd) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.panchangWindowEnd = tomorrow;
      }

      const windowEnd = this.panchangWindowEnd;
      const windowStart = new Date(windowEnd);
      windowStart.setDate(windowStart.getDate() - this.panchangWindowDays);

      const startStr = this.toDateStr(windowStart);
      const endStr = this.toDateStr(windowEnd);

      const query = `PanchangDate >= '${startStr} 00:00:00.000' AND PanchangDate < '${endStr} 00:00:00.000'`;

      const res: any = await firstValueFrom(
        this.apinu.postUrlData(`DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      );
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const list: any[] = parsed?.DailyPanchangList || [];

      // group rows by date, newest first
      const seen = new Set<string>();
      const dateKeys: string[] = [];
      list.forEach(row => {
        if (!row.PanchangDate) return;
        const d = new Date(row.PanchangDate);
        const dateKey = this.toDateStr(d);
        if (seen.has(dateKey)) return;
        seen.add(dateKey);
        dateKeys.push(dateKey);
      });
      dateKeys.sort((a, b) => b.localeCompare(a));

      dateKeys.forEach(dateKey => {
        if (this.panchangEntries.find(e => e.dateKey === dateKey)) return;
        const entry: PanchangDateEntry = { dateKey, dateLabel: this.toDateLabel(dateKey) };
        this.panchangEntries.push(entry);
        this.loadPanchangImageForEntry(entry, list.filter(r => this.toDateStr(new Date(r.PanchangDate)) === dateKey));
      });
      this.panchangEntries.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

      this.panchangWindowEnd = windowStart;

      if (!dateKeys.length) {
        this.panchangEmptyStreak++;
        if (this.panchangEmptyStreak >= this.panchangMaxEmptyWindows) {
          this.panchangAllLoaded = true;
        }
      } else {
        this.panchangEmptyStreak = 0;
      }
    } catch (e) {
      console.error('loadMorePanchang failed:', e);
    } finally {
      this.panchangFeedLoading = false;
    }
  }

  async loadPanchangImageForEntry(entry: PanchangDateEntry, list: any[]) {
    if (entry.panchangImage || entry.panchangLoading || !list.length) return;
    entry.panchangLoading = true;
    try {
      if (this.panchangKeyOrder.size === 0) {
        await this.loadPanchangMasterOrder();
      }
      const htmlString = await this.buildPanchangHtmlString(list);
      if (htmlString) {
        entry.panchangImage = await this.rasterizePanchangHtml(htmlString);
      }
    } catch (e) {
      console.error('loadPanchangImageForEntry failed:', e);
    } finally {
      entry.panchangLoading = false;
    }
  }

  private loadPanchangMasterOrder(): Promise<void> {
    return new Promise((resolve) => {
      this.apinu.postUrlData(
        `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`Domain='Panchang'`)}`,
        null
      ).subscribe({
        next: (res: any) => {
          const list = typeof res.MasterDataList === 'string'
            ? JSON.parse(res.MasterDataList)
            : res.MasterDataList;

          const sections = list.filter((m: any) => !m.ParentItemID);
          const keysAll = list.filter((m: any) => !!m.ParentItemID);

          let idx = 0;
          sections.forEach((s: any) => {
            keysAll
              .filter((k: any) => k.ParentItemID === s.MasterDataID)
              .forEach((k: any) => {
                this.panchangKeyOrder.set(`${s.Identifier}|${k.Identifier}`, idx++);
              });
          });
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  onPanchangInfiniteScroll(event: any) {
    this.loadMorePanchang().then(() => {
      event.target.complete();
      if (this.panchangAllLoaded) event.target.disabled = true;
    });
  }

  private toDateLabel(dateKey: string): string {
    const today = this.toDateStr(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = this.toDateStr(yesterday);

    if (dateKey === today) return '🪔 आज';
    if (dateKey === yKey) return 'कल';

    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async sharePanchangImage(entry: PanchangDateEntry) {
    if (!entry.panchangImage) return;
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = entry.panchangImage.split(',')[1];
        const fileName = `panchang-${entry.dateKey}.png`;
        const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
        await Share.share({ title: 'आज का पंचांग', url: savedFile.uri, dialogTitle: 'पंचांग शेयर करें' });
      } else {
        const blob = await (await fetch(entry.panchangImage)).blob();
        const file = new File([blob], `panchang-${entry.dateKey}.png`, { type: 'image/png' });
        if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({ files: [file], title: 'आज का पंचांग' });
        } else if ((navigator as any).share) {
          await (navigator as any).share({ title: 'आज का पंचांग', url: entry.panchangImage });
        } else {
          const a = document.createElement('a');
          a.href = entry.panchangImage;
          a.download = `panchang-${entry.dateKey}.png`;
          a.click();
        }
      }
    } catch (e) {
      console.error('sharePanchangImage failed:', e);
    }
  }

  /** Same as community page's rasterizePanchangHtml */
  private async rasterizePanchangHtml(html: string): Promise<string> {
    const CAPTURE_WIDTH = 1100;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = `${CAPTURE_WIDTH}px`;
    iframe.style.height = '1000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow!.document;
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise(resolve => setTimeout(resolve, 800));

    const sheetEl = doc.querySelector('.sheet') as HTMLElement;
    const actualHeight = sheetEl ? sheetEl.getBoundingClientRect().height + 24 : doc.body.scrollHeight;
    iframe.style.height = `${actualHeight}px`;

    const canvas = await html2canvas(doc.body, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      width: CAPTURE_WIDTH, height: actualHeight,
      windowWidth: CAPTURE_WIDTH, windowHeight: actualHeight,
    });

    document.body.removeChild(iframe);
    return canvas.toDataURL('image/png');
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

  activePanchangKey: string | null = null; // e.g. "2026-07-09:view"

  // isPanchangBusy(dateStr: string, mode: 'view' | 'share' | 'download'): boolean {
  //   return this.activePanchangKey === `${dateStr}:${mode}`;
  // }

  // panchangAction(dateStr: string, mode: 'view' | 'share' | 'download') {
  //   if (this.activePanchangKey) return;
  //   this.activePanchangKey = `${dateStr}:${mode}`;

  //   const nextDay = new Date(dateStr);
  //   nextDay.setDate(nextDay.getDate() + 1);
  //   const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
  //   const query = `PanchangDate >= '${dateStr} 00:00:00.000' AND PanchangDate < '${nextDayStr} 00:00:00.000'`;

  //   this.apinu.postUrlData(`DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`, null).subscribe({
  //     next: async (res: any) => {
  //       try {
  //         const parsed = typeof res === 'string' ? JSON.parse(res) : res;
  //         const list = parsed?.DailyPanchangList || [];
  //         if (!list.length) { this.activePanchangKey = null; return; }

  //         const htmlString = await this.buildPanchangHtmlString(list);
  //         if (htmlString) {
  //           await this.renderHtmlAndDownload(htmlString, `panchang_${dateStr}.png`, mode);
  //         }
  //       } catch (err) {
  //         console.error('panchangAction failed:', err);
  //       } finally {
  //         this.activePanchangKey = null;
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('DailyPanchang fetch failed for', dateStr, err);
  //       this.activePanchangKey = null;
  //     }
  //   });
  // }

  // UPDATE signature — add mode, forward to savePanchangFile
  private async renderHtmlAndDownload(htmlString: string, fileName: string, mode: 'view' | 'share' | 'download' = 'download') {
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
    const actualHeight = sheetEl ? sheetEl.getBoundingClientRect().height + 48 : doc.body.scrollHeight;
    iframe.style.height = `${actualHeight}px`;

    const canvas = await html2canvas(doc.body, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      width: CAPTURE_WIDTH, height: actualHeight,
      windowWidth: CAPTURE_WIDTH, windowHeight: actualHeight,
    });

    document.body.removeChild(iframe);

    const dataUrl = canvas.toDataURL('image/png');
    await this.savePanchangFile(dataUrl, fileName, 'image/png', mode);
  }

  // UPDATE signature — same branching as the community page's saveFile
  private async savePanchangFile(dataUrl: string, fileName: string, mimeType: string, mode: 'view' | 'share' | 'download' = 'download') {
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.split(',')[1];
        const writeResult = await Filesystem.writeFile({
          path: fileName, data: base64Data, directory: Directory.Cache
        });

        if (mode === 'share') {
          await Share.share({ title: 'Panchang', url: writeResult.uri, dialogTitle: 'पंचांग साझा करें' });
        } else if (mode === 'view') {
          await FileOpener.open({ filePath: writeResult.uri, contentType: mimeType });
        } else {
          try {
            await FileOpener.open({ filePath: writeResult.uri, contentType: mimeType });
          } catch {
            await Share.share({ title: 'Panchang', url: writeResult.uri, dialogTitle: 'Save or share Panchang' });
          }
        }
      } else {
        if (mode === 'view') {
          window.open(dataUrl, '_blank');
        } else if (mode === 'share' && (navigator as any).share) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: mimeType });
          try {
            await (navigator as any).share({ files: [file], title: 'Panchang' });
          } catch {
            const a = document.createElement('a'); a.href = dataUrl; a.download = fileName; a.click();
          }
        } else {
          const a = document.createElement('a'); a.href = dataUrl; a.download = fileName; a.click();
        }
      }
    } catch (err) {
      console.error('savePanchangFile failed:', err);
    }
  }




  private async buildPanchangHtmlString(list: any[]): Promise<string> {
    const templateHtml = await firstValueFrom(
      this.http.get('assets/panchang/index.html', { responseType: 'text' })
    );
    if (!templateHtml) return '';

    const doc = new DOMParser().parseFromString(templateHtml, 'text/html');

    // ── GROUP DATA BY SECTION (same shape as open-community-page) ──
    const sectionMap = new Map<string, Array<{ key: string; value1: string }>>();
    list.forEach((item: any) => {
      const section = (item.SectionHeading || '').trim();
      const key = (item.Key1 || '').trim();
      const value = item.Value1 != null ? String(item.Value1).trim() : '';
      if (!section) return;
      if (!sectionMap.has(section)) sectionMap.set(section, []);
      if (key || value) sectionMap.get(section)!.push({ key, value1: value });
    });

    // ── DATE & LOCATION ──
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

    // ── DYNAMICALLY BUILD SECTIONS (icons + two-column split) ──
    const sectionContainers = doc.querySelectorAll<HTMLElement>('[data-section]');

    sectionContainers.forEach(container => {
      const sectionName = container.getAttribute('data-section')?.trim();
      if (!sectionName || !sectionMap.has(sectionName)) return;

      const items = sectionMap.get(sectionName)!;

      if (container.hasAttribute('data-key')) {
        const key = container.getAttribute('data-key')?.trim();
        const match = items.find(i => i.key === key);
        container.textContent = match?.value1 || '—';
        return;
      }

      container.innerHTML = ''; // clear placeholder rows

      const makeRow = (item: { key: string; value1: string }) => {
        const row = doc.createElement('div');
        row.className = 'kv-row';

        const labelDiv = doc.createElement('div');
        labelDiv.className = 'label';
        if (item.key) {
          const icon = this.PANCHANG_ICON_MAP[item.key] || '◆';
          const sep = sectionName === 'ग्रह स्थिति' ? ' —' : ':';
          labelDiv.innerHTML = `<span class="ico">${icon}</span>${item.key}${sep}`;
        }

        const valDiv = doc.createElement('div');
        valDiv.className = 'val';
        valDiv.textContent = item.value1 || '—';

        row.appendChild(labelDiv);
        row.appendChild(valDiv);
        return row;
      };

      if (this.TWO_COL_SECTIONS.includes(sectionName)) {
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.gap = '18px';

        const half = Math.ceil(items.length / 2);
        const leftCol = doc.createElement('div');
        leftCol.style.cssText = 'flex:1; display:flex; flex-direction:column;';
        const rightCol = doc.createElement('div');
        rightCol.style.cssText = 'flex:1; display:flex; flex-direction:column;';

        items.slice(0, half).forEach(item => leftCol.appendChild(makeRow(item)));
        items.slice(half).forEach(item => rightCol.appendChild(makeRow(item)));

        container.appendChild(leftCol);
        container.appendChild(rightCol);
      } else {
        items.forEach(item => container.appendChild(makeRow(item)));
      }
    });

    // ── FIX IMAGE PATHS ──
    doc.querySelectorAll<HTMLImageElement>('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        img.setAttribute('src', `assets/panchang/${src}`);
      }
    });

    return `<!DOCTYPE html><html>${doc.documentElement.innerHTML}</html>`;
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

  // ── REMOVE these ──
  // panchangDatesList: { dateStr: string; display: string }[] = [];
  // isLoadingPanchangDates = true;
  // downloadingPanchangDate: string | null = null;
  // loadAllPanchangDates() { ... }
  // the call to this.loadAllPanchangDates() in ngOnInit()

  // ── ADD these ──
  selectedPanchangDate: string = this.toDateStr(new Date()); // yyyy-mm-dd, defaults to today
  maxPanchangDate: string = this.toDateStr(new Date());       // can't pick a future date
  panchangNotFound = false;
  // activePanchangKey: string | null = null;

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  get selectedPanchangDisplay(): string {
    const d = new Date(this.selectedPanchangDate + 'T00:00:00');
    return d.toLocaleDateString(this.language === 'Hindi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  // Called from ion-datetime (ionChange emits full ISO string like "2026-07-09T00:00:00")
  PANCHANG_ICON_MAP: Record<string, string> = {
    'सूर्योदय': '🌅', 'सूर्यास्त': '🌇',
    'श्री संवत्': '📿', 'मास': '🗓️', 'अयन': '🧭', 'पक्ष': '🌓', 'ऋतु': '🍃',
    'तिथि': '📆', 'नक्षत्र': '⭐', 'योग': '🕉️', 'करण': '🤝',
    'अभिजीत मुहूर्त': '✅', 'राहुकाल': '⚠️',
    'सूर्य': '☀️', 'चंद्र': '🌙', 'मंगल': '♂️', 'बुध': '☿️', 'गुरु': '♃',
    'शुक्र': '♀️', 'शनि': '♄', 'राहु': '☊', 'केतु': '☋',
  };
  TWO_COL_SECTIONS = ['ग्रह स्थिति', 'संवत्सर एवं काल'];
  onPanchangDateChange(value: string | string[] | null | undefined) {
    if (!value) return;
    const isoValue = Array.isArray(value) ? value[0] : value;
    if (!isoValue) return;
    this.selectedPanchangDate = isoValue.substring(0, 10);
    this.panchangNotFound = false;
  }

  isPanchangBusy(mode: 'view' | 'share' | 'download'): boolean {
    return this.activePanchangKey === `${this.selectedPanchangDate}:${mode}`;
  }

  // UPDATED — now only ever fetches ONE date's rows, no "1=1" scan anywhere
  panchangAction(mode: 'view' | 'share' | 'download') {
    if (this.activePanchangKey) return;
    const dateStr = this.selectedPanchangDate;
    this.activePanchangKey = `${dateStr}:${mode}`;
    this.panchangNotFound = false;

    const nextDay = new Date(dateStr + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = this.toDateStr(nextDay);
    const query = `PanchangDate >= '${dateStr} 00:00:00.000' AND PanchangDate < '${nextDayStr} 00:00:00.000'`;

    this.apinu.postUrlData(`DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`, null).subscribe({
      next: async (res: any) => {
        try {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          const list = parsed?.DailyPanchangList || [];

          if (!list.length) {
            this.panchangNotFound = true;
            this.activePanchangKey = null;
            return;
          }

          const htmlString = await this.buildPanchangHtmlString(list);
          if (htmlString) {
            await this.renderHtmlAndDownload(htmlString, `panchang_${dateStr}.png`, mode);
          }
        } catch (err) {
          console.error('panchangAction failed:', err);
        } finally {
          this.activePanchangKey = null;
        }
      },
      error: (err: any) => {
        console.error('DailyPanchang fetch failed for', dateStr, err);
        this.activePanchangKey = null;
        this.panchangNotFound = true;
      }
    });
  }


  // ── Inline panchang image (same behavior as community page) ──
  panchangImage: string | null = null;
  panchangLoading = false;

  async loadPanchangForSelectedDate() {
    this.panchangImage = null;
    this.panchangNotFound = false;
    this.panchangLoading = true;

    try {
      const dateStr = this.selectedPanchangDate;
      const nextDay = new Date(dateStr + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = this.toDateStr(nextDay);
      const query = `PanchangDate >= '${dateStr} 00:00:00.000' AND PanchangDate < '${nextDayStr} 00:00:00.000'`;

      const res: any = await firstValueFrom(
        this.apinu.postUrlData(`DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      );
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const list = parsed?.DailyPanchangList || [];

      if (!list.length) {
        this.panchangNotFound = true;
        return;
      }

      const htmlString = await this.buildPanchangHtmlString(list);
      if (htmlString) {
        this.panchangImage = await this.rasterizePanchangHtml(htmlString);
      }
    } catch (err) {
      console.error('loadPanchangForSelectedDate failed:', err);
      this.panchangNotFound = true;
    } finally {
      this.panchangLoading = false;
    }
  }

  async downloadPanchangImage() {
    if (!this.panchangImage) return;
    const fileName = `panchang-${this.selectedPanchangDate}.png`;
    await this.savePanchangFile(this.panchangImage, fileName, 'image/png', 'download');
  }


}