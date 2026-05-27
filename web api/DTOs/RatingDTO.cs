using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record RatingDTO
        (
            int RatingId,
            string Host,
            string Method,
            string Path,
            string Referer,
            string UserAgent,
            DateTime? RecordDate
        );
}
