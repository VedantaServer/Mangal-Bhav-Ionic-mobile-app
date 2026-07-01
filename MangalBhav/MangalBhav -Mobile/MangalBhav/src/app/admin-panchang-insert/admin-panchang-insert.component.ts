import { Component, OnInit } from '@angular/core';
import { Api, ApiNU } from 'src/providers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-admin-panchang-insert',
  templateUrl: './admin-panchang-insert.component.html',
  styleUrls: ['./admin-panchang-insert.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule
  ]
})
export class AdminPanchangInsertComponent implements OnInit {
  dailyPanchang: any = {
    DailyPanchangID: 0,
    SectionHeading: '',
    Key1: '',
    Value1: '',
    PanchangDate: '',
    Language: '',
    Location: '',
    DateAdded: ''
  };
  sectionHeadingList = [
    'सूर्य संबंधी जानकारी',
    'संवत्सर एवं काल',
    'पंचांग विवरण',
    'शुभ-अशुभ समय',
    'ग्रह स्थिति',
    'आज के पर्व एवं विशेष दिवस',
    'आज का धार्मिक महत्व',
    'आज का शुभ उपाय',
    'सुविचार'
  ];
  searchDate = new Date().toISOString();
  isEditMode = false;
  DailyPanchangList: any[] = [];

  constructor(
    public api: Api,
    public routerCtrl: NavController,
    public apinu: ApiNU,
    private storage: Storage,
    public toastController: ToastController) { }

  ngOnInit() {

  }


  formatSqlDate(date: any): string {

    const dt = new Date(date);
  
    return (
      dt.getFullYear() + '-' +
      ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
      ('0' + dt.getDate()).slice(-2) +
      ' 00:00:00.000'
    );
  
  }

  formatSqlDateOnly(date: any): string {

    const dt = new Date(date);
  
    return (
      dt.getFullYear() + '-' +
      ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
      ('0' + dt.getDate()).slice(-2)
    );
  
  }
  
  loadDailyPanchang() {
  
    const startDate = this.formatSqlDateOnly(this.searchDate);
  
    const endDt = new Date(this.searchDate);
    endDt.setDate(endDt.getDate() + 1);
    const endDate = this.formatSqlDateOnly(endDt);
  
    const query =
      `PanchangDate >= '${startDate} 00:00:00.000' AND PanchangDate < '${endDate} 00:00:00.000'`;
  
    this.apinu.postUrlData(
      `DailyPanchangSelectByQuery?Query=${encodeURIComponent(query)}`,
      null
    ).subscribe((res: any) => {
  
      this.DailyPanchangList =
        typeof res.DailyPanchangList === 'string'
          ? JSON.parse(res.DailyPanchangList)
          : res.DailyPanchangList;
  
    });
  
  }


  preparePayload() {

    return {
  
      DailyPanchangID: Number(this.dailyPanchang.DailyPanchangID || 0),
  
      SectionHeading: this.dailyPanchang.SectionHeading,
  
      Key1: this.dailyPanchang.Key1,
  
      Value1: this.dailyPanchang.Value1,
  
      // ISO format for ASP.NET Core model binding
      PanchangDate: new Date(this.dailyPanchang.PanchangDate).toISOString(),
  
      Language: this.dailyPanchang.Language,
  
      Location: this.dailyPanchang.Location,
  
      DateAdded: new Date().toISOString()
  
    };
  
  }


  saveDailyPanchang() {

    const payload = this.preparePayload();

    const action = this.isEditMode
      ? 'DailyPanchangUpdate'
      : 'DailyPanchangInsert';

    this.apinu.postUrlData(action, payload)
      .subscribe((res: any) => {

        if (res?.DailyPanchangID > 0) {

          alert("Saved Successfully");

          this.loadDailyPanchang();

        } else {

          alert("Something went wrong.");

        }

      });

  }


  editDailyPanchang(item: any) {

    this.isEditMode = true;

    this.dailyPanchang = {

      DailyPanchangID: item.DailyPanchangID,
      SectionHeading: item.SectionHeading,
      Key1: item.Key1,
      Value1: item.Value1,
      PanchangDate: item.PanchangDate,
      Language: item.Language,
      Location: item.Location,
      DateAdded: item.DateAdded

    };

  }


  addNew() {

    this.isEditMode = false;

    this.dailyPanchang = {

      DailyPanchangID: 0,
      SectionHeading: '',
      Key1: '',
      Value1: '',
      PanchangDate: new Date(),
      Language: '',
      Location: '',
      DateAdded: new Date()

    };

  }

}
