using AutoMapper;
using DTOs;
using Entities;
using Repositories;
using Microsoft.Extensions.Logging;
namespace Services
{
    public class OrderService : IOrderService
    {
        IOrderRepository repository;
        ISongRepository songRepository;
        IMapper mapper;
        ILogger<OrderService> logger;
        public OrderService(IOrderRepository repository,IMapper mapper,ISongRepository songRepository, ILogger<OrderService> logger)
        {
            this.repository = repository;
            this.mapper=mapper;
            this.songRepository=songRepository;
            this.logger = logger;
        }
        public async Task<OrderDTO> GetOrderByID(int id)
        {
            Order order= await repository.GetOrderByID(id);
            OrderDTO orderDTO=mapper.Map<Order,OrderDTO>(order);
            return orderDTO;
        }
        

        public async Task<OrderDTO> AddOrder(OrderDTO newOrder)
        {
            if(!(await validateOrderSum(newOrder)))
            {
                logger.LogWarning("Order sum validation failed for UserId: {UserId}. Client sum: {ClientSum}", newOrder.UserId, newOrder.OrderSum);
                throw new Exception("Order sum validation failed.");
            }
            Order orderEntity = mapper.Map<Order>(newOrder);
            orderEntity.OrderSum = newOrder.OrderSum ?? 0;
            Order order = await repository.AddOrder(orderEntity);
            OrderDTO orderDTO = mapper.Map<Order, OrderDTO>(order);
            return orderDTO;
        }
            
        public async Task<bool> validateOrderSum(OrderDTO order)
        {
            double total = 0;
            foreach (var item in order.OrderItems)
            {
                var song = await songRepository.getSongById(item.SongId);
                if (song == null)
                    throw new Exception($"Song with ID {item.SongId} not found.");
                total += song.Price ?? 0;
            }
            if (total != (order.OrderSum ?? 0))
            {
                logger.LogWarning("validateOrderSum mismatch for UserId: {UserId}. Client: {ClientSum}, Calculated: {CalculatedSum}", order.UserId, order.OrderSum, total);
                return false;
            }
            return true;    
        }   

          public async Task<IEnumerable<OrderDTO>> GetOrdersByUserId(int userId)
        {
            var orders = await repository.GetOrdersByUserID(userId);
            if (orders == null) 
                return null;
                        return mapper.Map<IEnumerable<OrderDTO>>(orders);
        }

    }
}
