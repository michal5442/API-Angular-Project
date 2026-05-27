using Microsoft.AspNetCore.Mvc;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace WebAopiShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly UserContext _userContext;
        private readonly IHttpClientFactory _httpClientFactory;

        public ChatController(UserContext userContext, IHttpClientFactory httpClientFactory)
        {
            _userContext = userContext;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost]
        [HttpPost]
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            try
            {
                var realSongs = _userContext.Songs
                    .Select(s => new {
                        s.SongName,
                        s.Price
                    })
                    .ToList();

                var payload = new
                {
                    message = request.Message,
                    history = request.History,
                    products = realSongs
                };

                var client = _httpClientFactory.CreateClient();
                var response = await client.PostAsJsonAsync("http://localhost:8001/chat", payload);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<ChatResponse>();
                    return Ok(result);
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, $"Python Error: {errorContent}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
        public List<object> History { get; set; }
    }

    public class ChatResponse
    {
        public string Reply { get; set; }
    }
}