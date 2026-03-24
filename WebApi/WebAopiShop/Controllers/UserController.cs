using DTOs;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Text.Json;
using WebAopiShop;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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

        // GET: api/<UsersController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> Get()
        {
            var users = await service.GetAllUsers();
            if (users == null || !users.Any())
            {
                return NoContent();
            }
            return Ok(users);
        }

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
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

            UserDTO user = await service.LogIn(userEntity);
            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }
            logger.LogInformation(user.UserName, user.FirstName,user.LastName);
            return Ok(user);
        }

        [HttpPost("Register")]
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

            var created = await service.AddUser(userEntity);
            if (created == null)
            {
                return BadRequest("Password too weak");
            }
            return CreatedAtAction(nameof(Get), new { id = created.UserId }, created);
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
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

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            bool result = await service.DeleteUser(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}
