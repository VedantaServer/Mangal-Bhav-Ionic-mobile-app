import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMappedListDataComponent } from './get-mapped-list-data.component';

describe('GetMappedListDataComponent', () => {
  let component: GetMappedListDataComponent;
  let fixture: ComponentFixture<GetMappedListDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetMappedListDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetMappedListDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
