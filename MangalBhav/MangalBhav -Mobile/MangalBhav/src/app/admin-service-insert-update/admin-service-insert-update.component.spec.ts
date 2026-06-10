import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdminServiceInsertUpdateComponent } from './admin-service-insert-update.component';

describe('AdminServiceInsertUpdateComponent', () => {
  let component: AdminServiceInsertUpdateComponent;
  let fixture: ComponentFixture<AdminServiceInsertUpdateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminServiceInsertUpdateComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminServiceInsertUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
