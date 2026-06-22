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
            var listenedIds = history.Select(h => h.SongId).ToHashSet();
            var (allSongs, _) = await _songRepo.getSongs(null, null, null, null, 50, 1);

            // New user: return top-10 songs they haven't heard (any order)
            if (!history.Any() || !history.Any(h => !string.IsNullOrEmpty(h.Song?.GenreStyle)))
            {
                return _mapper.Map<List<SongDTO>>(
                    allSongs.Where(s => !listenedIds.Contains(s.SongId)).Take(10).ToList());
            }

            // Build tag frequency map from history
            var tagFreq = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var h in history.Where(h => !string.IsNullOrEmpty(h.Song?.GenreStyle)))
            {
                foreach (var tag in h.Song!.GenreStyle!.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
                {
                    tagFreq[tag] = tagFreq.GetValueOrDefault(tag) + 1;
                }
            }

            // Score each unheard song by how many of its tags appear in user's history
            var scored = allSongs
                .Where(s => !listenedIds.Contains(s.SongId) && !string.IsNullOrEmpty(s.GenreStyle))
                .Select(s => new
                {
                    Song = s,
                    Score = s.GenreStyle!.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                                        .Sum(tag => tagFreq.GetValueOrDefault(tag))
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Take(10)
                .Select(x => x.Song)
                .ToList();

            return _mapper.Map<List<SongDTO>>(scored);
        }
    }
}
