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

@Component({
  selector: 'app-pandit-fulldetails',
  templateUrl: './pandit-fulldetails.component.html',
  styleUrls: ['./pandit-fulldetails.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditFulldetailsComponent  implements OnInit {
  panditList: any;

   constructor(public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage, private router: Router,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController) { }

  ngOnInit() {

    this.apinu.postUrlData('GetPanditDetails',null)
    .subscribe((res:any)=>{
      console.log(res)
      this.panditList = res ;
    })
  }

}
