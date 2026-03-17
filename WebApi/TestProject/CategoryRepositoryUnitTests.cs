using Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using Repositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Moq.EntityFrameworkCore;

namespace TestProject
{
    public class CategoryRepositoryUnitTesting : IDisposable
    {
        private readonly Mock<UserContext> _mockContext;
        private readonly CategoryRepository _categoryRepository;

        public CategoryRepositoryUnitTesting()
        {
            // Hook: Before Each Test
            _mockContext = new Mock<UserContext>(new DbContextOptions<UserContext>());
            _categoryRepository = new CategoryRepository(_mockContext.Object);
        }

        [Fact]
        public async Task GetCategories_ExistingCategories_ReturnsList()
        {
            // Arrange (Happy Path)
            var categories = new List<Category>
        {
            new Category { CategoryId = 1, CategoryName = "Electronics" },
            new Category { CategoryId = 2, CategoryName = "Books" }
        };
            _mockContext.Setup(x => x.Categories).ReturnsDbSet(categories);

            // Act
            var result = await _categoryRepository.GetCategories();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("Electronics", result[0].CategoryName);
        }

        [Fact]
        public async Task GetCategories_NoCategories_ReturnsEmptyList()
        {
            // Arrange (Unhappy Path)
            var categories = new List<Category>();
            _mockContext.Setup(x => x.Categories).ReturnsDbSet(categories);

            // Act
            var result = await _categoryRepository.GetCategories();

            // Assert
            Assert.Empty(result);
        }

        public void Dispose()
        {
            // Hook: After Each Test (Clean up if needed)
        }
    }
}