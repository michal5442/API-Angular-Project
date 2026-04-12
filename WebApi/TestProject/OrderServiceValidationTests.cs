using AutoMapper;
using DTOs;
using Entities;
using Microsoft.Extensions.Logging;
using Moq;
using Repositories;
using Services;

namespace TestProject
{
    public class OrderServiceValidationTests
    {
        private readonly Mock<IOrderRepository> _mockOrderRepo;
        private readonly Mock<ISongRepository> _mockSongRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<OrderService>> _mockLogger;
        private readonly OrderService _service;

        public OrderServiceValidationTests()
        {
            _mockOrderRepo = new Mock<IOrderRepository>();
            _mockSongRepo = new Mock<ISongRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<OrderService>>();
            _service = new OrderService(_mockOrderRepo.Object, _mockMapper.Object, _mockSongRepo.Object, _mockLogger.Object);
        }

        // מסלול תקין: הסכום שהלקוח שלח תואם לסכום האמיתי
        [Fact]
        public async Task ValidateOrderSum_CorrectSum_ReturnsTrue()
        {
            var order = new OrderDTO(0, 1, null, 50.0, new List<OrderItemDTO>
            {
                new OrderItemDTO(0, 0, 1, 1),
                new OrderItemDTO(0, 0, 2, 1)
            });

            _mockSongRepo.Setup(r => r.getSongById(1)).ReturnsAsync(new Song { SongId = 1, Price = 30.0 });
            _mockSongRepo.Setup(r => r.getSongById(2)).ReturnsAsync(new Song { SongId = 2, Price = 20.0 });

            var result = await _service.validateOrderSum(order);

            Assert.True(result);
        }

        // מסלול שגוי: הסכום שהלקוח שלח לא תואם לסכום האמיתי
        [Fact]
        public async Task ValidateOrderSum_WrongSum_ReturnsFalse()
        {
            var order = new OrderDTO(0, 1, null, 999.0, new List<OrderItemDTO>
            {
                new OrderItemDTO(0, 0, 1, 1),
                new OrderItemDTO(0, 0, 2, 1)
            });

            _mockSongRepo.Setup(r => r.getSongById(1)).ReturnsAsync(new Song { SongId = 1, Price = 30.0 });
            _mockSongRepo.Setup(r => r.getSongById(2)).ReturnsAsync(new Song { SongId = 2, Price = 20.0 });

            var result = await _service.validateOrderSum(order);

            Assert.False(result);
        }

        // מסלול שגוי: AddOrder זורק Exception כשהסכום לא תואם
        [Fact]
        public async Task AddOrder_WrongSum_ThrowsException()
        {
            var order = new OrderDTO(0, 1, null, 999.0, new List<OrderItemDTO>
            {
                new OrderItemDTO(0, 0, 1, 1)
            });

            _mockSongRepo.Setup(r => r.getSongById(1)).ReturnsAsync(new Song { SongId = 1, Price = 30.0 });

            await Assert.ThrowsAsync<Exception>(() => _service.AddOrder(order));
        }

        // מסלול שגוי: שיר לא קיים זורק Exception
        [Fact]
        public async Task ValidateOrderSum_SongNotFound_ThrowsException()
        {
            var order = new OrderDTO(0, 1, null, 50.0, new List<OrderItemDTO>
            {
                new OrderItemDTO(0, 0, 99, 1)
            });

            _mockSongRepo.Setup(r => r.getSongById(99)).ReturnsAsync((Song?)null);

            await Assert.ThrowsAsync<Exception>(() => _service.validateOrderSum(order));
        }

        // מסלול תקין: הזמנה ריקה עם סכום 0
        [Fact]
        public async Task ValidateOrderSum_EmptyOrderWithZeroSum_ReturnsTrue()
        {
            var order = new OrderDTO(0, 1, null, 0.0, new List<OrderItemDTO>());

            var result = await _service.validateOrderSum(order);

            Assert.True(result);
        }
    }
}
