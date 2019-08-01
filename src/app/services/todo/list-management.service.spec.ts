import { TestBed } from '@angular/core/testing';

import { ListManagementService } from './list-management.service';

describe('ListManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ListManagementService = TestBed.get(ListManagementService);
    expect(service).toBeTruthy();
  });
});
