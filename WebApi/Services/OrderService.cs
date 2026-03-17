using AutoMapper;
using DTOs;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Repositories;
namespace Services
{
    public class OrderService : IOrderService
    {
        IOrderRepository repository;
        ISongRepository songRepository;
        IMapper mapper;
        public OrderService(IOrderRepository repository,IMapper mapper,ISongRepository songRepository)
        {
            this.repository = repository;
            this.mapper=mapper;
            this.songRepository=songRepository;
        }
        public async Task<OrderDTO> GetOrderByID(int id)
        {
            Order order= await repository.GetOrderByID(id);
            OrderDTO orderDTO=mapper.Map<Order,OrderDTO>(order);
            return orderDTO;
        }
        

        public async Task<OrderDTO> AddOrder(Order newOrder)
        {
            if (!await ValidateOrderSum(newOrder)) {
                Order order = await repository.AddOrder(newOrder);
                OrderDTO orderDTO = mapper.Map<Order, OrderDTO>(order);
                return orderDTO;
            }
            else
            {
                throw new Exception("Order sum is not valid");
            }
        }
            public async Task<bool> ValidateOrderSum(Order order)
            {
              var orderItems = order.OrderItems;
              double sum = 0;
              foreach (var item in orderItems)
              {
                var product = await songRepository.getSongById(item.SongId);
                sum += (double)product.Price;
              }
              if (sum == order.OrderSum)
              {
                return true;
              }
              else
              {
                return false;
              }
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
