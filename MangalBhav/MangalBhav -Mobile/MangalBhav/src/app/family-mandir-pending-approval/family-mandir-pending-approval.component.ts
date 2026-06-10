import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { Storage } from '@ionic/storage-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-family-mandir-pending-approval',
  templateUrl: './family-mandir-pending-approval.component.html',
  styleUrls: ['./family-mandir-pending-approval.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FamilyMandirPendingApprovalComponent implements OnInit {

  pendingMandirs: any[] = [];
  isLoading = false;

  // Detail sheet
  selectedMandir: any = null;
  showDetailSheet = false;

  // Audio playback per slot
  currentAudio: HTMLAudioElement | null = null;
  playingSlot: string | null = null;
  chromeHidden: boolean = false;

  constructor(
    public api: Api,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController,
    public routerCtrl: NavController
  ) { }

  ngOnInit() { this.loadPendingMandirs(); }

  // ── Load all IsActive=0 family mandirs ─────────────────
  loadPendingMandirs() {
    this.isLoading = true;
    this.apinu.postUrlData(
      `FamilyMandirSelectByQuery?Query=IsActive=0`, null
    ).subscribe({
      next: (res: any) => {
        this.pendingMandirs = res.FamilyMandirList || [];
        this.isLoading = false;
        // Load photos for each
        this.pendingMandirs.forEach(m => {
          this.loadMandirPhoto(m, 'MandirPhoto1', 'Photo1Url');
          this.loadMandirPhoto(m, 'MandirPhoto2', 'Photo2Url');
          this.loadMandirPhoto(m, 'MandirPhoto3', 'Photo3Url');
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ── Load photo blob (same pattern as MandirInsertUpdate) ─
  loadMandirPhoto(mandir: any, field: string, urlField: string) {
    if (!mandir[field]) return;
    this.api.getImage('DownloadImages', {
      imageName: mandir[field],
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          mandir[urlField] = URL.createObjectURL(blob);
          this.pendingMandirs = [...this.pendingMandirs]; // trigger CD
        }
      },
      error: () => { }
    });
  }

  // ── Open detail sheet ──────────────────────────────────
  openDetail(m: any) {
    this.selectedMandir = m;
    this.showDetailSheet = true;

    this.hideChrome();
    this.stopAudio();
  }

  closeDetail() {
    this.showDetailSheet = false;
    this.selectedMandir = null;
    this.showChrome();
    this.stopAudio();
  }


  private hideChrome() {
    this.chromeHidden = true;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'none';
  }

  // ── REPLACE showChrome() ──────────────────────────────────
  private showChrome() {
    this.chromeHidden = false;
    const fab = document.querySelector('.custom-fab-wrap') as HTMLElement;
    if (fab) fab.style.display = 'flex';
  }

  // ── Audio playback for aarti slots ─────────────────────
  toggleAudio(filename: string, slot: string) {
    if (!filename) return;

    // Stop if same slot tapped again
    if (this.playingSlot === slot) {
      this.stopAudio();
      return;
    }

    this.stopAudio();
    this.playingSlot = slot; // show loading state immediately

    this.api.getAudio('DownloadAudio', {
      audioName: filename,
      audioPurpose: 'AartiAudio'   // ← matches the folder purpose you used on upload
    }).subscribe({
      next: (blob: any) => {
        const url = URL.createObjectURL(blob);
        this.currentAudio = new Audio(url);
        this.currentAudio.play().catch(() => {
          this.showToast('ऑडियो चला नहीं', 'warning');
          this.playingSlot = null;
        });
        this.currentAudio.onended = () => {
          this.playingSlot = null;
          URL.revokeObjectURL(url);  // free memory
        };
      },
      error: () => {
        this.showToast('ऑडियो लोड नहीं हुआ', 'danger');
        this.playingSlot = null;
      }
    });
  }
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio = null;
    }
    this.playingSlot = null;
  }

  // ── Approve ────────────────────────────────────────────
  approveMandir(m: any) {
    const payload = {
      ...m,
      IsActive: true,
      DateModified: new Date()
    };

    this.apinu.postUrlData('FamilyMandirUpdate', payload).subscribe({
      next: () => {
        this.showToast('✅ मंदिर अनुमोदित हो गया!', 'success');
        this.closeDetail();
        this.loadPendingMandirs();
      },
      error: () => { this.showToast('❌ कुछ गलत हुआ', 'danger'); }
    });
  }

  // ── Reject / Delete ────────────────────────────────────
  rejectMandir(m: any) {
    this.apinu.postUrlData('FamilyMandirDelete', { FamilyMandirID: m.FamilyMandirID }).subscribe({
      next: () => {
        this.showToast('🗑️ मंदिर अस्वीकृत किया गया', 'warning');
        this.closeDetail();
        this.loadPendingMandirs();
      },
      error: () => { this.showToast('❌ कुछ गलत हुआ', 'danger'); }
    });
  }

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}