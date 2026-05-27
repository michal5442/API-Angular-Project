namespace DTOs
{
    public record CreateOrderDTO
    (
        int UserId,
        DateTime? OrderDate,
        double? OrderSum,
        ICollection<OrderItemDTO> OrderItems
    );
}
