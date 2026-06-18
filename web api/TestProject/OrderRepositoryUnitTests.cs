using Entities;
using Microsoft.EntityFrameworkCore;
using Repositories;
using System;
using System.Threading.Tasks;

namespace TestProject
{
    public class OrderRepositoryUnitTests : IDisposable
    {
        private readonly UserContext _context;
        private readonly OrderRepository _repository;

        public OrderRepositoryUnitTests()
        {
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new UserContext(options);
            _repository = new OrderRepository(_context);
        }

        [Fact]
        public async Task AddOrder_ValidOrder_ReturnsOrderWithId()
        {
            var order = new Order { UserId = 1, OrderDate = DateTime.Now, OrderSum = 250 };

            var result = await _repository.AddOrder(order);

            Assert.NotNull(result);
            Assert.True(result.OrderId > 0);
            Assert.Equal(250, result.OrderSum);
        }

        [Fact]
        public async Task GetOrderById_ExistingOrder_ReturnsOrder()
        {
            var order = new Order { OrderId = 5, UserId = 1, OrderSum = 100, OrderDate = DateTime.Now };
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();

            var result = await _repository.GetOrderByID(5);

            Assert.NotNull(result);
            Assert.Equal(100, result.OrderSum);
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
            var result = await _repository.GetOrderByID(-1);

            Assert.Null(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
