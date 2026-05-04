import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JajmanbottomtabsComponent } from './jajmanbottomtabs.component';

describe('JajmanbottomtabsComponent', () => {
  let component: JajmanbottomtabsComponent;
  let fixture: ComponentFixture<JajmanbottomtabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JajmanbottomtabsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JajmanbottomtabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
