import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api, ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';


@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,PanditjibottomtabsComponent]
})
export class LocationsComponent implements OnInit {

  userDetails: any;
  isEditMode = false;
  isModalOpen = false;


  locations: any = {
    LocationID: 0,
    TenantID: 0,
    UserID: 0,
    Name: '',
    ContactPerson: '',
    ContactPhone: '',
    ContactEmail: '',
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    Pincode: '',
    State: '',
    Country: '',
    Latitude: 0,
    Longitude: 0,
    IsActive: false,
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };
  isPincodeLoading = false;
  selectedFile: any = null;
  LocationList: any;
  postOfficeList: any;

  constructor(
    public routerCtrl: NavController,
    public apinu: ApiNU,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");

    this.locations.TenantID = this.userDetails.TenantID;
    this.locations.UserID = this.userDetails.UserID;

    this.apinu.postUrlData(
      `LocationsNUSelectByQuery?Query= UserID = ${this.userDetails.UserID}`,
      null
    ).subscribe((res: any) => {
      console.log(res)
      this.LocationList = res.LocationList;
    });
  }


  openModal() {
    this.isEditMode = false;

    this.locations = {
      LocationID: 0,
      TenantID: this.userDetails.TenantID,
      UserID: this.userDetails.UserID,
      Name: '',
      ContactPerson: '',
      ContactPhone: '',
      ContactEmail: '',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      Pincode: '',
      State: '',
      Country: '',
      Latitude: 0,
      Longitude: 0,
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: ''
    };

    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  editLocation(location: any) {
    this.isEditMode = true;

    console.log(location)
    this.locations = {
      ...location,
      TenantID: this.userDetails.TenantID,
      UserID: this.userDetails.UserID
    };

    this.isModalOpen = true;
  }

  fetchLocationByPincode() {

    const pin = this.locations.Pincode;

    if (!pin || pin.length !== 6) {
      return;
    }


    this.isPincodeLoading = true;
    this.http.get(`https://api.postalpincode.in/pincode/${pin}`)
      .subscribe((data: any) => {

        this.isPincodeLoading = false;

        if (data[0].Status === "Success") {
          const postOffices = data[0].PostOffice;

          this.locations.State = postOffices[0].State;
          this.locations.City = postOffices[0].District;
        }

      }, () => {
        this.isPincodeLoading = false;
      });
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  uploadFile() {
    const refId = this.locations.UserID;
    const file = this.selectedFile;
    if (!file || !refId) return;

    this.api.uploadImage(
      [file],
      'LocationsFiles',
      refId.toString(),
      'Locations'
    ).subscribe((res: any) => {
      if (res.Status === 'Success') {
        this.selectedFile = null;
        this.locations = res.FileName;
      }
    });
  }

  preparePayload() {
    return {
      locationID: this.locations.LocationID ? Number(this.locations.LocationID) : 0,
      tenantID: this.locations.TenantID ? Number(this.locations.TenantID) : 0,
      userID: this.locations.UserID ? Number(this.locations.UserID) : 0,
      name: this.locations.Name || '',
      contactPerson: this.locations.ContactPerson || '',
      contactPhone: this.locations.ContactPhone || '',
      contactEmail: this.locations.ContactEmail || '',
      addressLine1: this.locations.AddressLine1 || '',
      addressLine2: this.locations.AddressLine2 || '',
      city: this.locations.City || '',
      pincode: this.locations.Pincode || '',
      state: this.locations.State || '',
      country: this.locations.Country || '',
      latitude: this.locations.Latitude ? Number(this.locations.Latitude) : 0,
      longitude: this.locations.Longitude ? Number(this.locations.Longitude) : 0,
      isActive: Boolean(this.locations.IsActive),
      dateAdded: this.locations.DateAdded ? new Date(this.locations.DateAdded).toISOString() : null,
      dateModified: this.locations.DateModified ? new Date(this.locations.DateModified).toISOString() : null,
      updatedByUser: this.locations.UpdatedByUser || '',
    };
  }

  save() {
    const payload = this.preparePayload();
    const DBAction = this.isEditMode
      ? 'LocationsUpdate'
      : 'LocationsInsert';

    this.apinu.postUrlData(DBAction, payload)
      .subscribe((res: any) => {

        if (res.LocationID > 0) {

          alert("Saved successfully ✅");

          this.closeModal();
          this.ngOnInit(); // refresh list

        } else {
          alert("Something went wrong ❌");
        }

      });
  }
}