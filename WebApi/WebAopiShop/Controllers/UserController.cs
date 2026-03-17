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
        public async Task<ActionResult<UserDTO>> Login([FromBody] User val)
        {
            UserDTO user = await service.LogIn(val);
            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }
            logger.LogInformation(user.UserName, user.FirstName,user.LastName);
            return Ok(user);
        }

        [HttpPost("Register")]
        public async Task<ActionResult<UserDTO>> Register([FromBody] User val)
        {
            // AddUser in IUserService currently returns User; call service and map to DTO
            var created = await service.AddUser(val);
            if (created == null)
            {
                return BadRequest("Password too weak");
            }
            var dto = new UserDTO(created.UserId, created.UserName, created.FirstName, created.LastName);
            return CreatedAtAction(nameof(Get), new { id = dto.UserId }, dto);
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDTO>> Put(int id, [FromBody] User value)
        {
           bool success = await service.UpdateUser(value,id);
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
