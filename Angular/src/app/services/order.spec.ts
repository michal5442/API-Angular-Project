import { TestBed } from '@angular/core/testing';

import { OrderService } from './order';

describe('Order', () => {
  let service: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
