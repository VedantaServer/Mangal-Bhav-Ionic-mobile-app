import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MangalMartProductInsertComponent } from './mangal-mart-product-insert.component';

describe('MangalMartProductInsertComponent', () => {
  let component: MangalMartProductInsertComponent;
  let fixture: ComponentFixture<MangalMartProductInsertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MangalMartProductInsertComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MangalMartProductInsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
