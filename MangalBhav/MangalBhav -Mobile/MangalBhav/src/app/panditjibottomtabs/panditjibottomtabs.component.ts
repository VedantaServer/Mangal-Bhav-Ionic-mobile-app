import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValueLookUpComponent } from 'src/components/value-look-up/value-look-up';
import { IndiaDateComponent } from 'src/components/india-date/india-date';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panditjibottomtabs',
  templateUrl: './panditjibottomtabs.component.html',
  styleUrls: ['./panditjibottomtabs.component.scss'],
   standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditjibottomtabsComponent  implements OnInit {
  userDetails: any;

  constructor(private alertCtrl: AlertController, private storage: Storage, public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider, public routerCtrl: NavController, private http: HttpClient){
   
  }


  async ngOnInit() {
       this.userDetails = await this.storage.get("account");
  }


    openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }
}
