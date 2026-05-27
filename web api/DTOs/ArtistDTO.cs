using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ArtistDTO
        (
        int Id,

        string Name,

        string ImageUrl,

        int SongsCount
        );
}
