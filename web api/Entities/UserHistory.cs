namespace Entities;

public class UserHistory
{
    public int UserId { get; set; }
    public int SongId { get; set; }
    public DateTime ListenedAt { get; set; }

    public virtual User? User { get; set; }
    public virtual Song? Song { get; set; }
}
