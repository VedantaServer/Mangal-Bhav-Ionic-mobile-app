import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-panditjibottomtabs',
  templateUrl: './panditjibottomtabs.component.html',
  styleUrls: ['./panditjibottomtabs.component.scss'],
   standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PanditjibottomtabsComponent  implements OnInit {

  constructor(public routerCtrl: NavController) { }

  ngOnInit() {}


    openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }
}
