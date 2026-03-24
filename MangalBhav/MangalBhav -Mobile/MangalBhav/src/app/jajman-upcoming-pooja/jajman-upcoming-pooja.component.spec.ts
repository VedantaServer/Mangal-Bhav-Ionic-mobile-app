import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JajmanUpcomingPoojaComponent } from './jajman-upcoming-pooja.component';

describe('JajmanUpcomingPoojaComponent', () => {
  let component: JajmanUpcomingPoojaComponent;
  let fixture: ComponentFixture<JajmanUpcomingPoojaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JajmanUpcomingPoojaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JajmanUpcomingPoojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
