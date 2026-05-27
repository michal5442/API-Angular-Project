using Microsoft.AspNetCore.Mvc;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private const string ADMIN_PASSWORD = "admin123";

        [HttpPost("Login")]
        public ActionResult Login([FromBody] AdminLoginRequest request)
        {
            if (request.Password == ADMIN_PASSWORD)
            {
                return Ok(new { success = true });
            }
            return Unauthorized(new { success = false });
        }
    }

    public class AdminLoginRequest
    {
        public string Password { get; set; }
    }
}
