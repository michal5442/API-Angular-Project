using AutoMapper;
using DTOs;

namespace Services
{
    public interface IOrderService
    {
        Task<OrderDTO> AddOrder(OrderDTO order);
        Task<OrderDTO> GetOrderByID(int id);
        Task<IEnumerable<OrderDTO>> GetOrdersByUserId(int userId);

  }
}
