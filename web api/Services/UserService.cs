using Repositories;
using Entities;
using DTOs;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services
{
    public class UserService : IUserService
    {
        IUserRepository _iUserRepository;
        IPasswordService _iPasswordService;
        IMapper _mapper;
        IConfiguration _config;

        public UserService(IUserRepository iUserRepository, IPasswordService iPasswordService, IMapper mapper, IConfiguration config)
        {
            _iUserRepository = iUserRepository;
            _iPasswordService = iPasswordService;
            _mapper = mapper;
            _config = config;
        }

        private string CreateToken(UserDTO user, bool isAdmin = false)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.UserName),
                new Claim(ClaimTypes.GivenName, user.FirstName ?? ""),
                new Claim(ClaimTypes.Surname, user.LastName ?? ""),
                new Claim(ClaimTypes.Role, isAdmin ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:ExpiresInMinutes", 60));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateAdminToken()
        {
            var adminDTO = new UserDTO(0, "admin", "Admin", "User", "LIGHT");
            return CreateToken(adminDTO, isAdmin: true);
        }

        public async Task<UserDTO> getUserByID(int id)
        {
            User user = await _iUserRepository.getUserByID(id);
            return _mapper.Map<User, UserDTO>(user);
        }

        public async Task<UserDTO> GetUserById(int id) => await getUserByID(id);

        public async Task<List<UserDTO>> GetAllUsers()
        {
            var users = await _iUserRepository.getAllUsers();
            return _mapper.Map<List<User>, List<UserDTO>>(users);
        }

        public async Task<UserDTO> AddUser(User newUser)
        {
            if ((_iPasswordService.Check(newUser.Password)).Strength < 2)
                return null;
            var user = await _iUserRepository.addUser(newUser);
            return _mapper.Map<User, UserDTO>(user);
        }

        public async Task<(UserDTO user, string token)> AddUserWithToken(User newUser)
        {
            var userDTO = await AddUser(newUser);
            if (userDTO == null) return (null, null);
            return (userDTO, CreateToken(userDTO));
        }

        public async Task<(UserDTO user, string token)> LogIn(User loginUser)
        {
            User user = await _iUserRepository.login(loginUser);
            if (user == null) return (null, null);
            var userDTO = _mapper.Map<User, UserDTO>(user);
            return (userDTO, CreateToken(userDTO));
        }

        public async Task<bool> UpdateUser(User user, int id)
        {
            if (!string.IsNullOrWhiteSpace(user.Password) && (_iPasswordService.Check(user.Password)).Strength < 2)
                return false;
            await _iUserRepository.updateUser(user, id);
            return true;
        }

        public async Task<bool> DeleteUser(int id) => await _iUserRepository.deleteUser(id);

        public async Task<bool> UpdateUserTheme(int userId, string theme)
        {
            var allowed = new[] { "LIGHT", "DARK" };
            if (!allowed.Contains(theme.ToUpper())) return false;
            return await _iUserRepository.UpdateUserTheme(userId, theme.ToUpper());
        }
    }
}
