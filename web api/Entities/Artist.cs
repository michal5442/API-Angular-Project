using System;
using System.Collections.Generic;

namespace Entities;

public partial class Artist
{
    public int ArtistId { get; set; }

    public string ArtistName { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public int? SongsCount { get; set; }

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();
}
