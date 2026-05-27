using AutoMapper;
using DTOs;
using Entities;

namespace Services
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Rating mappings
            CreateMap<RatingDTO, Rating>();
            CreateMap<Rating, RatingDTO>();
            // Other entity -> DTO mappings
            // Song mapping - map ImageUrl <-> ImageUrl and handle nullable Duration
            CreateMap<Song, SongDTO>()
                .ForCtorParam("SongId", opt => opt.MapFrom(src => src.SongId))
                .ForCtorParam("SongName", opt => opt.MapFrom(src => src.SongName))
                .ForCtorParam("Price", opt => opt.MapFrom(src => src.Price))
                .ForCtorParam("Description", opt => opt.MapFrom(src => src.Description ?? string.Empty))
                .ForCtorParam("ImageUrl", opt => opt.MapFrom(src => src.ImageUrl ?? string.Empty))
                .ForCtorParam("SongUrl", opt => opt.MapFrom(src => src.SongUrl ?? string.Empty))
                .ForCtorParam("ArtistId", opt => opt.MapFrom(src => src.ArtistId))
                .ForCtorParam("Duration", opt => opt.MapFrom(src => src.Duration ?? 0.0))
                .ForCtorParam("Artist", opt => opt.MapFrom(src => src.ArtistNavigation != null ? src.ArtistNavigation.ArtistName : string.Empty));

            CreateMap<SongDTO, Song>()
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => (double?)src.Duration));

            CreateMap<Order, OrderDTO>();
            CreateMap<OrderDTO, Order>();
            CreateMap<CreateOrderDTO, Order>()
                .ForMember(dest => dest.OrderId, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => src.OrderDate ?? DateTime.UtcNow))
                .ForMember(dest => dest.OrderSum, opt => opt.MapFrom(src => src.OrderSum ?? 0));

            // OrderItem mapping
            CreateMap<OrderItem, OrderItemDTO>();
            CreateMap<OrderItemDTO, OrderItem>();

            CreateMap<User, UserDTO>();
            CreateMap<UserDTO, User>();

            // Artist mapping - property names differ (ArtistId/ArtistName vs Id/Name)
            // Map constructor parameters for the DTO (records use constructor binding)
            CreateMap<Artist, ArtistDTO>()
                .ForCtorParam("Id", opt => opt.MapFrom(src => src.ArtistId))
                .ForCtorParam("Name", opt => opt.MapFrom(src => src.ArtistName))
                .ForCtorParam("ImageUrl", opt => opt.MapFrom(src => src.ImageUrl))
                .ForCtorParam("SongsCount", opt => opt.MapFrom(src => src.SongsCount));

            CreateMap<ArtistDTO, Artist>()
                .ForMember(dest => dest.ArtistId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ArtistName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.SongsCount, opt => opt.MapFrom(src => src.SongsCount));

            // Add other mappings as needed in future
        }
    }
}
