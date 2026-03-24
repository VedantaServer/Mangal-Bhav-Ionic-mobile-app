import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbs: { label: string, url: string }[] = [];

  constructor() { }

  addBreadcrumb(label: string, url: string) {
    this.breadcrumbs.push({ label, url });
  }

  removeLastBreadcrumb() {
    this.breadcrumbs.pop();
  }

  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
}
