import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendBulkSupportMessageComponent } from './send-bulk-support-message.component';

describe('SendBulkSupportMessageComponent', () => {
  let component: SendBulkSupportMessageComponent;
  let fixture: ComponentFixture<SendBulkSupportMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SendBulkSupportMessageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SendBulkSupportMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
