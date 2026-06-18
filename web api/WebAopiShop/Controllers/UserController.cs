using DTOs;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Text.Json;
using WebAopiShop;

namespace WebApiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        IUserService service;
        ILogger<UserController> logger;

        public UserController(IUserService service, ILogger<UserController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> Get()
        {
            var users = await service.GetAllUsers();
            if (users == null || !users.Any())
            {
                return NoContent();
            }
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDTO>> Get(int id)
        {
            UserDTO user = await service.GetUserById(id);
            if (user == null)
            {
                return NoContent();
            }
            return Ok(user);
        }

        // POST api/<UsersController>
        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDTO>> Login([FromBody] UserInputDTO val)
        {
            var userEntity = new User
            {
                UserId = val.UserId ?? 0,
                UserName = val.UserName,
                FirstName = val.FirstName,
                LastName = val.LastName,
                Password = val.Password
            };

            var loginResult = await service.LogIn(userEntity);
            if (loginResult.user == null)
                return Unauthorized("Invalid email or password");

            Response.Cookies.Append("auth_token", loginResult.token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            logger.LogInformation("{Email} logged in.", loginResult.user.UserName);
            return Ok(new { user = loginResult.user, token = loginResult.token });
        }

        [HttpPost("Register")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDTO>> Register([FromBody] UserInputDTO val)
        {
            var userEntity = new User
            {
                UserId = val.UserId ?? 0,
                UserName = val.UserName,
                FirstName = val.FirstName,
                LastName = val.LastName,
                Password = val.Password
            };

            var registerResult = await service.AddUserWithToken(userEntity);
            if (registerResult.user == null)
                return BadRequest("Password too weak");

            Response.Cookies.Append("auth_token", registerResult.token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            return CreatedAtAction(nameof(Get), new { id = registerResult.user.UserId }, new { user = registerResult.user, token = registerResult.token });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDTO>> Put(int id, [FromBody] UserInputDTO value)
        {
           var userEntity = new User
           {
               UserId = value.UserId ?? id,
               UserName = value.UserName,
               FirstName = value.FirstName,
               LastName = value.LastName,
               Password = value.Password
           };

           bool success = await service.UpdateUser(userEntity,id);
           if(!success)
            {
                return BadRequest("Password too weak");
            }
           UserDTO updatedUser = await service.GetUserById(id);
           return Ok(updatedUser);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            bool result = await service.DeleteUser(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpPatch("{id}/theme")]
        [Authorize]
        public async Task<ActionResult> UpdateTheme(int id, [FromBody] string theme)
        {
            var success = await service.UpdateUserTheme(id, theme);
            if (!success)
                return BadRequest("Invalid theme value. Accepted: LIGHT, DARK");
            return NoContent();
        }

    }
}
