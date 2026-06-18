FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["WebAopiShop/WebAopiShop.csproj", "WebAopiShop/"]
COPY ["Entities/Entities.csproj", "Entities/"]
COPY ["DTOs/DTOs.csproj", "DTOs/"]
COPY ["Repositories/Repositories.csproj", "Repositories/"]
COPY ["Services/Services.csproj", "Services/"]
RUN dotnet restore "WebAopiShop/WebAopiShop.csproj"

COPY . .
RUN dotnet publish "WebAopiShop/WebAopiShop.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser

COPY --from=build /app/publish .

RUN chown -R appuser:appuser /app
USER appuser

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WebAopiShop.dll"]
