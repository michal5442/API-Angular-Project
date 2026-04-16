using Entities;
using Repositories;
using System.Threading.Tasks;

namespace TestProject
{
    public class ArtistRepositoryIntegrationTests : IClassFixture<DatabaseFixture>
    {
        private readonly UserContext _dbContext;
        private readonly ArtistRepository _artistRepository;

        public ArtistRepositoryIntegrationTests(DatabaseFixture databaseFixture)
        {
            // Setup Hook: אתחול הקונטקסט והרפוזיטורי
            _dbContext = databaseFixture.Context;
            _artistRepository = new ArtistRepository(_dbContext);

            // ניקוי טבלת אמנים לפני כל טסט להבטחת בידוד
            _dbContext.Artists.RemoveRange(_dbContext.Artists);
            _dbContext.SaveChanges();
        }

        [Fact] // Happy Path: מוודאים שאמנים שנמצאים ב-DB אכן חוזרים
        public async Task GetArtists_ArtistsExist_ReturnsAllArtists()
        {
            // Arrange
            _dbContext.Artists.Add(new Artist { ArtistName = "Artist 1" });
            _dbContext.Artists.Add(new Artist { ArtistName = "Artist 2" });
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _artistRepository.GetArtists();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Artist 1", result[0].ArtistName);
        }

        [Fact] // Unhappy Path: בסיס נתונים ריק
        public async Task GetArtists_NoArtistsInDb_ReturnsEmptyList()
        {
            // Act
            var result = await _artistRepository.GetArtists();

            // Assert
            Assert.Empty(result);
        }
    }
}
