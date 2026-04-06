import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
    standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OpenCommunityPageComponent  implements OnInit {
  userDetails: any;
  userLoggedIn: boolean = false;

  constructor(public routerCtrl: NavController,    private storage: Storage,) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    if(this.userDetails.LoginID){
      this.userLoggedIn  = true;
    }
  }

   goBack() {
    this.routerCtrl.back();
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }
}
