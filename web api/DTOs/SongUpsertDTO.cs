namespace DTOs
{
    public record SongUpsertDTO
    (
        int? SongId,
        string SongName,
        double? Price,
        string Description,
        string ImageUrl,
        string SongUrl,
        int? ArtistId,
        double? Duration
    );
}
