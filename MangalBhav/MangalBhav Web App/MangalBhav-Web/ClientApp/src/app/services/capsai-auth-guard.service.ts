import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CapsaiAuthGuardService implements CanActivate {

  constructor(private router: Router, private authGuard: AuthService) { }
  val: boolean = false;
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): true | UrlTree {
    this.val = Boolean(localStorage.getItem("isUserLoggedIn"));

    if (!this.val) { // If user is not logged in
      return this.router.parseUrl("/secure-login"); // Redirect to login for other routes
    }

    return true; // User is logged in
  }

}
