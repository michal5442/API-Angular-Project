using AutoMapper;
using DTOs;
using Entities;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class RatingService : IRatingService
    {
        IRatingRepository repository;
        IMapper mapper;
        public RatingService(IRatingRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }
        public async Task<RatingDTO> EnterToDB(RatingDTO r)
        {
            Rating rating = mapper.Map<RatingDTO, Rating>(r);
            Rating result = await repository.EnterToDB(rating);
            RatingDTO ratingDTO = mapper.Map<Rating, RatingDTO>(result);
            return ratingDTO;
        }
    }
}
