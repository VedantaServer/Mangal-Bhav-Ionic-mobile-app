import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../services/api';
import { GlobalSelectedOrg, OrganizationService } from '../services/organization.service';

@Component({
  selector: 'app-get-mapped-list-data',
  templateUrl: './get-mapped-list-data.component.html',
  styleUrls: ['./get-mapped-list-data.component.css']
})
export class GetMappedListDataComponent implements OnInit {

  globalOrg: GlobalSelectedOrg;
  testDataArray: any = [];

  constructor(private api: Api, private router: Router, private OrgService: OrganizationService) {
    this.OrgService.currentOrg.subscribe(item => this.globalOrg = item);
  }

  ngOnInit() {
    this.MappedListData();
  }

  
  MappedListData() {
    let path = this.router.url.split('/')
    this.api.postUrlData("GetMappedListData?OrganizationID=" + this.globalOrg.organizationID + "&EmployeeID=" + localStorage.getItem('EmployeeID') + "&EntityType=" + path[1], null)
      .subscribe(
        (data: any) => {
          let testData = data.MappedListDataList;
          this.testDataArray = testData;
        },
        (error) => {
          console.error('Error fetching data', error);
        }
      );
  }

}
