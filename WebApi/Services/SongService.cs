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
    public class SongService : ISongService
    {
        ISongRepository repository;
        IMapper mapper;
        public SongService(ISongRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<(List<SongDTO> songs, int total)> GetSongs(int? artistId, string description, double? minPrice, double? maxPrice, int? skip, int? position)
    {
            var (songs, total) = await repository.getSongs(artistId, description, (int?)minPrice, (int?)maxPrice, skip, position);
            var songsDTO = mapper.Map<IEnumerable<Song>, List<SongDTO>>(songs);
            return (songsDTO, total);
        }
        public async Task<SongDTO> AddSong(Song newSong)
        {
            Song song = await repository.addSong(newSong);
            SongDTO SongDTO = mapper.Map<Song, SongDTO>(song);
            return SongDTO;
        }
        public async Task<bool> UpdateSong(Song song, int id)
        {
            bool isUpdated = await repository.updateSong(song, id);
            return isUpdated;
        }
        public async Task<bool> DeleteSong(int id)
        {
            bool isDeleted = await repository.deleteSong(id);
            return isDeleted;
        }
        public async Task<SongDTO> GetSongById(int id)
        {
            Song song = await repository.getSongById(id);
            SongDTO songDTO = mapper.Map<Song, SongDTO>(song);
            return songDTO;
        }
    }
}
