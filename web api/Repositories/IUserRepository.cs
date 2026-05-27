using Entities;
namespace Repositories
{
    public interface IUserRepository
    {
        Task<User> addUser(User user);
        Task<User> getUserByID(int id);
        Task<List<User>> getAllUsers();
        Task<User> login(User val);
        Task updateUser(User value, int id);
        Task<bool> deleteUser(int id);
    }
}