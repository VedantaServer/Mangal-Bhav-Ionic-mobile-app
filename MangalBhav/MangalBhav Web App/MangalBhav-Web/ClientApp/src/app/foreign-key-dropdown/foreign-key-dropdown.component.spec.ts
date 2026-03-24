import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignKeyDropdownComponent } from './foreign-key-dropdown.component';

describe('ForeignKeyDropdownComponent', () => {
  let component: ForeignKeyDropdownComponent;
  let fixture: ComponentFixture<ForeignKeyDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForeignKeyDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForeignKeyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
