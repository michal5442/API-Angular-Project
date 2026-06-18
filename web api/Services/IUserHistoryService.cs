using DTOs;

namespace Services
{
    public interface IUserHistoryService
    {
        Task RecordAsync(int userId, int songId);
        Task<List<SongDTO>> GetRecommendationsAsync(int userId);
    }
}
