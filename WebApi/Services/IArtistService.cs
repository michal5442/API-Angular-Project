using DTOs;
using Entities;

namespace Services
{
    public interface IArtistService
    {
        Task<List<ArtistDTO>> GetArtists();
        Task<ArtistDTO> GetArtistById(int id);
        Task<ArtistDTO> AddArtist(ArtistDTO artist);
        Task<ArtistDTO> UpdateArtist(int id, ArtistDTO artist);
        Task<bool> DeleteArtist(int id);
    }
}
