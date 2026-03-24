using System;
using System.Collections.Generic;

namespace Entities;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int SongId { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Song? Song { get; set; }
}
