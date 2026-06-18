using DTOs;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace WebAopiShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistController : Controller
    {
        IArtistService service;

        public ArtistController(IArtistService service)
        {
            this.service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ArtistDTO>> Get()
        {
            List<ArtistDTO> artists = await service.GetArtists();
            if (artists == null)
                return NoContent();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ArtistDTO>> GetById(int id)
        {
            ArtistDTO artist = await service.GetArtistById(id);
            if (artist == null)
                return NotFound();
            return Ok(artist);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ArtistDTO>> Post([FromBody] ArtistDTO artist)
        {
            ArtistDTO newArtist = await service.AddArtist(artist);
            if (newArtist == null)
                return BadRequest();
            return CreatedAtAction(nameof(GetById), new { id = newArtist.Id }, newArtist);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ArtistDTO>> Put(int id, [FromBody] ArtistDTO artist)
        {
            ArtistDTO updatedArtist = await service.UpdateArtist(id, artist);
            if (updatedArtist == null)
                return NotFound();
            return Ok(updatedArtist);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            bool result = await service.DeleteArtist(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}