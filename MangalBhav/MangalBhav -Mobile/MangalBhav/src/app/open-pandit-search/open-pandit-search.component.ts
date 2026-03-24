import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-open-pandit-search',
  templateUrl: './open-pandit-search.component.html',
  styleUrls: ['./open-pandit-search.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OpenPanditSearchComponent implements OnInit {

  categoryid: any;
  categoryName: string = '';
  panditProfiles: any[] = [];
  isLoading: boolean = true;
  profileImages: { [key: number]: string } = {};  // userID → image blob URL
  serviceid: any;
  serviceName: string = '';

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoryid = params['categoryid'];
      this.serviceid = params['serviceid'];
      this.loadServiceName();
      this.loadPandits();
    });
  }

  loadServiceName() {
    if (!this.serviceid) return;
    this.api.post(`ServiceSelect?serviceID=${this.serviceid}&tenantId=1`, null)
      .subscribe((res: any) => {
        const svc = res?.ServiceList?.[0];
        if (svc) {
          this.serviceName = svc.Name?.split('/')?.[0]?.trim() || svc.Name;
        }
      });
  }


  isPoojaModalOpen = false;
  isPanditModalOpen = false;
  selectedPandit: any = null;

  openPoojaModal() {
    this.isPoojaModalOpen = true;
  }

  openPanditModal(pandit: any) {
    this.selectedPandit = pandit;
    this.isPanditModalOpen = true;
  }

  loadPandits() {
    this.isLoading = true;

    this.api.post(`PanditServicesSelectAllByServiceID?serviceID=${this.serviceid}`, null)
      .subscribe((res: any) => {

        const profileIDs = res.PanditServiceList?.map((x: any) => x.ProfileID) || [];
        const uniqueProfileIDs = [...new Set(profileIDs)];

        if (uniqueProfileIDs.length === 0) {
          this.panditProfiles = [];
          this.isLoading = false;
          return;
        }

        const profileCalls = uniqueProfileIDs.map((id: any) =>
          this.api.post(`ProfilesSelectAllByUserID?userID=${id}`, null)
        );

        forkJoin(profileCalls).subscribe((profiles: any[]) => {

          let profileData: any[] = [];
          profiles.forEach((p: any) => {
            if (p?.ProfileList?.length > 0) {
              profileData.push(...p.ProfileList);
            }
          });

          this.panditProfiles = profileData;
          this.isLoading = false;

          this.panditProfiles.forEach(p => {
            if (p.UserID) this.loadProfileImage(p);
          });

        });
      });
  }


  loadProfileImage(pandit: any) {
    if (!pandit.ProfilePhotoUrl) return;

    const params = {
      imageName: pandit.ProfilePhotoUrl,
      imagePurpose: 'ProfilePhoto'
    };

    this.api.getImage('DownloadImages', params).subscribe({
      next: (blob: Blob) => {
        if (blob?.type?.startsWith('image/')) {
          this.profileImages[pandit.UserID] = URL.createObjectURL(blob);
        }
      },
      error: () => {
        // fallback to default — already handled in getProfileImage()
      }
    });
  }
  getProfileImage(userID: number): string {
    return this.profileImages[userID] || 'assets/default.jfif';
  }

  // Book Now — store panditUserID, go to login
  async bookNow(pandit: any) {
    await this.storage.set('pendingPanditUserID', pandit.UserID.toString());
    await this.storage.set('pendingPanditCategoryID', this.categoryid || '');
    await this.storage.set('pendingServiceID', this.serviceid || '');
    this.router.navigate(['/login']);
  }

  goBack() {
    this.routerCtrl.back();
  }

   openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }
}