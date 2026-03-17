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
    public class UserRepositoryIntegrationTests : IClassFixture<DatabaseFixture>, IDisposable
    {
        private readonly UserContext _dbContext;
        private readonly UserRepository _userRepository;

        public UserRepositoryIntegrationTests(DatabaseFixture databaseFixture)
        {
            _dbContext = databaseFixture.Context;
            _userRepository = new UserRepository(_dbContext);

            // "Hook" לפני כל בדיקה - ניקוי נתונים ראשוני אם צריך
            _dbContext.Users.RemoveRange(_dbContext.Users);
            _dbContext.SaveChanges();
        }

        // Happy Path: התחברות מוצלחת
        [Fact]
        public async Task LogIn_ValidCredentials_ReturnsUser()
        {
            // Arrange
            var user = new User { UserName = "TestUser", Password = "123" };
            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _userRepository.LogIn(new User { UserName = "TestUser", Password = "123" });

            // Assert
            Assert.NotNull(result);
            Assert.Equal("TestUser", result.UserName);
        }

        // Unhappy Path: ניסיון התחברות עם סיסמה שגויה
        [Fact]
        public async Task LogIn_InvalidPassword_ReturnsNull()
        {
            // Arrange
            var user = new User { UserName = "TestUser", Password = "123" };
            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _userRepository.LogIn(new User { UserName = "TestUser", Password = "WRONG" });

            // Assert
            Assert.Null(result);
        }

        // Hook אחרי כל בדיקה - מבטיח שה-Context נקי
        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }
    }

}