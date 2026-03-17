using System;
using System.Collections.Generic;
namespace Entities;

public partial class Song
{
    public int SongId { get; set; }

    public string SongName { get; set; } = null!;

    public double? Price { get; set; }

    public int? ArtistId { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? SongUrl { get; set; }

    public double? Duration { get; set; }

    public virtual Artist? ArtistNavigation { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
