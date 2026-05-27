using DTOs;
using Entities;

namespace Services
{
    public interface ISongService
    {
        Task<(List<SongDTO> songs, int total)> GetSongs(int? artistId, string description, double? minPrice, double? maxPrice, int? skip, int? position);
        Task<SongDTO> AddSong(Song newSong);
        Task<bool> UpdateSong(Song song, int id);
        Task<bool> DeleteSong(int id);
        Task<SongDTO> GetSongById(int id);
    }
}
