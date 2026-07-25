import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from '../../providers';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-digital-card',
  templateUrl: './digital-card.component.html',
  styleUrls: ['./digital-card.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent,]
})
export class DigitalCardComponent implements OnInit {

  userDetails: any = null;
  profileImageUrl: string | null = null;
  panditServices: string[] = [];
  isLoading = true;
  targetUserId: any = null;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private storage: Storage,
    private api: Api,
    private apinu: ApiNU
  ) { }

  async ngOnInit() {
    // Priority: route param > query param > logged-in pandit
    this.targetUserId =
      this.route.snapshot.paramMap.get('userId') ||
      this.route.snapshot.queryParamMap.get('userId');

    if (this.targetUserId) {
      await this.loadPanditById(this.targetUserId);
    } else {
      await this.loadLoggedInPandit();
    }
  }

  private async loadLoggedInPandit() {
    const account = await this.storage.get('account');
    if (!account) {
      this.isLoading = false;
      return;
    }
    this.targetUserId = account.UserID;
    this.userDetails = account;
    this.loadProfilePhoto();
    this.isLoading = false;
  }

  isCardFlipped = false;

  toggleFlip() {
    this.isCardFlipped = !this.isCardFlipped;
  }

  private async loadPanditById(userId: any) {
    this.apinu.postUrlData(
      `ProfilesSelectAllByUserID?UserID=${userId}`,
      null
    ).subscribe({
      next: (res: any) => {
        const list = typeof res.ProfileList === 'string'
          ? JSON.parse(res.ProfileList)
          : (res.ProfileList || []);

        this.userDetails = list.length ? list[0] : null;
        if (this.userDetails) {
          this.loadProfilePhoto();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load pandit profile:', err);
        this.isLoading = false;
      }
    });
  }

  loadProfilePhoto() {
    const photoFileName = this.userDetails?.ProfilePhotoUrl;
    if (!photoFileName) return;

    this.api.getImage('DownloadImages', {
      imageName: photoFileName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0) {
          this.profileImageUrl = URL.createObjectURL(blob);
        }
      },
      error: (err) => console.error('getImage failed:', err)
    });
  }

  onImgError(event: any) {
    event.target.src = 'assets/default-pandit.png';
  }

  goBack() {
    this.navCtrl.back();
  }
}