using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace DTOs
{
    public record OrderDTO
    (
        int OrderId,
        int UserId,
        DateTime? OrderDate,
        double? OrderSum,
        ICollection<OrderItemDTO> OrderItems
    )
    {
        // Provide an alias `Id` used by controllers/tests when creating resources
        public int Id => OrderId;
    };
}
