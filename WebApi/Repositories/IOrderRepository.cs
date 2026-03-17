using Entities;

namespace Repositories
{
    public interface IOrderRepository
    {
        Task<Order> AddOrder(Order newOrder);
        Task<Order> GetOrderByID(int id);
        Task<IEnumerable<Order>> GetOrdersByUserID(int userId);

  

    }
}
