using DTOs;
using Entities;

namespace Services
{
    public interface IUserService
    {
        Task<UserDTO> AddUser(User user);
        Task<UserDTO> GetUserById(int id);
        Task<List<UserDTO>> GetAllUsers();
        Task<(UserDTO user, string token)> LogIn(User user);
        Task<(UserDTO user, string token)> AddUserWithToken(User user);
        Task<bool> UpdateUser(User user, int id);
        Task<bool> DeleteUser(int id);
        Task<bool> UpdateUserTheme(int userId, string theme);
        string GenerateAdminToken();
    }
}
