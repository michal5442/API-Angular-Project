using Repositories;
using Entities;
using DTOs;
using AutoMapper;
namespace Services
{
    public class UserService : IUserService
    {
        IUserRepository _iUserRepository;
        IPasswordService _iPasswordService;
        IMapper _mapper;
        public UserService(IUserRepository iUserRepository,IPasswordService iPasswordService,IMapper mapper)
        {
            _iUserRepository = iUserRepository;
            _iPasswordService = iPasswordService;
            _mapper = mapper;
        }
        public async Task<UserDTO> getUserByID(int id)
        {
            User user=await _iUserRepository.getUserByID(id);
            UserDTO userDTO=_mapper.Map<User,UserDTO>(user);
            return userDTO;
        }
        // compatibility wrappers - keep original methods and add PascalCase
        public async Task<UserDTO> GetUserById(int id)
        {
            return await getUserByID(id);
        }

        public async Task<List<UserDTO>> GetAllUsers()
        {
            var users = await _iUserRepository.getAllUsers();
            return _mapper.Map<List<User>, List<UserDTO>>(users);
        }

        public async Task<User> AddUser(User newUser)
        {
            if ((_iPasswordService.Check(newUser.Password)).Strength < 2)
                return null;
            var user = await _iUserRepository.addUser(newUser);
            // map to DTO is expected by controller, but interface AddUser originally returned User.
            return user;
        }
        public async Task<UserDTO> login(User LoginUser)
        {
            User user =await _iUserRepository.login(LoginUser) ;
            UserDTO userDTO = _mapper.Map<User, UserDTO>(user);
            return userDTO;
            
        }
        public async Task<UserDTO> LogIn(User val)
        {
            return await login(val);
        }
        public async Task<bool> updateUser(User user, int id)
        {
            // Only check password strength if a new password is provided and not empty
            if (!string.IsNullOrWhiteSpace(user.Password) && (_iPasswordService.Check(user.Password)).Strength < 2)
                return false;
            await _iUserRepository.updateUser(user, id);
            return true;
        }
        public async Task<bool> UpdateUser(User user, int id)
        {
            return await updateUser(user, id);
        }

        public async Task<bool> DeleteUser(int id)
        {
            return await _iUserRepository.deleteUser(id);
        }
    }
}
