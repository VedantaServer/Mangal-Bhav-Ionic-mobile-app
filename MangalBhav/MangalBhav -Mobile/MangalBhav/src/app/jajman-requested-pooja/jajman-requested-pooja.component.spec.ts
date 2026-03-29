import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JajmanRequestedPoojaComponent } from './jajman-requested-pooja.component';

describe('JajmanRequestedPoojaComponent', () => {
  let component: JajmanRequestedPoojaComponent;
  let fixture: ComponentFixture<JajmanRequestedPoojaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JajmanRequestedPoojaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JajmanRequestedPoojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
