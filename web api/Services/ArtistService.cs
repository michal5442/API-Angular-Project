using AutoMapper;
using DTOs;
using Entities;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class ArtistService : IArtistService
    {
        IArtistRepository repository;
        IMapper mapper;
        public ArtistService(IArtistRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<List<ArtistDTO>> GetArtists()
        {
            var artists = await repository.getArtists();
            return mapper.Map<List<Artist>, List<ArtistDTO>>(artists);
        }

        public async Task<ArtistDTO> GetArtistById(int id)
        {
            var artist = await repository.getArtistById(id);
            return mapper.Map<Artist, ArtistDTO>(artist);
        }

        public async Task<ArtistDTO> AddArtist(ArtistDTO artistDTO)
        {
            var artist = mapper.Map<ArtistDTO, Artist>(artistDTO);
            var newArtist = await repository.addArtist(artist);
            return mapper.Map<Artist, ArtistDTO>(newArtist);
        }

        public async Task<ArtistDTO> UpdateArtist(int id, ArtistDTO artistDTO)
        {
            var artist = mapper.Map<ArtistDTO, Artist>(artistDTO);
            artist.ArtistId = id;
            var updatedArtist = await repository.updateArtist(artist);
            return mapper.Map<Artist, ArtistDTO>(updatedArtist);
        }

        public async Task<bool> DeleteArtist(int id)
        {
            return await repository.deleteArtist(id);
        }
    }
}
