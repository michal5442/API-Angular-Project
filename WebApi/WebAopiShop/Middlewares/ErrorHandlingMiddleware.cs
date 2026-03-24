using System.Text.Json;

namespace WebAopiShop.Middlewares
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var traceId = context.TraceIdentifier;

                _logger.LogError(ex,
                    "Unhandled exception. TraceId: {TraceId}, Path: {Path}, Method: {Method}",
                    traceId,
                    context.Request.Path,
                    context.Request.Method);

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var errorResponse = new
                {
                    success = false,
                    statusCode = context.Response.StatusCode,
                    message = "An unexpected error occurred.",
                    traceId,
                    timestamp = DateTime.UtcNow,
                    path = context.Request.Path.Value
                };

                var json = JsonSerializer.Serialize(errorResponse);
                await context.Response.WriteAsync(json);
            }
        }
    }
}
