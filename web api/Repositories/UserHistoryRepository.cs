using Entities;
using Microsoft.EntityFrameworkCore;

namespace Repositories
{
    public class UserHistoryRepository : IUserHistoryRepository
    {
        private readonly UserContext _ctx;
        public UserHistoryRepository(UserContext ctx) => _ctx = ctx;

        public async Task AddAsync(UserHistory entry)
        {
            var existing = await _ctx.UserHistories
                .FirstOrDefaultAsync(h => h.UserId == entry.UserId && h.SongId == entry.SongId);

            if (existing != null)
                existing.ListenedAt = DateTime.UtcNow;
            else
                await _ctx.UserHistories.AddAsync(entry);

            await _ctx.SaveChangesAsync();
        }

        public async Task<List<UserHistory>> GetByUserAsync(int userId) =>
            await _ctx.UserHistories
                .Where(h => h.UserId == userId)
                .Include(h => h.Song)
                .OrderByDescending(h => h.ListenedAt)
                .ToListAsync();
    }
}
