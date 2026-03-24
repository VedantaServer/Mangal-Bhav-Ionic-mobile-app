import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ButtonComponent } from 'smart-webcomponents-angular/button'; 
import { CardComponent } from 'smart-webcomponents-angular/card';
import { CardViewComponent, Smart } from 'smart-webcomponents-angular/cardview';
import { ChartComponent } from 'smart-webcomponents-angular/chart';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { Api } from '../services/api';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('cardview', { read: CardViewComponent, static: false }) cardview: CardViewComponent;
  @ViewChild('card', { read: CardComponent, static: false }) card: CardComponent;
  @ViewChild('chart', { read: ChartComponent, static: false }) chart!: ChartComponent;

  Searched = false;
  chartsData?= [];
  caption = ' ';
  description = ' ';
  showLegend = true;
  padding = { left: 5, top: 5, right: 5, bottom: 5 };
  titlePadding = { left: 90, top: 0, right: 0, bottom: 10 };


  xAxis = {
    dataField: 'Type',
    gridLines: {
      visible: true
    }
  };
  colorScheme = 'scheme32';
 

  seriesGroups = [
    {
      type: 'column',
      columnsGapPercent: 50,
      seriesGapPercent: 0,
      valueAxis: {
        description: '',
        axisSize: 'auto'
      },
      series: [
        { dataField: 'Count', displayText: 'Count of Record' } 
      ]
    }
  ];



  ExecutingMessageOrg = "";
  ExecutingMessageEvent = "";
  ExecutingMessageJobPosting = "";
  ExecutingMessageVendorOrg = "";
  ExecutingMessageVendorproduct = "";
  running = false;
  Fk_UserLoginID: any;
  eduOrganisationID: any;
  name: string = '';
  search: string = '';
  currentUser: User;
  placeholder = 'try search schools, colleges, jobs, events &  services...';

  username: string = '';
  orgData = [];
  eventData: any[];
  JobPostingData: any[];
  VendorOrgData: any[];
  VendorProductData: any[];
  constructor(private router: Router, private api: Api,
    private authenticationService: AuthService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.eduOrganisationID = this.eduOrganisationID
  }

  /*name: string = '';*/
  logoImage: '';
  city: string = '';
  state: string = '';
  area: string = '';
  country: string = '';

  ngOnInit(): void { 
    //console.log(this.currentUser);
    if ((this.currentUser) && (this.currentUser.userID))
      this.placeholder = 'Dear ' + this.currentUser.username + ' , ' + this.placeholder;
     }

  ngAfterViewInit(): void {
   // afterViewInit code.
    this.init(); 
  }


  init(): void {
    // init code.
    /* this.Fk_UserLoginID = this.currentUser.userInfoID;*/
    this.eduOrganisationID = this.eduOrganisationID
  }

   

   
   
}
