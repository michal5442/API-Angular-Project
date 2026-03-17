import { TestBed } from '@angular/core/testing';

import { RatingService } from './rating';

describe('Rating', () => {
  let service: RatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [RatingService]
    });
    service = TestBed.inject(RatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
