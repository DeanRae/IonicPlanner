import { TestBed } from '@angular/core/testing';

import { EventManagementService } from './event-management.service';

describe('EventManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventManagementService = TestBed.get(EventManagementService);
    expect(service).toBeTruthy();
  });
});
