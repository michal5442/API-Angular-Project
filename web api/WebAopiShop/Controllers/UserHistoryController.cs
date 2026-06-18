using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserHistoryController : ControllerBase
    {
        private readonly IUserHistoryService _service;
        public UserHistoryController(IUserHistoryService service) => _service = service;

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Record([FromBody] UserHistoryRecordDTO dto)
        {
            await _service.RecordAsync(dto.UserId, dto.SongId);
            return Ok();
        }

        [HttpGet("recommended/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<SongDTO>>> GetRecommended(int userId)
        {
            var songs = await _service.GetRecommendationsAsync(userId);
            return Ok(songs);
        }
    }
}
