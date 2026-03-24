import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LogoutComponent } from './logout/logout.component';
import { AccordionModule } from 'smart-webcomponents-angular/accordion';
import { SplitterModule } from 'smart-webcomponents-angular/splitter';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { TableModule } from 'smart-webcomponents-angular/table';
import { CardModule } from 'smart-webcomponents-angular/card';
import { ButtonModule } from 'smart-webcomponents-angular/button';
import { CardViewModule } from 'smart-webcomponents-angular/cardview';
import { DropDownListModule } from 'smart-webcomponents-angular/dropdownlist';
import { InputModule } from 'smart-webcomponents-angular/input';
import { ValidatorModule } from 'smart-webcomponents-angular/validator';
import { SecureLoginComponent } from './secure-login/secure-login.component';
import { HelpComponent } from './help/help.component'; 
import { ImageUploadComponent } from './image-upload/image-upload.component'; 
import { DashboardComponent } from './dashboard/dashboard.component'
import { GridComponent, GridModule } from 'smart-webcomponents-angular/grid'; 
import { from } from 'rxjs'; 
import { ChartModule } from 'smart-webcomponents-angular/chart';
import { PasswordTextBoxModule } from 'smart-webcomponents-angular/passwordtextbox';
import { CheckBoxModule } from 'smart-webcomponents-angular/checkbox';
import { TooltipModule } from 'smart-webcomponents-angular/tooltip';
import { BusinessFunctionComponent } from './business-function/business-function.component';

import { ProgressBarModule } from 'smart-webcomponents-angular/progressbar';
import { ListBoxModule } from 'smart-webcomponents-angular/listbox';
import { DateTimePickerModule } from 'smart-webcomponents-angular/datetimepicker';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { DatePipe } from '@angular/common';
import { ButtonGroupModule } from 'smart-webcomponents-angular/buttongroup';
import { MenuModule } from 'smart-webcomponents-angular/menu';

import { ListMenuModule } from "smart-webcomponents-angular/listmenu";
import { ToastModule } from 'smart-webcomponents-angular/toast';
import { WindowComponent, WindowModule } from 'smart-webcomponents-angular/window';

import { BreadcrumbComponent } from './breadcrum/breadcrum.component';
import { CapsaiAuthGuardService } from './services/capsai-auth-guard.service';
import { SwitchButtonModule } from 'smart-webcomponents-angular/switchbutton'; 
import { ForeignKeyDropdownComponent } from './foreign-key-dropdown/foreign-key-dropdown.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { FusionChartsModule } from "angular-fusioncharts";
import * as FusionCharts from "fusioncharts";
import * as charts from "fusioncharts/fusioncharts.charts";
import * as FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import * as Ocean from 'fusioncharts/themes/fusioncharts.theme.ocean';
import * as Fint from 'fusioncharts/themes/fusioncharts.theme.fint';
import * as Candy from 'fusioncharts/themes/fusioncharts.theme.candy';
import * as Gammel from 'fusioncharts/themes/fusioncharts.theme.gammel';
import * as Zune from 'fusioncharts/themes/fusioncharts.theme.zune';
import * as Carbon from 'fusioncharts/themes/fusioncharts.theme.carbon';
import * as zoomline from "fusioncharts/fusioncharts.zoomline";
import * as PowerCharts from "fusioncharts/fusioncharts.powercharts";
import { GetMappedListDataComponent } from './get-mapped-list-data/get-mapped-list-data.component';
FusionChartsModule.fcRoot(FusionCharts, charts, FusionTheme, Ocean, Fint, Candy, Gammel, Zune, Carbon, zoomline, PowerCharts);
import { EditorModule } from 'smart-webcomponents-angular/editor';
import { ModalComponent } from './common/modal/modal.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';



@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    FetchDataComponent,
    SecureLoginComponent,
    LogoutComponent,
    HelpComponent, 
    ImageUploadComponent, 
    DashboardComponent,
    BusinessFunctionComponent,
   
   
    AccessDeniedComponent,
   
    BreadcrumbComponent,
    
    ForeignKeyDropdownComponent,
    
    GlobalSearchComponent,
    
    GetMappedListDataComponent,
    ModalComponent,
    ImportExportComponent,
    RegistrationFormComponent,
    

      ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }), 
    TooltipModule,
    NgxQRCodeModule,
    CheckBoxModule,
    PasswordTextBoxModule,
    HttpClientModule,
    TableModule,
    CardModule,
    DropDownListModule,
    CardViewModule,
    ButtonModule,
    FormsModule,
    InputModule,
    AccordionModule,
    SplitterModule,
    ChartModule,
    ValidatorModule,
    GridModule,
    ProgressBarModule,
    ListBoxModule,
    ButtonGroupModule,
    MenuModule,
    DateTimePickerModule,
    ToastModule,
    WindowModule,
    SwitchButtonModule,
    ListMenuModule,
    FusionChartsModule,
    NgSelectModule,
    NgxPaginationModule,
    EditorModule,
     BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    
    RouterModule.forRoot([
      { path: '', component: SecureLoginComponent, pathMatch: 'full', canActivate: [CapsaiAuthGuardService] },
      { path: 'home', component: HomeComponent, pathMatch: 'full' },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [CapsaiAuthGuardService] },
      { path: 'secure-login', component: SecureLoginComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'help', component: HelpComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [CapsaiAuthGuardService] },
      { path: 'businessfunction', component: BusinessFunctionComponent, canActivate: [CapsaiAuthGuardService] },
     
      
      { path: 'access-denied', component: AccessDeniedComponent, canActivate: [CapsaiAuthGuardService] },
      
     
      { path: 'globalsearch', component: GlobalSearchComponent, canActivate: [CapsaiAuthGuardService] },
        { path: 'registrationForm/:id', component: RegistrationFormComponent },
       
      
    ])
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
