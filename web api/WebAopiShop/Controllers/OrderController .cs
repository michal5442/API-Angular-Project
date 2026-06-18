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
    public class OrderController : ControllerBase
    {
        IOrderService service;

        public OrderController(IOrderService service)
        {
            this.service = service;
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<OrderDTO>> Get(int id)
        {
            OrderDTO order = await service.GetOrderByID(id);
            if (order == null)
                return NoContent();
            return Ok(order);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<OrderDTO>> AddOrder([FromBody] OrderDTO order)
        {
            OrderDTO order2 = await service.AddOrder(order);
            return CreatedAtAction(nameof(Get), new { order2.Id }, order2);
        }

        [HttpGet("user/{UserId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrdersByUserId(int userId)
        {
            IEnumerable<OrderDTO> orders = await service.GetOrdersByUserId(userId);
            if (orders == null)
                return NotFound($"No orders found for customer with ID {userId}");
            return Ok(orders);
        }
    }
}