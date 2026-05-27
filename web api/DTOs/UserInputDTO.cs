using System.ComponentModel.DataAnnotations;

namespace DTOs
{
    public record UserInputDTO
    (
        int? UserId,
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        [StringLength(254, ErrorMessage = "Email is too long")]
        string UserName,
        string? FirstName,
        string? LastName,
        [Required(ErrorMessage = "Password is required")]
        string Password
    );
}
