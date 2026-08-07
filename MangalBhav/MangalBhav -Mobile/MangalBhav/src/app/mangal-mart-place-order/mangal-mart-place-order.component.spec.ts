import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MangalMartPlaceOrderComponent } from './mangal-mart-place-order.component';

describe('MangalMartPlaceOrderComponent', () => {
  let component: MangalMartPlaceOrderComponent;
  let fixture: ComponentFixture<MangalMartPlaceOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MangalMartPlaceOrderComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MangalMartPlaceOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
