using DTOs;
using Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongController : Controller
    {
        ISongService service;

        public SongController(ISongService service)
        {
            this.service = service;
        }

        [HttpGet]
    public async Task<ActionResult<List<SongDTO>>> GetSongs([FromQuery] int? artistId, [FromQuery] string? Description, [FromQuery] double? minPrice, [FromQuery] double? maxPrice, [FromQuery] int position = 1, [FromQuery] int skip = 10)
    {
            var (songs, total) = await service.GetSongs(artistId, Description, minPrice, maxPrice, skip, position);
            if (songs == null || songs.Count == 0)
            {
                return Ok(new { songs = new List<SongDTO>(), total = 0 });
            }
            return Ok(new { songs, total });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SongDTO>> GetById(int id)
        {
            SongDTO song = await service.GetSongById(id);
            if (song == null)
            {
                return NotFound();
            }
            return Ok(song);
        }

        [HttpPost]
        public async Task<ActionResult<SongDTO>> AddSong([FromBody] Song song)
        {
            SongDTO song2 = await service.AddSong(song);
            return CreatedAtAction(nameof(GetById), new { song2.Id }, song2);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Song value)
        {
            bool updatedSong = await service.UpdateSong(value, id);
            if (!updatedSong)
            { return NotFound($"Song with ID {id} not found."); }
            return Ok(updatedSong);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await service.DeleteSong(id);
            if (!success)
                return NotFound();
            return NoContent();
        }
    }
}
