using Entities;
using Repositories;
using System.Threading.Tasks;

namespace TestProject
{
    public class SongRepositoryIntegrationTests : IClassFixture<DatabaseFixture>
    {
        private readonly UserContext _dbContext;
        private readonly SongRepository _songRepository;

        public SongRepositoryIntegrationTests(DatabaseFixture databaseFixture)
        {
            // Setup Hook: אתחול הקונטקסט והרפוזיטורי
            _dbContext = databaseFixture.Context;
            _songRepository = new SongRepository(_dbContext);

            // ניקוי טבלת שירים לפני כל טסט להבטחת בידוד
            _dbContext.Songs.RemoveRange(_dbContext.Songs);
            _dbContext.SaveChanges();
        }

        [Fact] // Happy Path: מוודאים שהשירים שנמצאים ב-DB אכן חוזרים
        public async Task GetSongs_SongsExist_ReturnsAllSongs()
        {
            // Arrange
            _dbContext.Songs.Add(new Song { SongName = "Song 1", Price = 10 });
            _dbContext.Songs.Add(new Song { SongName = "Song 2", Price = 20 });
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _songRepository.GetSongs(null, null, null, null, null);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Song 1", result[0].SongName);
        }

        [Fact] // Unhappy Path: בסיס נתונים ריק
        public async Task GetSongs_NoSongsInDb_ReturnsEmptyList()
        {
            // Act
            var result = await _songRepository.GetSongs(null, null, null, null, null);

            // Assert
            Assert.Empty(result);
        }
    }
}
