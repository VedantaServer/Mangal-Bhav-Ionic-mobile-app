import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ApiNU } from '../../providers';

@Component({
  selector: 'app-pandit-chat-report',
  templateUrl: './pandit-chat-report.component.html',
  styleUrls: ['./pandit-chat-report.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditChatReportComponent implements OnInit {

  activeTab: 'daily' | 'unanswered' = 'daily';

  // ── Step 1: Pandit list (recent-active by default, or search) ──
  panditSearchText: string = '';
  panditList: any[] = [];
  selectedPandit: any = null;
  loadingPandits = false;

  // ── Step 2: Yajman list for selected pandit — ALL yajman ever, paginated ──
  yajmanList: any[] = [];
  yajmanPage = 1;
  yajmanPageSize = 20;
  yajmanTotalCount = 0;
  yajmanHasMore = true;
  loadingYajman = false;

  // ── Step 3: Full transcript with selected yajman — paginated, newest page first ──
  selectedBhakt: any = null;
  transcript: any[] = [];
  transcriptPage = 1;
  transcriptPageSize = 50;
  transcriptTotalCount = 0;
  transcriptHasMore = true;
  loadingTranscript = false;

  // ── Unanswered report — all-time by default, paginated ──
  unansweredList: any[] = [];
  unansweredPage = 1;
  unansweredPageSize = 20;
  unansweredTotalCount = 0;
  unansweredHasMore = true;
  loadingUnanswered = false;

  constructor(private apinu: ApiNU, public routerCtrl: NavController) { }

  ngOnInit() {
    this.searchPandits(); // no search text -> SP returns last-7-days active pandits
  }

  switchTab(tab: 'daily' | 'unanswered') {
    this.activeTab = tab;
    if (tab === 'unanswered' && this.unansweredList.length === 0) {
      this.loadUnansweredReport();
    }
  }

  // ── Step 1 ──

  searchPandits() {
    this.loadingPandits = true;
    this.apinu.postUrlData(`ChatPanditListSelect?SearchText=${this.panditSearchText || ''}`, null)
      .subscribe({
        next: (res: any) => {
          this.panditList = (typeof res === 'string' ? JSON.parse(res) : res) || [];
          this.loadingPandits = false;
        },
        error: () => {
          this.panditList = [];
          this.loadingPandits = false;
        }
      });
  }

  selectPandit(pandit: any) {
    this.selectedPandit = pandit;
    this.selectedBhakt = null;
    this.transcript = [];
    this.resetYajmanList();
  }

  backToPanditList() {
    this.selectedPandit = null;
    this.selectedBhakt = null;
    this.transcript = [];
    this.yajmanList = [];
  }

  // ── Step 2: Yajman list, paginated by count (not by date) ──

  resetYajmanList() {
    this.yajmanList = [];
    this.yajmanPage = 1;
    this.yajmanTotalCount = 0;
    this.yajmanHasMore = true;
    this.loadNextYajmanPage();
  }

  loadNextYajmanPage(event?: any) {
    if (!this.selectedPandit || !this.yajmanHasMore) {
      event?.target?.complete();
      return;
    }
    if (!event) this.loadingYajman = true;

    this.apinu.postUrlData(
      `PanditYajmanListSelect?PanditUserID=${this.selectedPandit.UserID}&PageNumber=${this.yajmanPage}&PageSize=${this.yajmanPageSize}`,
      null
    ).subscribe({
      next: (res: any) => {
        const page = (typeof res === 'string' ? JSON.parse(res) : res) || [];
        this.yajmanList = [...this.yajmanList, ...page];
        this.yajmanTotalCount = page[0]?.TotalYajmanCount ?? this.yajmanTotalCount;
        this.yajmanPage++;
        this.yajmanHasMore = this.yajmanList.length < this.yajmanTotalCount;

        this.loadingYajman = false;
        event?.target?.complete();

        if (!event) {
          setTimeout(() => this.fillScreenIfNeeded(
            () => this.yajmanHasMore,
            () => this.loadNextYajmanPage()
          ), 50);
        }
      },
      error: () => {
        this.loadingYajman = false;
        event?.target?.complete();
      }
    });
  }

  // ── Step 3: Full transcript with a yajman, loads OLDER messages on scroll-up ──

  openTranscript(bhakt: any) {
    this.selectedBhakt = bhakt;
    this.transcript = [];
    this.transcriptPage = 1;
    this.transcriptTotalCount = 0;
    this.transcriptHasMore = true;
    this.loadTranscriptPage();
  }

  loadTranscriptPage(event?: any) {
    if (!this.selectedPandit || !this.selectedBhakt || !this.transcriptHasMore) {
      event?.target?.complete();
      return;
    }
    if (!event) this.loadingTranscript = true;

    this.apinu.postUrlData(
      `PanditBhaktFullTranscriptSelect?PanditUserID=${this.selectedPandit.UserID}&BhaktUserID=${this.selectedBhakt.BhaktUserID}&PageNumber=${this.transcriptPage}&PageSize=${this.transcriptPageSize}`,
      null
    ).subscribe({
      next: (res: any) => {
        const page = (typeof res === 'string' ? JSON.parse(res) : res) || [];
        this.transcriptTotalCount = page[0]?.TotalMessageCount ?? this.transcriptTotalCount;

        // page comes back newest-first; reverse to oldest-first, then PREPEND (older messages go on top)
        const ordered = [...page].reverse();
        this.transcript = [...ordered, ...this.transcript];

        this.transcriptPage++;
        this.transcriptHasMore = (this.transcriptPage - 1) * this.transcriptPageSize < this.transcriptTotalCount;

        this.loadingTranscript = false;
        event?.target?.complete();
      },
      error: () => {
        this.loadingTranscript = false;
        event?.target?.complete();
      }
    });
  }

  closeTranscript() {
    this.selectedBhakt = null;
    this.transcript = [];
  }

  // ── Unanswered report: all-time by default, paginated ──

  loadUnansweredReport(event?: any) {
    if (!this.unansweredHasMore) {
      event?.target?.complete();
      return;
    }
    if (!event) this.loadingUnanswered = true;

    // FromDate/ToDate left blank -> SP treats as NULL -> all-time
    this.apinu.postUrlData(
      `UnansweredBhaktMessagesReportSelect?PageNumber=${this.unansweredPage}&PageSize=${this.unansweredPageSize}`,
      null
    ).subscribe({
      next: (res: any) => {
        const page = (typeof res === 'string' ? JSON.parse(res) : res) || [];
        this.unansweredList = [...this.unansweredList, ...page];
        this.unansweredTotalCount = page[0]?.TotalUnansweredCount ?? this.unansweredTotalCount;
        this.unansweredPage++;
        this.unansweredHasMore = this.unansweredList.length < this.unansweredTotalCount;

        this.loadingUnanswered = false;
        event?.target?.complete();

        if (!event) {
          setTimeout(() => this.fillScreenIfNeeded(
            () => this.unansweredHasMore,
            () => this.loadUnansweredReport()
          ), 50);
        }
      },
      error: () => {
        this.loadingUnanswered = false;
        event?.target?.complete();
      }
    });
  }

  // ── Shared helper: Ionic's infinite scroll never fires if content doesn't
  // fill the viewport (e.g. only 1-2 rows on first load). This tops it up. ──
  private fillScreenIfNeeded(hasMoreFn: () => boolean, loadMoreFn: () => void) {
    const content = document.querySelector('ion-content');
    if (!content) return;
    (content as any).getScrollElement().then((el: HTMLElement) => {
      if (el.scrollHeight <= el.clientHeight && hasMoreFn()) {
        loadMoreFn();
      }
    });
  }

  isMine(role: string): boolean {
    return role === 'PANDIT';
  }
}