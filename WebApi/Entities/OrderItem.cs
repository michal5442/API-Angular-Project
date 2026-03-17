using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Entities;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int SongId { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
    public virtual Order? Order { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
    public virtual Song? Song { get; set; }
}
