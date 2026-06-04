import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panditjibottomtabs',
  templateUrl: './panditjibottomtabs.component.html',
  styleUrls: ['./panditjibottomtabs.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditjibottomtabsComponent implements OnInit {
  userDetails: any;
  profilePhotoUrl: string = 'assets/user.png';  // ← add this

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
    private cdr: ChangeDetectorRef  // ← add this
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
          this.loadProfileImage(rawUrl);  // ← load as blob
        }
      }
    });
  }

  loadProfileImage(imageName: string) {
    this.api.getImage('DownloadImages', {
      imageName: imageName,
      imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          this.profilePhotoUrl = URL.createObjectURL(blob);
          this.cdr.detectChanges();
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