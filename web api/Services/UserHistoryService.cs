using AutoMapper;
using DTOs;
using Entities;
using Repositories;

namespace Services
{
    public class UserHistoryService : IUserHistoryService
    {
        private readonly IUserHistoryRepository _historyRepo;
        private readonly ISongRepository _songRepo;
        private readonly IMapper _mapper;

        public UserHistoryService(IUserHistoryRepository historyRepo, ISongRepository songRepo, IMapper mapper)
        {
            _historyRepo = historyRepo;
            _songRepo = songRepo;
            _mapper = mapper;
        }

        public async Task RecordAsync(int userId, int songId)
        {
            await _historyRepo.AddAsync(new UserHistory { UserId = userId, SongId = songId, ListenedAt = DateTime.UtcNow });
        }

        public async Task<List<SongDTO>> GetRecommendationsAsync(int userId)
        {
            var history = await _historyRepo.GetByUserAsync(userId);

            var topGenre = history
                .Where(h => !string.IsNullOrEmpty(h.Song?.GenreStyle))
                .GroupBy(h => h.Song!.GenreStyle)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key;

            if (topGenre == null) return new List<SongDTO>();

            var listenedIds = history.Select(h => h.SongId).ToHashSet();
            var (songs, _) = await _songRepo.getSongs(null, null, null, null, 50, 1);

            return _mapper.Map<List<SongDTO>>(
                songs.Where(s => s.GenreStyle == topGenre && !listenedIds.Contains(s.SongId)).Take(10).ToList()
            );
        }
    }
}
