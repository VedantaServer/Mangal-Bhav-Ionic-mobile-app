import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { CommonProvider } from 'src/providers/common/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValueLookUpComponent } from 'src/components/value-look-up/value-look-up';
import { IndiaDateComponent } from 'src/components/india-date/india-date';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-service-insert-update',
  templateUrl: './admin-service-insert-update.component.html',
  styleUrls: ['./admin-service-insert-update.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminServiceInsertUpdateComponent implements OnInit {

  selectedTab = 'CATEGORY';

  poojaCategoryList: any[] = [];
  poojaServiceList: any[] = [];
  mappingList: any[] = [];

  // ==========================
  // CATEGORY
  // ==========================

  Category: any = {
    CategoryID: -1,
    CategoryName: '',
    CategoryName_HI: '',
    Description: '',
    Description_HI: '',
    MinAge: null,
    MaxAge: null,
    AgeText: '',
    Gender: '',
    RitualType: '',
    IsLifeEvent: false,
    IsFestivalRelated: false,
    TenantID: 1,
    IsActive: true,
    DateAdded: new Date(),
    DateModified: new Date(),
    UpdatedByUser: 'Admin'
  };

  // ==========================
  // SERVICE
  // ==========================

  Service: any = {
    ServiceID: -1,
    TenantID: 1,
    Name: '',
    Description: '',
    DurationMinutes: 60,
    IsActive: true,
    DateAdded: new Date(),
    DateModified: new Date(),
    UpdatedByUser: '1'   // repurposed: sort order, kept as string
  };

  // ==========================
  // MAPPING
  // ==========================

  Mapping: any = {
    MappingID: -1,
    ServiceID: null,
    CategoryID: null,
    TenantID: 1,
    IsActive: true,
    DateAdded: new Date(),
    DateModified: new Date()
  };

  constructor(private alertCtrl: AlertController, private storage: Storage, public apinu: ApiNU,
    public api: Api, private router: Router,
    public platform: Platform, private common: CommonProvider, public routerCtrl: NavController, private http: HttpClient) { }


  ngOnInit() {

    this.loadCategories();
    //  this.loadServices();
    // this.loadMappings();

  }

  // ==================================
  // LOAD DATA
  // ==================================


  goBack() {
    this.routerCtrl.back();
  }

  loadServices() {

    this.apinu.postUrlData(
      'ServicesNUSelectByQuery?Query=1=1',
      null
    ).subscribe((res: any) => {

      this.poojaServiceList =
        res.ServiceList || [];
      this.loadMappings();
    });

  }





  loadMappings() {

    this.apinu.postUrlData(
      'ServiceCategoryMappingSelectByQuery?Query=1=1',
      null
    ).subscribe((res: any) => {

      this.mappingList =
        res.ServiceCategoryMappingList || [];

      this.mappingList.forEach((m: any) => {

        const category = this.poojaCategoryList.find(
          x => x.CategoryID == m.CategoryID
        );

        const service = this.poojaServiceList.find(
          x => x.ServiceID == m.ServiceID
        );

        m.CategoryName =
          category?.CategoryName || '';

        m.ServiceName =
          service?.Name || '';

      });

    });

  }

  // ==================================
  // CATEGORY
  // ==================================
  saveCategory() {

    if (!this.Category.CategoryName) {
      alert('Please enter category name');
      return;
    }

    this.Category.DateModified = new Date();

    const apiName =
      this.Category.CategoryID > 0
        ? 'ServiceCategoryUpdate'
        : 'ServiceCategoryInsert';

    this.apinu.postUrlData(
      apiName,
      this.Category
    ).subscribe((res: any) => {

      alert(
        this.Category.CategoryID > 0
          ? 'Category Updated'
          : 'Category Added'
      );

      this.resetCategory();

      this.loadCategories();

    });

  }


  editCategory(item: any) {

    this.selectedTab = 'CATEGORY';

    this.Category = {
      ...item
    };

  }

  resetCategory() {

    this.Category = {
      CategoryID: -1,
      CategoryName: '',
      CategoryName_HI: '',
      Description: '',
      Description_HI: '',
      MinAge: null,
      MaxAge: null,
      AgeText: '',
      Gender: '',
      RitualType: '',
      IsLifeEvent: false,
      IsFestivalRelated: false,
      TenantID: 1,
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: 'Admin'
    };

  }

  // ==================================
  // SERVICE
  // ==================================

  // saveService() {

  //   if (!this.Service.Name) {
  //     alert('Please enter service name');
  //     return;
  //   }

  //   this.Service.DateModified = new Date();

  //   const apiName =
  //     this.Service.ServiceID > 0
  //       ? 'ServicesUpdate'
  //       : 'ServicesInsert';

  //   this.apinu.postUrlData(
  //     apiName,
  //     this.Service
  //   ).subscribe((res: any) => {

  //     alert(
  //       this.Service.ServiceID > 0
  //         ? 'Service Updated'
  //         : 'Service Added'
  //     );

  //     this.resetService();

  //     this.loadServices();

  //   });

  // }


  saveService() {

    if (!this.Service.Name) {
      alert('Please enter service name');
      return;
    }
  
    this.Service.DateModified = new Date();
  
    // UpdatedByUser is used as order — ensure it's always sent as a string
    this.Service.UpdatedByUser = String(this.Service.UpdatedByUser ?? '1').trim();
  
    const apiName =
      this.Service.ServiceID > 0
        ? 'ServicesUpdate'
        : 'ServicesInsert';
  
    this.apinu.postUrlData(
      apiName,
      this.Service
    ).subscribe((res: any) => {
  
      alert(
        this.Service.ServiceID > 0
          ? 'Service Updated'
          : 'Service Added'
      );
  
      this.resetService();
  
      this.loadServices();
  
    });
  
  }

  editService(item: any) {

    this.selectedTab = 'SERVICE';
  
    this.Service = {
      ...item,
      UpdatedByUser: item.UpdatedByUser || '1' // load existing order, fallback if missing
    };
  
  }
  // editService(item: any) {

  //   console.log('SERVICE CLICKED');
  //   console.log(item);

  //   this.selectedTab = 'SERVICE';

  //   this.Service = {
  //     ...item
  //   };

  // }
  // resetService() {

  //   this.Service = {
  //     ServiceID: -1,
  //     TenantID: 1,
  //     Name: '',
  //     Description: '',
  //     DurationMinutes: 60,
  //     IsActive: true,
  //     DateAdded: new Date(),
  //     DateModified: new Date(),
  //     UpdatedByUser: 'Admin'
  //   };

  // }

  resetService() {

    this.Service = {
      ServiceID: -1,
      TenantID: 1,
      Name: '',
      Description: '',
      DurationMinutes: 60,
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: '1'
    };
  
  }

  // ==================================
  // MAPPING
  // ==================================

  saveMapping() {

    if (!this.Mapping.CategoryID) {
      alert('Select category');
      return;
    }

    if (!this.Mapping.ServiceID) {
      alert('Select service');
      return;
    }

    this.Mapping.DateModified = new Date();

    const apiName =
      this.Mapping.MappingID > 0
        ? 'ServiceCategoryMappingUpdate'
        : 'ServiceCategoryMappingInsert';

    this.apinu.postUrlData(
      apiName,
      this.Mapping
    ).subscribe((res: any) => {

      alert(
        this.Mapping.MappingID > 0
          ? 'Mapping Updated'
          : 'Mapping Added'
      );

      this.resetMapping();

      this.loadMappings();

    });

  }


  editMapping(item: any) {

    console.log(item);

    this.selectedTab = 'MAPPING';

    this.Mapping.MappingID = item.MappingID;
    this.Mapping.CategoryID = item.CategoryID;
    this.Mapping.ServiceID = item.ServiceID;
    this.Mapping.TenantID = item.TenantID;
    this.Mapping.IsActive = item.IsActive;

  }



  resetMapping() {

    this.Mapping = {
      MappingID: -1,
      ServiceID: null,
      CategoryID: null,
      TenantID: 1,
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date()
    };

  }

  loadCategories() {

    this.apinu.postUrlData(
      'ServiceCategorySelectByQuery?Query=1=1',
      null
    ).subscribe((res: any) => {

      this.poojaCategoryList =
        res.ServiceCategoryList || [];

      this.loadServices();

    });

  }


  // admin-service-insert-update.component.ts

  uploadingServiceImageID: number | null = null;
  selectedUploadService: any = null;

  getCleanServiceName(name: string): string {
    return (name || '').split('/')[0].trim().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  }

  triggerServiceImageUpload(item: any, fileInput: HTMLInputElement) {
    this.selectedUploadService = item;
    fileInput.click();
  }

  onServiceImageFileSelected(event: any, item: any) {
    const file: File = event.target.files[0];
    event.target.value = ''; // reset so selecting the same file again still fires change
    if (!file) return;

    if (!item.Name?.trim()) {
      alert('This service has no name — cannot derive a filename.');
      return;
    }

    const cleanName = this.getCleanServiceName(item.Name);
    this.uploadingServiceImageID = item.ServiceID;

    this.api.uploadImage(
      [file],
      'PoojaPhoto',   // entityType
      cleanName,      // entityID → becomes the saved filename, e.g. "AntimSanskar.png"
      'PoojaPhoto'    // filePurpose
    ).subscribe({
      next: (res: any) => {
        this.uploadingServiceImageID = null;
        if (res?.Status === 'Success') {
          alert(`Photo saved as ${res.FileName} ✅`);
        } else {
          alert('Upload failed ❌');
        }
      },
      error: () => {
        this.uploadingServiceImageID = null;
        alert('Upload error ❌');
      }
    });
  }

  deleteService(item: any) {

    if (!confirm(`Delete "${item.Name}"?`)) {
      return;
    }
  
    this.apinu.postUrlData(
      `ServicesDelete?serviceID=${item.ServiceID}&tenantID=${item.TenantID}`,
      null
    ).subscribe(() => {
  
      alert('Service deleted successfully.');
  
      this.loadServices();
  
    });
  
  }

  deleteCategory(item: any) {

    if (!confirm(`Delete "${item.CategoryName}"?`)) {
      return;
    }
  
    this.apinu.postUrlData(
      `ServiceCategoryDelete?categoryID=${item.CategoryID}&tenantID=${item.TenantID}`,
      null
    ).subscribe(() => {
  
      alert('Category deleted successfully.');
  
      this.loadCategories();
  
    });
  
  }


  deleteMapping(item: any) {

    if (!confirm('Delete this mapping?')) {
      return;
    }
  
    this.apinu.postUrlData(
      `ServiceCategoryMappingDelete?mappingID=${item.MappingID}&tenantID=${item.TenantID}`,
      null
    ).subscribe(() => {
  
      alert('Mapping deleted successfully.');
  
      this.loadMappings();
  
    });
  
  }
  

}