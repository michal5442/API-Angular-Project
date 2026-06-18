using Entities;
using Microsoft.EntityFrameworkCore;
using Repositories;
using System;
using System.Threading.Tasks;

namespace TestProject
{
    public class OrderRepositoryIntegrationTests : IDisposable
    {
        private readonly UserContext _context;
        private readonly OrderRepository _repository;

        public OrderRepositoryIntegrationTests()
        {
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new UserContext(options);
            _repository = new OrderRepository(_context);
        }

        [Fact]
        public async Task AddOrder_ValidOrder_SavesAndReturns()
        {
            var order = new Order { UserId = 1, OrderDate = DateTime.Now, OrderSum = 150 };

            var result = await _repository.AddOrder(order);
            var saved = await _context.Orders.FindAsync(result.OrderId);

            Assert.NotNull(saved);
            Assert.Equal(150, saved.OrderSum);
        }

        [Fact]
        public async Task GetOrderById_ExistingOrder_ReturnsCorrectOrder()
        {
            var order = new Order { UserId = 3, OrderDate = DateTime.Now, OrderSum = 200 };
            await _repository.AddOrder(order);

            var result = await _repository.GetOrderByID(order.OrderId);

            Assert.NotNull(result);
            Assert.Equal(200, result.OrderSum);
        }

        [Fact]
        public async Task GetOrderById_NonExistentId_ReturnsNull()
        {
            var result = await _repository.GetOrderByID(999);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetOrderById_NegativeId_ReturnsNull()
        {
            var result = await _repository.GetOrderByID(-5);

            Assert.Null(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
