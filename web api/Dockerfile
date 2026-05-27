# ============================================================
# Stage 1: Build
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first (layer caching for restore)
COPY WebAopiShop.sln ./
COPY DTOs/DTOs.csproj             DTOs/
COPY Entities/Entities.csproj     Entities/
COPY Repositories/Repositories.csproj Repositories/
COPY Services/Services.csproj     Services/
COPY WebAopiShop/WebAopiShop.csproj WebAopiShop/

RUN dotnet restore WebAopiShop/WebAopiShop.csproj

# Copy the rest of the source code
COPY . .

# ============================================================
# Stage 2: Publish
# ============================================================
FROM build AS publish
RUN dotnet publish WebAopiShop/WebAopiShop.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ============================================================
# Stage 3: Runtime (final image - no SDK, minimal footprint)
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy published output only
COPY --from=publish /app/publish .

# NLog writes logs to /app/logs (not c:\temp - that's Windows-only)
RUN mkdir -p /app/logs && chown appuser:appgroup /app/logs

# Switch to non-root user
USER appuser

# ASP.NET Core default container port
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Connection string and secrets must be injected at runtime via env vars:
# ENV ConnectionStrings__DefaultConnection=<your-connection-string>
# ENV Email__Password=<your-smtp-password>

ENTRYPOINT ["dotnet", "WebAopiShop.dll"]
