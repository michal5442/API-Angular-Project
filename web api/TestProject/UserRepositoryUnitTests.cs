using Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Moq;
using Repositories;
using Repositories.Models;
using System.Linq.Expressions;

namespace TestProject
{
    public class UserRepositoryUnitTests
    {
        private UserContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new UserContext(options);
        }

        // Happy Path: הוספת משתמש חדש
        [Fact]
        public async Task AddUser_ValidUser_AddsToDatabase()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var repository = new UserRepository(context);
            var newUser = new User { UserName = "NewGuy", Password = "999" };

            // Act
            var result = await repository.AddUser(newUser);

            // Assert
            Assert.Equal(1, await context.Users.CountAsync());
            Assert.Equal("NewGuy", result.UserName);
        }

        // Unhappy Path: חיפוש משתמש שלא קיים
        [Fact]
        public async Task GetUserById_NonExistentId_ReturnsNull()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var repository = new UserRepository(context);

            // Act
            var result = await repository.GetUserById(999);

            // Assert
            Assert.Null(result);
        }
    }
}