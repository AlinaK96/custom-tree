import { TestBed } from '@angular/core/testing';

import { ActionsManagerService } from './actions-manager.service';

describe('ActionsManagerService', () => {
  let service: ActionsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
