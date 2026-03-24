import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BreadcrumbService {
  public breadcrumbsSubject: BehaviorSubject<{ Indexlevel: number, label: string, link: string, keyId: string }[]> = new BehaviorSubject([]);
  breadcrumbs$: Observable<{ Indexlevel: number, label: string, link: string, keyId: string }[]> = this.breadcrumbsSubject.asObservable();
 
  constructor() {
  }

  getIndexBreadcrumbs(): any {
    return this.breadcrumbsSubject.value.length;
  }

  getBreadcrumbs(): any {
    return this.breadcrumbsSubject.value;
  }

  setBreadcrumbs(breadcrumbs: { Indexlevel: number, label: string, link: string, keyId: string }[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }
}


