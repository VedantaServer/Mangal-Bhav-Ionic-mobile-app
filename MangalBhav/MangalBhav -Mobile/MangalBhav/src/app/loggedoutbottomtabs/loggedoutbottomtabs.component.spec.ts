import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoggedoutbottomtabsComponent } from './loggedoutbottomtabs.component';

describe('LoggedoutbottomtabsComponent', () => {
  let component: LoggedoutbottomtabsComponent;
  let fixture: ComponentFixture<LoggedoutbottomtabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggedoutbottomtabsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoggedoutbottomtabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
