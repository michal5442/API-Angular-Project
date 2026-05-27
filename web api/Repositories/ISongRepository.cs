using Entities;

namespace Repositories
{
    public interface ISongRepository
    {
        Task<(IEnumerable<Song> songs, int total)> getSongs(int? artistId, string description, int? minPrice, int? maxPrice, int? skip, int? position);
        Task<Song> addSong(Song newSong);
        Task<bool> updateSong(Song song, int id);
        Task<bool> deleteSong(int id);
        Task<Song> getSongById(int id);
    }
}
