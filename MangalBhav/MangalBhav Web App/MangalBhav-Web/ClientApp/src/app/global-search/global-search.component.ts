import { Component, OnInit, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
 

 

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit {

  isVisible: boolean = false;
  searchTerm: string = '';
  results: string[] = [];

  private items: string[] = ['Angular', 'React', 'Vue', 'Svelte', 'Ember'];
  isSearchVisible: boolean = false;

  constructor( ) {
     
  }

  ngOnInit() {
  }

 

  openSearch(): void {
    this.isSearchVisible = true;
  }

  onSearch(): void {
    this.search(this.searchTerm)
      .subscribe(results => this.results = results);
  }
  search(term: string): Observable<string[]> {
    if (!term.trim()) {
      // If no search term, return an empty array.
      return of([]);
    }
    return of(this.items.filter(item => item.toLowerCase().includes(term.toLowerCase())));
  }
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isSearchVisible = false;
    }
  }
  
}
