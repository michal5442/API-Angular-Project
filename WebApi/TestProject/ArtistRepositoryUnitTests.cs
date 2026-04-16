using Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestProject
{
    public class ArtistRepositoryUnitTesting : IDisposable
    {
        private readonly Mock<UserContext> _mockContext;
        private readonly ArtistRepository _artistRepository;

        public ArtistRepositoryUnitTesting()
        {
            // Hook: Before Each Test
            _mockContext = new Mock<UserContext>(new DbContextOptions<UserContext>());
            _artistRepository = new ArtistRepository(_mockContext.Object);
        }

        [Fact]
        public async Task GetArtists_ExistingArtists_ReturnsList()
        {
            // Arrange (Happy Path)
            var artists = new List<Artist>
            {
                new Artist { ArtistId = 1, ArtistName = "Artist 1" },
                new Artist { ArtistId = 2, ArtistName = "Artist 2" }
            };
            _mockContext.Setup(x => x.Artists).ReturnsDbSet(artists);

            // Act
            var result = await _artistRepository.GetArtists();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("Artist 1", result[0].ArtistName);
        }

        [Fact]
        public async Task GetArtists_NoArtists_ReturnsEmptyList()
        {
            // Arrange (Unhappy Path)
            var artists = new List<Artist>();
            _mockContext.Setup(x => x.Artists).ReturnsDbSet(artists);

            // Act
            var result = await _artistRepository.GetArtists();

            // Assert
            Assert.Empty(result);
        }

        public void Dispose()
        {
            // Hook: After Each Test (Clean up if needed)
        }
    }
}
