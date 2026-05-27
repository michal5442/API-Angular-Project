using Entities;
using DTOs;

namespace Services
{
    public interface IRatingService
    {
        Task<RatingDTO> EnterToDB(RatingDTO r);
    }
}