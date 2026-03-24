import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JajmanCompletedPoojaComponent } from './jajman-completed-pooja.component';

describe('JajmanCompletedPoojaComponent', () => {
  let component: JajmanCompletedPoojaComponent;
  let fixture: ComponentFixture<JajmanCompletedPoojaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JajmanCompletedPoojaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JajmanCompletedPoojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
