using AutoMapper;
using DTOs;
using Entities;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Repositories;
using System.Text.Json;

namespace Services
{
    public class SongService : ISongService
    {
        private readonly ISongRepository repository;
        private readonly IMapper mapper;
        private readonly IDistributedCache cache;
        private readonly int ttlMinutes;
        private readonly string aiServiceUrl;
        private readonly IHttpClientFactory httpClientFactory;

        private const string AllSongsPrefix = "songs:all";
        private const string SongByIdPrefix = "songs:id:";

        public SongService(ISongRepository repository, IMapper mapper, IDistributedCache cache, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            this.repository = repository;
            this.mapper = mapper;
            this.cache = cache;
            this.httpClientFactory = httpClientFactory;
            ttlMinutes = config.GetValue<int>("Redis:SongsTTLMinutes", 5);
            aiServiceUrl = config.GetValue<string>("AiService:BaseUrl", "http://localhost:8000")!;
        }

        public async Task<(List<SongDTO> songs, int total)> GetSongs(int? artistId, string description, double? minPrice, double? maxPrice, int? skip, int? position)
        {
            string cacheKey = $"{AllSongsPrefix}:{artistId}:{description}:{minPrice}:{maxPrice}:{skip}:{position}";
            var cached = await cache.GetStringAsync(cacheKey);
            if (cached != null)
                return JsonSerializer.Deserialize<(List<SongDTO>, int)>(cached);

            var (songs, total) = await repository.getSongs(artistId, description, (int?)minPrice, (int?)maxPrice, skip, position);
            var songsDTO = mapper.Map<IEnumerable<Song>, List<SongDTO>>(songs);

            await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize((songsDTO, total)),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(ttlMinutes) });

            return (songsDTO, total);
        }

        public async Task<SongDTO> GetSongById(int id)
        {
            string cacheKey = $"{SongByIdPrefix}{id}";
            var cached = await cache.GetStringAsync(cacheKey);
            if (cached != null)
                return JsonSerializer.Deserialize<SongDTO>(cached)!;

            Song song = await repository.getSongById(id);
            SongDTO songDTO = mapper.Map<Song, SongDTO>(song);

            await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(songDTO),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(ttlMinutes) });

            return songDTO;
        }

        public async Task<SongDTO> AddSong(Song newSong)
        {
            Song song = await repository.addSong(newSong);
            SongDTO songDTO = mapper.Map<Song, SongDTO>(song);
            await InvalidateAllSongsCache();
            _ = TagGenreInBackgroundAsync(song);
            return songDTO;
        }

        private async Task TagGenreInBackgroundAsync(Song song)
        {
            try
            {
                if (string.IsNullOrEmpty(song.SongUrl)) return;
                var songPath = Path.Combine("wwwroot", song.SongUrl.TrimStart('/'));
                if (!File.Exists(songPath)) return;

                using var http = httpClientFactory.CreateClient();
                using var form = new MultipartFormDataContent();
                var fileBytes = await File.ReadAllBytesAsync(songPath);
                form.Add(new ByteArrayContent(fileBytes), "file", Path.GetFileName(songPath));
                form.Add(new StringContent(song.SongName), "song_name");

                var response = await http.PostAsync($"{aiServiceUrl}/analyze-genre", form);
                if (!response.IsSuccessStatusCode) return;

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(json);
                var genre = result.GetProperty("genre_style").GetString();
                if (!string.IsNullOrEmpty(genre))
                    await repository.UpdateGenreAsync(song.SongId, genre);
            }
            catch { /* לא לעצור את הבקשה בגלל תיוג */ }
        }

        public async Task<bool> UpdateSong(Song song, int id)
        {
            bool isUpdated = await repository.updateSong(song, id);
            if (isUpdated)
            {
                await cache.RemoveAsync($"{SongByIdPrefix}{id}");
                await InvalidateAllSongsCache();
            }
            return isUpdated;
        }

        public async Task<bool> DeleteSong(int id)
        {
            bool isDeleted = await repository.deleteSong(id);
            if (isDeleted)
            {
                await cache.RemoveAsync($"{SongByIdPrefix}{id}");
                await InvalidateAllSongsCache();
            }
            return isDeleted;
        }

        private async Task InvalidateAllSongsCache()
        {
            await cache.RemoveAsync(AllSongsPrefix);
        }
    }
}