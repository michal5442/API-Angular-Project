using Entities;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Repositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject
{
    public class ProductRepositoryUnitTests : IDisposable
    {
        private readonly UserContext _context;
        private readonly ProductRepository _repository;

        public ProductRepositoryUnitTests()
        {
            // Setup Hook: יצירת DB ייחודי בזיכרון לכל טסט
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new UserContext(options);
            _repository = new ProductRepository(_context);
        }

        [Fact] // Happy Path
        public async Task GetProducts_ReturnsListType()
        {
            // Act
            var result = await _repository.GetProducts(null, null, null, null, null);

            // Assert: וידוא שסוג האובייקט החוזר הוא רשימת מוצרים
            Assert.IsType<List<Product>>(result);
        }

        public void Dispose()
        {
            // Teardown Hook: ניקוי המשאבים בסיום
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}