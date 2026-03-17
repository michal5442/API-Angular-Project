using AutoMapper;
using DTOs;
using Entities;
using Microsoft.AspNetCore.Mvc;

namespace Services
{
    public interface IOrderService
    {
        Task<OrderDTO> AddOrder(Order order);
        Task<OrderDTO> GetOrderByID(int id);
        Task<IEnumerable<OrderDTO>> GetOrdersByUserId(int userId);
        Task<bool> ValidateOrderSum(Order order);

  }
}
