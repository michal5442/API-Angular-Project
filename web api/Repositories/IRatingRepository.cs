using Entities;
namespace Repositories
{
    public interface IRatingRepository
    {
        Task<Rating> EnterToDB(Rating r);
    }
}