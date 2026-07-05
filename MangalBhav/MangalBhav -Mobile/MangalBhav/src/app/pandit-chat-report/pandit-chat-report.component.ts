import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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

  // ── Step 1: Pandit search ──
  panditSearchText: string = '';
  panditList: any[] = [];
  selectedPandit: any = null;
  loadingPandits = false;

  // ── Step 2: Day conversations ──
  chatDate: string = new Date().toISOString().slice(0, 10);
  conversations: any[] = [];
  loadingConversations = false;

  // ── Step 3: Transcript drill-down ──
  selectedBhakt: any = null;
  transcript: any[] = [];
  loadingTranscript = false;

  // ── Unanswered report (separate tab) ──
  unansweredFromDate: string = '';
  unansweredToDate: string = '';
  unansweredList: any[] = [];
  loadingUnanswered = false;

  constructor(private apinu: ApiNU) { }

  ngOnInit() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    this.unansweredToDate = today.toISOString().slice(0, 10);
    this.unansweredFromDate = weekAgo.toISOString().slice(0, 10);

    this.searchPandits();
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
    this.loadConversations();
  }

  backToPanditList() {
    this.selectedPandit = null;
    this.conversations = [];
    this.selectedBhakt = null;
    this.transcript = [];
  }

  // ── Step 2 ──
  loadConversations() {
    if (!this.selectedPandit) return;
    this.loadingConversations = true;
    this.conversations = [];
    this.apinu.postUrlData(
      `PanditDailyConversationsSelect?PanditUserID=${this.selectedPandit.UserID}&ChatDate=${this.chatDate}`,
      null
    ).subscribe({
      next: (res: any) => {
        this.conversations = res || [];
        this.loadingConversations = false;
      },
      error: () => {
        this.conversations = [];
        this.loadingConversations = false;
      }
    });
  }

  // ── Step 3 ──
  openTranscript(bhakt: any) {
    this.selectedBhakt = bhakt;
    this.loadingTranscript = true;
    this.transcript = [];
    this.apinu.postUrlData(
      `PanditBhaktDayTranscriptSelect?PanditUserID=${this.selectedPandit.UserID}&BhaktUserID=${bhakt.BhaktUserID}&ChatDate=${this.chatDate}`,
      null
    ).subscribe({
      next: (res: any) => {
        this.transcript = (typeof res === 'string' ? JSON.parse(res) : res) || [];
        this.loadingTranscript = false;
      },
      error: () => {
        this.transcript = [];
        this.loadingTranscript = false;
      }
    });
  }

  closeTranscript() {
    this.selectedBhakt = null;
    this.transcript = [];
  }

  // ── Unanswered report ──
  loadUnansweredReport() {
    this.loadingUnanswered = true;
    let query = `DateFrom=${this.unansweredFromDate}&DateTo=${this.unansweredToDate}`;
    if (this.selectedPandit) {
      query += `&PanditUserID=${this.selectedPandit.UserID}`;
    }
    this.apinu.postUrlData(`UnansweredBhaktMessagesReportSelect?${query}`, null)
      .subscribe({
        next: (res: any) => {
          this.unansweredList = (typeof res === 'string' ? JSON.parse(res) : res) || [];
          this.loadingUnanswered = false;
        },
        error: () => {
          this.unansweredList = [];
          this.loadingUnanswered = false;
        }
      });
  }
  isMine(role: string): boolean {
    return role === 'PANDIT';
  }
}