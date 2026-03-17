using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class RatingRepository: IRatingRepository
    {
        UserContext _userContext;
        public RatingRepository(UserContext userContext)
        {
            _userContext = userContext;
        }

        public async Task<Rating> EnterToDB(Rating r)
        {
            await _userContext.Ratings.AddAsync(r);
            await _userContext.SaveChangesAsync();
            return r;
        }
    }
}
