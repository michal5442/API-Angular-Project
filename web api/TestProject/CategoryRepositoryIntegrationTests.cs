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
    public class CategoryRepositoryIntegrationTests : IDisposable
    {
        private readonly UserContext _context;
        private readonly CategoryRepository _categoryRepository;

        public CategoryRepositoryIntegrationTests()
        {
            // Hook: Before Each Test - Setup In-Memory DB
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new UserContext(options);
            _categoryRepository = new CategoryRepository(_context);
        }

        [Fact]
        public async Task GetCategories_RealDbCall_ReturnsData()
        {
            // Arrange (Happy Path)
            _context.Categories.Add(new Category { CategoryId = 1, CategoryName = "Home" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _categoryRepository.GetCategories();

            // Assert
            Assert.Single(result);
            Assert.Equal("Home", result[0].CategoryName);
        }

        [Fact]
        public async Task GetCategories_DatabaseIsEmpty_ReturnsEmpty()
        {
            // Act (Unhappy Path - No data seeded)
            var result = await _categoryRepository.GetCategories();

            // Assert
            Assert.Empty(result);
        }

        public void Dispose()
        {
            // Hook: After Each Test - Cleanup
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}