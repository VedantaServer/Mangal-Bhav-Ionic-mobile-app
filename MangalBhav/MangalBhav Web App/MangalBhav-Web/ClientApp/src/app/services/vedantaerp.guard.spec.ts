import { TestBed, async, inject } from '@angular/core/testing';

import { VedantaerpGuard } from './vedantaerp.guard';

describe('VedantaerpGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VedantaerpGuard]
    });
  });

  it('should ...', inject([VedantaerpGuard], (guard: VedantaerpGuard) => {
    expect(guard).toBeTruthy();
  }));
});
