using Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Threading.Tasks;
namespace Repositories
{
    public class OrderRepository : IOrderRepository
    {
        UserContext _userContext;
        public OrderRepository(UserContext userContext)
        {
            _userContext = userContext;
        }
        public async Task<Order> GetOrderByID(int id)
        {
            return await _userContext.Orders.FindAsync(id);
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserID(int userId)
        {
             return await _userContext.Orders
                 .Include(o => o.OrderItems)
                 .Where(o => o.UserId == userId)
                 .ToListAsync();
        }
        public async Task<Order> AddOrder(Order order)
        {
            await _userContext.Orders.AddAsync(order);
            
            if (order.OrderItems != null && order.OrderItems.Any())
            {
                foreach (var item in order.OrderItems)
                {
                    item.OrderId = order.OrderId;
                }
            }
            
            await _userContext.SaveChangesAsync();
            return order;
        }

    }
}
