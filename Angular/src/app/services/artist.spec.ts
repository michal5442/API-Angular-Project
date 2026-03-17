import { TestBed } from '@angular/core/testing';

import { ArtistService } from './artist';

describe('Artist', () => {
  let service: ArtistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [ArtistService]
    });
    service = TestBed.inject(ArtistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
