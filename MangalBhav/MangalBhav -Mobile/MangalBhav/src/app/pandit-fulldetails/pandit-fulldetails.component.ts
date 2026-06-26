import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, forkJoin, from, map, mergeMap, of, toArray } from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { FcmService } from 'src/providers/fcm/fcm';

@Component({
  selector: 'app-pandit-fulldetails',
  templateUrl: './pandit-fulldetails.component.html',
  styleUrls: ['./pandit-fulldetails.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditFulldetailsComponent implements OnInit {
  panditList: any;
  displayList: any[] = []; 
  searchQuery: string = '';

  constructor(public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api, private fcm: FcmService,
    private storage: Storage, private router: Router,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController) { }



  get filteredPanditList(): any[] {
    if (!this.searchQuery?.trim()) return this.panditList;
    const q = this.searchQuery.toLowerCase().trim();
    return this.panditList.filter((p:any) =>
      p.FullName?.toLowerCase().includes(q) ||
      p.LoginID?.toLowerCase().includes(q)
    );
  }


  searchPandits() {
    if (!this.searchQuery?.trim()) {
      this.displayList = this.panditList;   // empty query → show all
      return;
    }
    const q = this.searchQuery.toLowerCase().trim();
    this.displayList = this.panditList.filter((p:any) =>
      p.FullName?.toLowerCase().includes(q) ||
      p.LoginID?.toLowerCase().includes(q)
    );
  }

  // ← ADD THIS (clear button)
  clearSearch() {
    this.searchQuery = '';
    this.displayList = this.panditList;
  }

  ngOnInit() {

    this.apinu.postUrlData('GetPanditDetails', null)
      .subscribe((res: any) => {
        console.log(res)
        this.panditList = res;
        this.displayList = res; 
      })
  }

  async login(loginUsername: any) {
    await this.storage.clear();
    this.apinu.postUrlData(`VedantaLogin?UserName=${loginUsername}`, null)
      .subscribe(async (res: any) => {
        console.log(res)
        if (res) {
          //  this.fcm.initPush(res.UserID);
          if (res.Role == 'PANDIT') {
            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateForward('/tabs/tab1');
          } else {

            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateForward('/jajmandashboard');
          }
        }
      })
  }
}
