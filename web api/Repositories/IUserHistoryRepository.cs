using Entities;

namespace Repositories
{
    public interface IUserHistoryRepository
    {
        Task AddAsync(UserHistory entry);
        Task<List<UserHistory>> GetByUserAsync(int userId);
    }
}
