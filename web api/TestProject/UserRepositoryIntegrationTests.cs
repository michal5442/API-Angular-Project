using Entities;
using Microsoft.EntityFrameworkCore;
using Repositories;

namespace TestProject
{
    public class UserRepositoryIntegrationTests : IDisposable
    {
        private readonly UserContext _dbContext;
        private readonly UserRepository _userRepository;

        public UserRepositoryIntegrationTests()
        {
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new UserContext(options);
            _userRepository = new UserRepository(_dbContext);
        }

        [Fact]
        public async Task LogIn_ValidCredentials_ReturnsUser()
        {
            var user = new User { UserName = "TestUser", Password = "123" };
            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            var result = await _userRepository.login(new User { UserName = "TestUser", Password = "123" });

            Assert.NotNull(result);
            Assert.Equal("TestUser", result.UserName);
        }

        [Fact]
        public async Task LogIn_InvalidPassword_ReturnsNull()
        {
            var user = new User { UserName = "TestUser", Password = "123" };
            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            var result = await _userRepository.login(new User { UserName = "TestUser", Password = "WRONG" });

            Assert.Null(result);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }
    }
}
