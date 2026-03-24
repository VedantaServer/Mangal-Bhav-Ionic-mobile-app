import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private injector: Injector, private router: Router) {
  }  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let token = localStorage.getItem("jwttoken"); //this is filled from login.component.ts
    //console.log(token);
    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer '+token
      }
    }); 
    return next.handle(request);
  }

}
