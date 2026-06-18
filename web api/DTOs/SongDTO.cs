using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace DTOs
{
    public record SongDTO
        (
        int SongId,
        string SongName,
        double? Price,
        string Description,
        string ImageUrl,
        string SongUrl,
        int? ArtistId, 
        string Artist,
        double Duration,
        string? GenreStyle
        )
    {
        public int Id => SongId;
    }
}
