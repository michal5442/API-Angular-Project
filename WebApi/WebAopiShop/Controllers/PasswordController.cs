using Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordController : Controller
    {
        IPasswordService service;

        public PasswordController(IPasswordService service) {
            this.service = service;
        }

        [HttpPost]
        public ActionResult<CheckPassword> CheckPass([FromBody] string pass)
        {
            CheckPassword password = service.Check(pass);
            if (password == null)
            {
                return NoContent();
            }
            return Ok(password);
        }
    }
}
