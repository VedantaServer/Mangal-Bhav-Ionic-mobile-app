import { TestBed } from '@angular/core/testing';

import { CapsaiAuthGuardService } from './capsai-auth-guard.service';

describe('CapsaiAuthGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CapsaiAuthGuardService = TestBed.get(CapsaiAuthGuardService);
    expect(service).toBeTruthy();
  });
});
