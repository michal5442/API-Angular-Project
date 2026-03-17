import { TestBed } from '@angular/core/testing';

import { OrderItemService } from './order-item';

describe('OrderItem', () => {
  let service: OrderItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [OrderItemService]
    });
    service = TestBed.inject(OrderItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
// ___