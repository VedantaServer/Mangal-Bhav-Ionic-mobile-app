import { NgModule } from '@angular/core';
import { ValueLookUpComponent } from './value-look-up/value-look-up';
import { IndiaDateComponent } from './india-date/india-date';
//import { VedantaCalenderComponent } from './vedanta-calender/vedanta-calender';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NgCalendarModule  } from 'ionic2-calendar';
 

@NgModule({ 
    imports: [
        NgCalendarModule,
        CommonModule,
        IonicModule,
       // VedantaCalenderComponent,
        IndiaDateComponent,
        ValueLookUpComponent
    ],
    exports: [ValueLookUpComponent,
        IndiaDateComponent,
       // VedantaCalenderComponent,
    ]
})
export class ComponentsModule { }
