using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private const string ADMIN_PASSWORD = "admin123";
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("Login")]
        public ActionResult Login([FromBody] AdminLoginRequest request)
        {
            if (request.Password != ADMIN_PASSWORD)
                return Unauthorized(new { success = false });

            var token = _userService.GenerateAdminToken();

            Response.Cookies.Append("auth_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            return Ok(new { success = true, token = token });
        }
    }

    public class AdminLoginRequest
    {
        public string Password { get; set; }
    }
}
