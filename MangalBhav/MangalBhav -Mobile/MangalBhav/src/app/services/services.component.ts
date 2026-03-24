import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ServicesComponent implements OnInit {

  userDetails: any;
  isEditMode = false;
  isModalOpen = false;

  services: any = {
    ServiceID: 0,
    TenantID: 0,
    Name: '',
    Description: '',
    DurationMinutes: 0,
    IsActive: false,
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };

  ServicesList: any[] = [];

  selectedFile: any = null;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");



    this.loadList();
  }

  // -----------------------------
  // Load List
  // -----------------------------
  loadList() {
    this.api.post(
      `ServicesNUSelectByQuery?Query= ServiceID > 0`,
      null
    ).subscribe((res: any) => {
      this.ServicesList = res?.ServicesList || [];
    });
  }

  // -----------------------------
  // Open Modal (Add Mode)
  // -----------------------------
  openModal() {
    this.isEditMode = false;

    this.services = {
      ServiceID: 0,
      TenantID: 0,
      Name: '',
      Description: '',
      DurationMinutes: 0,
      IsActive: false,
      DateAdded: null,
      DateModified: null,
      UpdatedByUser: '',
    };



    this.isModalOpen = true;
  }

  // -----------------------------
  // Close Modal
  // -----------------------------
  closeModal() {
    this.isModalOpen = false;
  }

  // -----------------------------
  // Edit Item
  // -----------------------------
  editItem(item: any) {
    this.isEditMode = true;

    this.services = {
      ...item,

    };

    this.isModalOpen = true;
  }

  // -----------------------------
  // File Selection
  // -----------------------------
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  // -----------------------------
  // Upload File (Optional)
  // -----------------------------
  uploadFile() {

    const refId = this.services?.ServiceID;
    const file = this.selectedFile;

    if (!file || !refId) return;

    this.api.uploadImage(
      [file],
      'ServicesFiles',
      refId.toString(),
      'Services'
    ).subscribe((res: any) => {

      if (res?.Status === 'Success') {
        this.selectedFile = null;



      }

    });
  }

  // -----------------------------
  // Prepare Payload
  // -----------------------------
  preparePayload() {
    return {
      tenantID: this.services.TenantID ? Number(this.services.TenantID) : 0,
      name: this.services.Name || '',
      description: this.services.Description || '',
      durationMinutes: this.services.DurationMinutes ? Number(this.services.DurationMinutes) : 0,
      isActive: Boolean(this.services.IsActive),
      dateAdded: this.services.DateAdded ? new Date(this.services.DateAdded).toISOString() : null,
      dateModified: this.services.DateModified ? new Date(this.services.DateModified).toISOString() : null,
      updatedByUser: this.services.UpdatedByUser || '',
    };
  }

  // -----------------------------
  // Save (Insert / Update)
  // -----------------------------
  save() {

    const payload = this.preparePayload();

    const DBAction = this.isEditMode
      ? 'ServicesUpdate'
      : 'ServicesInsert';

    this.api.post(DBAction, payload)
      .subscribe((res: any) => {

        if (res?.ServiceID > 0) {

          alert("Saved successfully ✅");

          this.closeModal();
          this.loadList();

        } else {
          alert("Something went wrong ❌");
        }

      });
  }
}