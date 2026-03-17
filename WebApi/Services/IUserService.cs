using DTOs;
using Entities;


namespace Services
{
    public interface IUserService
    {
        // PascalCase compatibility
        Task<User> AddUser(User user);
        Task<UserDTO> GetUserById(int id);
        Task<List<UserDTO>> GetAllUsers();
        Task<UserDTO> LogIn(User user);
        Task<bool> UpdateUser(User user, int id);
        Task<bool> DeleteUser(int id);
    }
}
