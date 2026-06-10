import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FamilyMandirPendingApprovalComponent } from './family-mandir-pending-approval.component';

describe('FamilyMandirPendingApprovalComponent', () => {
  let component: FamilyMandirPendingApprovalComponent;
  let fixture: ComponentFixture<FamilyMandirPendingApprovalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyMandirPendingApprovalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyMandirPendingApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
