using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class ArtistRepository : IArtistRepository
    {
        UserContext _userContext;
        public ArtistRepository(UserContext userContext)
        {
            _userContext = userContext;
        }
        public async Task<List<Artist>> getArtists()
        {
            return await _userContext.Artists.ToListAsync();
        }

        public async Task<Artist> getArtistById(int id)
        {
            return await _userContext.Artists.FindAsync(id);
        }

        public async Task<Artist> addArtist(Artist artist)
        {
            await _userContext.Artists.AddAsync(artist);
            await _userContext.SaveChangesAsync();
            return artist;
        }

        public async Task<Artist> updateArtist(Artist artist)
        {
            _userContext.Artists.Update(artist);
            await _userContext.SaveChangesAsync();
            return artist;
        }

        public async Task<bool> deleteArtist(int id)
        {
            var artist = await _userContext.Artists.FindAsync(id);
            if (artist == null)
                return false;
            
            _userContext.Artists.Remove(artist);
            await _userContext.SaveChangesAsync();
            return true;
        }

        // Compatibility wrappers with PascalCase expected by tests
        public async Task<List<Artist>> GetArtists()
        {
            return await getArtists();
        }

        public async Task<Artist> GetArtistById(int id)
        {
            return await getArtistById(id);
        }
    }
}
