using Entities;
using Microsoft.EntityFrameworkCore;
using Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestProject
{
    public class SongRepositoryUnitTests : IDisposable
    {
        private readonly UserContext _context;
        private readonly SongRepository _repository;

        public SongRepositoryUnitTests()
        {
            // Setup Hook: יצירת DB ייחודי בזיכרון לכל טסט
            var options = new DbContextOptionsBuilder<UserContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new UserContext(options);
            _repository = new SongRepository(_context);
        }

        [Fact] // Happy Path
        public async Task GetSongs_ReturnsListType()
        {
            // Act
            var result = await _repository.GetSongs(null, null, null, null, null);

            // Assert: וידוא שסוג האובייקט החוזר הוא רשימת שירים
            Assert.IsType<List<Song>>(result);
        }

        public void Dispose()
        {
            // Teardown Hook: ניקוי המשאבים בסיום
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
