import { TestBed } from '@angular/core/testing';

import { TaskManagementService } from './task-management.service';

describe('TaskManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskManagementService = TestBed.get(TaskManagementService);
    expect(service).toBeTruthy();
  });
});
