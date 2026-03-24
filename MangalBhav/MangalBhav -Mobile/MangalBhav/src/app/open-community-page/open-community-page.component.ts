import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
    standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class OpenCommunityPageComponent  implements OnInit {

  constructor(public routerCtrl: NavController) { }

  ngOnInit() {}

}
