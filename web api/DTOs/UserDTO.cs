using System.ComponentModel.DataAnnotations;

namespace DTOs
{
    public record UserDTO
        (
            int UserId,
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address format")]
            [StringLength(254, ErrorMessage = "Email is too long")]
            string UserName,
            string FirstName,
            string LastName
        )
    {
        public int Id => UserId;
    }
}
