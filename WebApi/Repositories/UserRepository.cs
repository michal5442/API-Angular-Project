using Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Threading.Tasks;
namespace Repositories
{
    public class UserRepository : IUserRepository
    {
        UserContext _userContext;
        public UserRepository(UserContext userContext)
        {
            _userContext = userContext;
        }
        public async Task<User> getUserByID(int id)
        {
            return await _userContext.Users.FindAsync(id);
        }
        
        public async Task<List<User>> getAllUsers()
        {
            return await _userContext.Users.ToListAsync();
        }
        
        // Compatibility wrappers
        public async Task<User> GetUserById(int id)
        {
            return await getUserByID(id);
        }
        public async Task<User> addUser(User user)
        {
            await _userContext.Users.AddAsync(user);
            await _userContext.SaveChangesAsync();
            return user;    
        }
        public async Task<User> AddUser(User user)
        {
            return await addUser(user);
        }
        public async Task<User> login(User val)
        {
            var user= await _userContext.Users.FirstOrDefaultAsync(x=>x.UserName==val.UserName && x.Password==val.Password);
            return user;
        }
        public async Task<User> LogIn(User val)
        {
            return await login(val);
        }
        public async Task updateUser(User value, int id)
        {
            var existingUser = await _userContext.Users.FindAsync(id);
            if (existingUser != null)
            {
                existingUser.UserName = value.UserName;
                existingUser.FirstName = value.FirstName;
                existingUser.LastName = value.LastName;
                
                // Only update password if a new one is provided and not empty
                if (!string.IsNullOrWhiteSpace(value.Password))
                {
                    existingUser.Password = value.Password;
                }
                
                await _userContext.SaveChangesAsync();
            }
        }
        public async Task UpdateUser(User value, int id)
        {
            await updateUser(value, id);
        }

        public async Task<bool> deleteUser(int id)
        {
            var user = await _userContext.Users.FindAsync(id);
            if (user == null)
                return false;
            
            _userContext.Users.Remove(user);
            await _userContext.SaveChangesAsync();
            return true;
        }
    }
}
