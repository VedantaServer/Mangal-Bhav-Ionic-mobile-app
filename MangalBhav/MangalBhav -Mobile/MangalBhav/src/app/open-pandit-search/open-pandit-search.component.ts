import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
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
    public apinu: ApiNU,
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
    this.apinu.postUrlData(`ServiceSelect?serviceID=${this.serviceid}&tenantId=1`, null)
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

  // loadPandits() {
  //   this.isLoading = true;

  //   this.apinu.postUrlData(`PanditServicesSelectAllByServiceID?serviceID=${this.serviceid}`, null)
  //     .subscribe((res: any) => {

  //       const profileIDs = res.PanditServiceList?.map((x: any) => x.ProfileID) || [];
  //       const uniqueProfileIDs = [...new Set(profileIDs)];

  //       if (uniqueProfileIDs.length === 0) {
  //         this.panditProfiles = [];
  //         this.isLoading = false;
  //         return;
  //       }

  //       const profileCalls = uniqueProfileIDs.map((id: any) =>
  //         this.apinu.postUrlData(`ProfilesSelectAllByUserID?userID=${id}`, null)
  //       );

  //       forkJoin(profileCalls).subscribe((profiles: any[]) => {

  //         let profileData: any[] = [];
  //         profiles.forEach((p: any) => {
  //           if (p?.ProfileList?.length > 0) {
  //             profileData.push(...p.ProfileList);
  //           }
  //         });

  //         this.panditProfiles = profileData;
  //         this.isLoading = false;

  //         this.panditProfiles.forEach(p => {
  //           if (p.UserID) this.loadProfileImage(p);
  //         });

  //       });
  //     });
  // }

  showNotifyModal = false;
  formSubmitted = false;

  notifyForm = {
    name: '',
    phone: ''
  };

  openNotifyModal() {
    this.showNotifyModal = true;
    this.formSubmitted = false;
    this.notifyForm = { name: '', phone: '' };
  }

  closeNotifyModal() {
    this.showNotifyModal = false;
  }

  submitNotifyForm() {
    this.formSubmitted = true;

    if (!this.notifyForm.name || !this.notifyForm.phone) return;

    // ✅ Call your API here
    this.yourApiCall(this.notifyForm.name, this.notifyForm.phone);

    this.closeNotifyModal();
  }

  yourApiCall(name: string, phone: string) {
    const now = new Date().toISOString();

    const body = {
      ContactID: -1,
      OrganizationID: "4022",
      Name: name,
      Phone: phone,
      Email: "",
      OrganizationName: "",
      WebSite: "",
      Address: "",
      City: "",
      State: "",
      ZipCode: "",
      Country: "",
      Source: "MangalBhav",
      IsContacted: true,
      LeadCount: "0",
      Probability: "0",
      IsLeadGeneratedBO: true,
      DateAdded: now,
      DateModified: now,
      UpdatedByUser: ""
    };

    this.http.post('https://capsai.vedantaerpserver.com/ContactInsert', body)
      .subscribe({
        next: (res) => {
          console.log('Contact submitted successfully:', res);
          // show success toast/message if needed
        },
        error: (err) => {
          console.error('Error submitting contact:', err);
          // handle error if needed
        }
      });
  }
  loadPandits() {
    this.isLoading = true;

    this.apinu.postUrlData(`PanditServicesSelectAllByServiceID?serviceID=${this.serviceid}`, null)
      .subscribe((res: any) => {

        const serviceList = res.PanditServiceList || [];

        const profileIDs = serviceList.map((x: any) => x.ProfileID);
        const uniqueProfileIDs = [...new Set(profileIDs)];

        if (uniqueProfileIDs.length === 0) {
          this.panditProfiles = [];
          this.isLoading = false;
          return;
        }

        const profileCalls = uniqueProfileIDs.map((id: any) =>
          this.apinu.postUrlData(`ProfilesSelectAllByUserID?userID=${id}`, null)
        );

        forkJoin(profileCalls).subscribe((profiles: any[]) => {

          let profileData: any[] = [];

          profiles.forEach((p: any) => {
            if (p?.ProfileList?.length > 0) {
              profileData.push(...p.ProfileList);
            }
          });

          // 🔥 Attach service price to profile
          this.panditProfiles = profileData.map(profile => {
            const matchedService = serviceList.find(
              (s: any) => s.ProfileID === profile.UserID
            );

            return {
              ...profile,
              ServicePrice: matchedService?.Price || 0
            };
          });

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