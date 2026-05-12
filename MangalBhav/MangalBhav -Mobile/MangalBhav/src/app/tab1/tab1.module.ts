import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { QRCodeComponent } from 'angularx-qrcode';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabscommonheaderComponent,
    QRCodeComponent,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page],
  providers: [DatePipe] 
})
export class Tab1PageModule {}
