import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumbService';
 
 
 
@Component({
  selector: 'app-breadcrum',
  templateUrl: './breadcrum.component.html',
  styleUrls: ['./breadcrum.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: { label: string, link: string, keyId: string }[];

  constructor(private breadcrumbService: BreadcrumbService, private router: Router) { }

  ngOnInit(): void {
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
  }

  clearBreadcrumbs(): void {
    this.breadcrumbService.clearBreadcrumbs();
  }
  ActionClicked(item:any)
  {
    //console.log(item);   
    this.breadcrumbService.setBreadcrumbs(this.breadcrumbService.breadcrumbsSubject.value.filter(ad => ad.Indexlevel < item.Indexlevel));
    this.router.navigate(['/' + item.link]);
  }

}

