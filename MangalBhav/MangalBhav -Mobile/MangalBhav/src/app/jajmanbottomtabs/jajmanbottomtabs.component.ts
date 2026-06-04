import { Component, OnInit } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-jajmanbottomtabs',
  templateUrl: './jajmanbottomtabs.component.html',
  styleUrls: ['./jajmanbottomtabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class JajmanbottomtabsComponent implements OnInit {
  userDetails: any;
  profilePhotoUrl: string = 'assets/user.png';

  constructor(
    private alertCtrl: AlertController,
    private storage: Storage,
    public apinu: ApiNU,
    public api: Api,
    private router: Router,
    public platform: Platform,
    private common: CommonProvider,
    public routerCtrl: NavController,
    private http: HttpClient,
    private cdr: ChangeDetectorRef   // ← inject this
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.userDetails = await this.storage.get("account");

    if (!this.userDetails?.UserID) return;

    this.apinu.postUrlData(
      `ProfilesNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      if (res.ProfileList && res.ProfileList.length > 0) {
        const rawUrl = res.ProfileList[0].ProfilePhotoUrl;
        
        if (rawUrl) {
          this.loadProfileImage(rawUrl);  // ← pass raw URL to blob loader
        }
      }
    });
  }

  // ✅ Same blob logic as your profile page
  loadProfileImage(imageName: string) {
    this.api.getImage('DownloadImages', {
      imageName: imageName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          this.profilePhotoUrl = URL.createObjectURL(blob);
          this.cdr.detectChanges();  // ← force tab bar to re-render
        }
      },
      error: (err) => {
        console.error('Error loading profile image:', err);
        this.profilePhotoUrl = 'assets/user.png';
      }
    });
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  async action4() {
    await localStorage.setItem('findPanditThroghtFloating', 'findPanditThroghtFloating');
    this.routerCtrl.navigateForward(`/find-pandit`);
  }
}