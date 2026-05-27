using Entities;
using Repositories;
using Repositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject
{
    public class ProductRepositoryIntegrationTests : IClassFixture<DatabaseFixture>
    {
        private readonly UserContext _dbContext;
        private readonly ProductRepository _productRepository;

        public ProductRepositoryIntegrationTests(DatabaseFixture databaseFixture)
        {
            // Setup Hook: אתחול הקונטקסט והרפוזיטורי
            _dbContext = databaseFixture.Context;
            _productRepository = new ProductRepository(_dbContext);

            // ניקוי טבלת מוצרים לפני כל טסט להבטחת בידוד
            _dbContext.Products.RemoveRange(_dbContext.Products);
            _dbContext.SaveChanges();
        }

        [Fact] // Happy Path: מוודאים שמוצרים שנמצאים ב-DB אכן חוזרים
        public async Task GetProducts_ProductsExist_ReturnsAllProducts()
        {
            // Arrange: הוספת מוצרים לדוגמה
            _dbContext.Products.Add(new Product { ProductName = "Product 1", Price = 10 });
            _dbContext.Products.Add(new Product { ProductName = "Product 2", Price = 20 });
            await _dbContext.SaveChangesAsync();

            // Act: קריאה למתודה
            var result = await _productRepository.GetProducts(null, null, null, null, null);

            // Assert: בדיקה שחזרו 2 מוצרים
            Assert.Equal(2, result.Count);
            Assert.Equal("Product 1", result[0].ProductName);
        }

        [Fact] // Unhappy Path: בסיס נתונים ריק
        public async Task GetProducts_NoProductsInDb_ReturnsEmptyList()
        {
            // Act
            var result = await _productRepository.GetProducts(null, null, null, null, null);

            // Assert: בדיקה שהרשימה ריקה ולא חוזר Null
            Assert.Empty(result);
        }
    }


}