import { Component, OnInit } from '@angular/core';
import { Api, ApiNU } from 'src/providers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FileOpener } from '@capacitor-community/file-opener';
import { ViewChild, ElementRef } from '@angular/core';
interface PanchangKey {
  MasterDataID: number;
  Identifier: string;
  Value: string;
  DailyPanchangID: number;
  OriginalValue: string;
}

interface PanchangSection {
  MasterDataID: number;
  Identifier: string;
  keys: PanchangKey[];
}

@Component({
  selector: 'app-admin-panchang-insert',
  templateUrl: './admin-panchang-insert.component.html',
  styleUrls: ['./admin-panchang-insert.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule
  ]
})
export class AdminPanchangInsertComponent implements OnInit {
  dailyPanchang: any = {
    DailyPanchangID: 0,
    SectionHeading: '',
    Key1: '',
    Value1: '',
    PanchangDate: '',
    Language: '',
    Location: '',
    DateAdded: ''
  };
  sectionHeadingList = [
    'सूर्य संबंधी जानकारी',
    'संवत्सर एवं काल',
    'पंचांग विवरण',
    'शुभ-अशुभ समय',
    'ग्रह स्थिति',
    'आज के पर्व एवं विशेष दिवस',
    'आज का धार्मिक महत्व',
    'आज का शुभ उपाय',
    'सुविचार'
  ];
  searchDate = this.toDateInputValue(new Date());
  isEditMode = false;
  DailyPanchangList: any[] = [];
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  showPreviewModal = false;
  isBuildingPreview = false;
  isDownloadingPreview = false;
  private panchangHtmlString = ''; // raw HTML string, set into iframe via srcdoc
  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController,
    public http: HttpClient
  ) { }
  // 1. Initial declaration
  panchangDate: any = this.toDateInputValue(new Date());
  language = 'Hindi';
  location = '';
  panchangSections: PanchangSection[] = [];

  ngOnInit() {
    this.panchangDate = this.toDateInputValue(new Date());
    this.loadMasterData();
  }



  loadMasterData() {
    this.apinu.postUrlData(
      `MasterDataSelectByQuery?tenantID=-1&Query=${encodeURIComponent(`Domain='Panchang'`)}`,
      null
    ).subscribe((res: any) => {

      const list = typeof res.MasterDataList === 'string'
        ? JSON.parse(res.MasterDataList)
        : res.MasterDataList;

      const sections = list.filter((m: any) => !m.ParentItemID);
      const keys = list.filter((m: any) => !!m.ParentItemID);

      this.panchangSections = sections.map((s: any) => ({
        MasterDataID: s.MasterDataID,
        Identifier: s.Identifier,
        keys: keys
          .filter((k: any) => k.ParentItemID === s.MasterDataID)
          .map((k: any) => ({
            MasterDataID: k.MasterDataID,
            Identifier: k.Identifier,
            Value: '',
            DailyPanchangID: 0,
            OriginalValue: ''
          }))
      }));

      // once schema is built, overlay existing values for the chosen date
      this.loadExistingValuesForDate();

    });
  }

  // Call this after loadMasterData, and again whenever panchangDate changes


  private panchangRequestId = 0;

  loadExistingValuesForDate() {

    if (this.panchangSections.length === 0) return;

    const requestId = ++this.panchangRequestId;

    const startDate = this.formatSqlDateOnly(this.panchangDate);
    const endDt = new Date(this.panchangDate);
    endDt.setDate(endDt.getDate() + 1);
    const endDate = this.formatSqlDateOnly(endDt);

    const query =
      `PanchangDate >= '${startDate} 00:00:00.000' AND PanchangDate < '${endDate} 00:00:00.000'`;

    this.apinu.postUrlData(
      `DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`,
      null
    ).subscribe((res: any) => {

      if (requestId !== this.panchangRequestId) return; // a newer request has since fired — discard this one

      const existing = typeof res.DailyPanchangList === 'string'
        ? JSON.parse(res.DailyPanchangList)
        : (res.DailyPanchangList || []);

      this.resetSectionValues();

      existing.forEach((row: any) => {
        const section = this.panchangSections.find(s => s.Identifier === row.SectionHeading);
        const key = section?.keys.find(k => k.Identifier === row.Key1);
        if (key) {
          key.Value = row.Value1;
          key.OriginalValue = row.Value1;
          key.DailyPanchangID = row.DailyPanchangID;
        }
      });

    });
  }





  saveDailyPanchang() {

    const isoDate = new Date(this.panchangDate).toISOString();
    const dateAdded = new Date().toISOString();

    const inserts: any[] = [];
    const updates: any[] = [];

    this.panchangSections.forEach(section => {
      section.keys.forEach(key => {

        const val = (key.Value || '').trim();

        if (key.DailyPanchangID > 0) {
          // existing record — only send update if value actually changed
          if (val !== (key.OriginalValue || '').trim() && val.length > 0) {
            updates.push({
              DailyPanchangID: key.DailyPanchangID,
              SectionHeading: section.Identifier,
              Key1: key.Identifier,
              Value1: val,
              PanchangDate: isoDate,
              Language: this.language,
              Location: this.location,
              DateAdded: dateAdded
            });
          }
        } else if (val.length > 0) {
          // no existing record, and user filled it in — new insert
          inserts.push({
            DailyPanchangID: 0,
            SectionHeading: section.Identifier,
            Key1: key.Identifier,
            Value1: val,
            PanchangDate: isoDate,
            Language: this.language,
            Location: this.location,
            DateAdded: dateAdded
          });
        }

      });
    });

    if (inserts.length === 0 && updates.length === 0) {
      alert('No new or changed values to save.');
      return;
    }

    const insertCalls = inserts.map(p => this.apinu.postUrlData('DailyPanchangInsert', p));
    const updateCalls = updates.map(p => this.apinu.postUrlData('DailyPanchangUpdate', p));

    forkJoin([...insertCalls, ...updateCalls]).subscribe((results: any[]) => {
      const failed = results.filter(r => !(r?.DailyPanchangID > 0));
      if (failed.length === 0) {
        alert(`Saved: ${inserts.length} new, ${updates.length} updated.`);
        this.loadExistingValuesForDate(); // refresh so OriginalValue/IDs sync
      } else {
        alert(`${failed.length} of ${results.length} entries failed to save.`);
      }
    });

  }


  clearValues() {
    this.panchangSections.forEach(section =>
      section.keys.forEach(key => key.Value = '')
    );
  }


  formatSqlDate(date: any): string {

    const dt = new Date(date);

    return (
      dt.getFullYear() + '-' +
      ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
      ('0' + dt.getDate()).slice(-2) +
      ' 00:00:00.000'
    );

  }

  private formatSqlDateOnly(date: any): string {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date; // already in the exact format needed — skip Date entirely
    }
    const dt = new Date(date);
    return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
  }

  loadDailyPanchang() {


    this.DailyPanchangList = [];

    const startDate = this.formatSqlDateOnly(this.searchDate);

    const endDt = new Date(this.searchDate);
    endDt.setDate(endDt.getDate() + 1);
    const endDate = this.formatSqlDateOnly(endDt);

    const query =
      `PanchangDate >= '${startDate} 00:00:00.000' AND PanchangDate < '${endDate} 00:00:00.000'`;

    this.apinu.postUrlData(
      `DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`,
      null
    ).subscribe((res: any) => {

      this.DailyPanchangList =
        typeof res.DailyPanchangList === 'string'
          ? JSON.parse(res.DailyPanchangList)
          : res.DailyPanchangList;

    });

  }


  preparePayload() {

    return {

      DailyPanchangID: Number(this.dailyPanchang.DailyPanchangID || 0),

      SectionHeading: this.dailyPanchang.SectionHeading,

      Key1: this.dailyPanchang.Key1,

      Value1: this.dailyPanchang.Value1,

      // ISO format for ASP.NET Core model binding
      PanchangDate: new Date(this.dailyPanchang.PanchangDate).toISOString(),

      Language: this.dailyPanchang.Language,

      Location: this.dailyPanchang.Location,

      DateAdded: new Date().toISOString()

    };

  }


  // saveDailyPanchang() {

  //   const payload = this.preparePayload();

  //   const action = this.isEditMode
  //     ? 'DailyPanchangUpdate'
  //     : 'DailyPanchangInsert';

  //   this.apinu.postUrlData(action, payload)
  //     .subscribe((res: any) => {

  //       if (res?.DailyPanchangID > 0) {

  //         alert("Saved Successfully");

  //         this.loadDailyPanchang();

  //       } else {

  //         alert("Something went wrong.");

  //       }

  //     });

  // }



  editDailyPanchang(item: any) {
    // Set the dynamic form's date to this record's date...
    this.panchangDate = this.toDateInputValue(item.PanchangDate);
    this.language = item.Language || this.language;
    this.location = item.Location || this.location;

    // ...which loads all sections/keys saved for that date into panchangSections
    this.resetSectionValues();
    this.loadExistingValuesForDate();

    // Optional: scroll user to the form so they see it populate
    const formEl = document.querySelector('ion-card:last-of-type');
    formEl?.scrollIntoView({ behavior: 'smooth' });
  }


  addNew() {
    this.panchangDate = this.toDateInputValue(new Date());
    this.language = 'Hindi';
    this.location = '';
    this.resetSectionValues();       // ← clear instantly, no flash of old date's data
    this.loadExistingValuesForDate();
  }


  private toDateInputValue(date: any): string {
    const dt = new Date(date);
    return (
      dt.getFullYear() + '-' +
      ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
      ('0' + dt.getDate()).slice(-2)
    );
  }

  private resetSectionValues() {
    this.panchangSections.forEach(section =>
      section.keys.forEach(key => {
        key.Value = '';
        key.DailyPanchangID = 0;
        key.OriginalValue = '';
      })
    );
  }


  // ── Build a "list" shape identical to what DailyPanchangSelectByQuery returns,
//    but sourced from the CURRENT (unsaved) form state ──
private buildPreviewList(): any[] {
  const list: any[] = [];
  const isoDate = new Date(this.panchangDate).toISOString();

  this.panchangSections.forEach(section => {
    section.keys.forEach(key => {
      const val = (key.Value || '').trim();
      if (val.length > 0) {
        list.push({
          SectionHeading: section.Identifier,
          Key1: key.Identifier,
          Value1: val,
          PanchangDate: isoDate,
          Location: this.location
        });
      }
    });
  });

  return list;
}

// ── Same dynamic section-builder used on the community page ──
private async buildPanchangHtmlFromList(list: any[]): Promise<string> {
  const templateHtml = await firstValueFrom(
    this.http.get('assets/panchang/index.html', { responseType: 'text' })
  );
  if (!templateHtml) return '';

  const doc = new DOMParser().parseFromString(templateHtml, 'text/html');

  const sectionMap = new Map<string, Array<{ key: string, value1: string }>>();
  list.forEach((item: any) => {
    const section = (item.SectionHeading || '').trim();
    const key = (item.Key1 || '').trim();
    const value = item.Value1 != null ? String(item.Value1).trim() : '';
    if (!section) return;
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    if (key || value) sectionMap.get(section)!.push({ key, value1: value });
  });

  const first = list[0];
  const dateEl = doc.getElementById('panchang-date');
  const locEl = doc.getElementById('panchang-location');
  if (dateEl) {
    dateEl.textContent = new Date(this.panchangDate).toLocaleDateString('hi-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
  if (locEl) locEl.textContent = this.location || (first?.Location || '');

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

  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
}

// ── Called by "Preview" button ──
async previewPanchang() {
  const list = this.buildPreviewList();
  if (!list.length) {
    alert('Please fill in at least one value before previewing.');
    return;
  }

  this.isBuildingPreview = true;
  try {
    this.panchangHtmlString = await this.buildPanchangHtmlFromList(list);
    this.showPreviewModal = true;

    // wait a tick for the modal + iframe to exist in the DOM, then inject
    setTimeout(() => {
      if (this.previewFrame?.nativeElement) {
        this.previewFrame.nativeElement.srcdoc = this.panchangHtmlString;
      }
    }, 0);

  } catch (err) {
    console.error('Preview build failed:', err);
    alert('Could not build preview.');
  } finally {
    this.isBuildingPreview = false;
  }
}

closePreview() {
  this.showPreviewModal = false;
}

// ── Called by "Download" button inside the preview modal ──
async downloadPanchangPreviewAsImage() {
  if (!this.panchangHtmlString || this.isDownloadingPreview) return;
  this.isDownloadingPreview = true;
  try {
    await this.downloadPanchangAsImage(this.panchangHtmlString);
  } finally {
    this.isDownloadingPreview = false;
  }
}

// ── Same iframe-capture logic as the community page ──
private async downloadPanchangAsImage(htmlString: string) {
  try {
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
      logging: true,
      width: CAPTURE_WIDTH,
      height: actualHeight,
      windowWidth: CAPTURE_WIDTH,
      windowHeight: actualHeight,
    });

    document.body.removeChild(iframe);

    const dataUrl = canvas.toDataURL('image/png');
    await this.saveFile(dataUrl, 'panchang-preview.png', 'image/png');

  } catch (err) {
    console.error('downloadPanchangAsImage failed:', err);
    alert('Error creating image.');
  }
}

private async saveFile(dataUrl: string, fileName: string, mimeType: string) {
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
        await Share.share({ title: 'Panchang Preview', url: writeResult.uri, dialogTitle: 'Save or share Panchang' });
      }
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    }
  } catch (err) {
    console.error('saveFile failed:', err);
    alert('File could not be saved.');
  }
}

}
