import { HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Api } from '../services/api';
import { AuthService } from '../../app/services/auth.service';
import { User } from '../../app/models/user'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']

})
export class ImageUploadComponent implements OnInit {
  entityID: any;
  currentUser: User;
  Fk_UserLoginID: any;
  progress: number;
  baseURL: string;
  http: any;
    entityType: string;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string, private api: Api,
    private authenticationService: AuthService, private route: ActivatedRoute) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.Fk_UserLoginID = this.currentUser.userID;
    this.baseURL = baseUrl;
  }
   
  ngOnInit() {
    this.route.paramMap.subscribe(parameterMap => {
      this.entityID = parameterMap.get('EntityID');
      this.entityType = parameterMap.get('EntityType');
      console.log(this.entityType, this.entityID);
    });
  }

  upload(files) { 
    if (files.length === 0)
      return;

    const formData = new FormData();

    for (const file of files) {
      formData.append(file.name, file);
    }
    this.api.postUrlDataByImage("api/VedantaLogin/UploadImages?entityType=" + this.entityType + "&entityID=" + this.entityID +"&Purpose=logo", formData).subscribe((resp) => {
      console.log(resp);
      }); 
  }
}
