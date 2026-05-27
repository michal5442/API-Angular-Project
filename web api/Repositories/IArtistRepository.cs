using Entities;

namespace Repositories
{
    public interface IArtistRepository
    {
        Task<List<Artist>> getArtists();
        Task<Artist> getArtistById(int id);
        Task<Artist> addArtist(Artist artist);
        Task<Artist> updateArtist(Artist artist);
        Task<bool> deleteArtist(int id);
    }
}
