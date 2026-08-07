import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MangalMartProductDispatchComponent } from './mangal-mart-product-dispatch.component';

describe('MangalMartProductDispatchComponent', () => {
  let component: MangalMartProductDispatchComponent;
  let fixture: ComponentFixture<MangalMartProductDispatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MangalMartProductDispatchComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MangalMartProductDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
