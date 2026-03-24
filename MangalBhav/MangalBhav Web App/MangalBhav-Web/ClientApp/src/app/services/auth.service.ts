import { Injectable } from '@angular/core';  
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay, retry, map } from 'rxjs/operators';
import { User } from '../models/user';
import { Api } from './api';
import { Router } from '@angular/router';
import { OrganizationService } from '../services/organization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
 

  isUserLoggedIn: boolean = false;  

  constructor(public Api: Api, private router: Router, private orgService: OrganizationService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    //console.log(this.currentUser);
  }


  login(userName, password) {
    this.isUserLoggedIn = false;

    var body = { userid: userName, password: password };


    return this.Api.postUrlData("vedantalogin?userName=" + userName + '&'+"password=" + password, null)
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
         console.log(user);
        var vedantaUser = user as User;
        if (vedantaUser.token.length > 10) {
          localStorage.setItem('UserName', userName);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(vedantaUser);
          this.isUserLoggedIn = true;
        }
        /*console.log(vedantaUser);*/
        return user;
      }));
    
  }

  Organisation(Name, About, organisationtype, EmailID, Website, PhoneNo, City, State, ZipPostal, Area, Country, Board, CoEdType, EventDate, DateModified, UpdatedByUser) {
    var body = { EduOrganisationID: Name, About, organisationtype, EmailID, Website, PhoneNo, City, State, ZipPostal, Area, Country, Board, CoEdType, EventDate, DateModified, UpdatedByUser };
    return this.Api.postUrlData("api/EduOrganisation", body)
    }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/secure-login']);
  }
    clearSession() {
      this.isUserLoggedIn = false;
      localStorage.clear();
      this.currentUserSubject.next(null);
      this.orgService.removeGlobalOrganization();
      this.orgService.setGlobalOrganization(null, null, null, null, null, null);
    }



  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
   


  public RegisterUser() {
  if (this.isUserLoggedIn == false) {
      this.router.navigate(['secure-login']);
    }
    
  }
}
