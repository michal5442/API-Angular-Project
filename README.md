# MY Music Store 🎵

Full-stack Israeli/Jewish digital music store. Users browse songs, add to cart, purchase, and interact with an AI chatbot. Admins manage songs, artists, and users.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | ASP.NET Core Web API (.NET 8), C# |
| Frontend | Angular 19, standalone components, Angular Material, Bootstrap 5 |
| AI Service | Python FastAPI + OpenAI GPT-4o-mini + librosa + OpenCV |
| Database | SQL Server (EF Core) |
| Cache | Redis 7 (`localhost:6379`) via Docker |
| Messaging | Kafka (Docker) + KafkaConsumer project |
| Auth | JWT Bearer + HttpOnly cookie `auth_token` |
| Logging | NLog → `c:\temp\WebAopiShop\` |
| Testing | xUnit |

## Project Structure

```
API-Angular-Project/
├── web api/
│   ├── Entities/          EF entity classes
│   ├── DTOs/              C# records (immutable)
│   ├── Repositories/      EF data access + interfaces
│   ├── Services/          Business logic + AutoMapper
│   ├── WebAopiShop/       ASP.NET entry point (Controllers, Middlewares, Program.cs)
│   ├── KafkaConsumer/     Standalone Kafka consumer app
│   ├── TestProject/       Integration + unit tests
│   └── Dockerfile
├── Angular/
│   └── src/app/
│       ├── components/    Standalone feature components
│       ├── services/      Angular services (one per domain)
│       ├── models/        TypeScript interfaces
│       └── guards/        Route guards
└── ai_service/
    ├── chat_service.py    FastAPI app
    ├── .env               OPENAI_API_KEY (not committed)
    └── requirements.txt
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- SQL Server (local or Express)
- OpenAI API key

## Getting Started

### 1. Start infrastructure (Redis + Kafka)

```bash
docker compose up -d
```

### 2. Backend API

```bash
cd "web api/WebAopiShop"
dotnet run
```

Runs on `https://localhost:44393`. Swagger UI at `https://localhost:44393/swagger`.

### 3. Frontend

```bash
cd Angular
npm install
ng serve
```

Runs on `http://localhost:4200`.

### 4. AI Service

```bash
cd ai_service
pip install -r requirements.txt
uvicorn chat_service:app --port 8001
```

> Windows quick start: run `Angular/start.bat` to launch API + Angular together.

## Configuration

All configuration is in `web api/WebAopiShop/appsettings.json`:

- `ConnectionStrings:DefaultConnection` — SQL Server connection string
- `ConnectionStrings:Redis` — Redis (`localhost:6379,password=<password>`)
- `Jwt:Key` / `Jwt:Issuer` / `Jwt:Audience` — JWT settings
- `AiService:BaseUrl` — AI service URL (`http://localhost:8000`)
- `Redis:SongsTTLMinutes` — Song cache TTL (default: 5)

Create `ai_service/.env`:
```
OPENAI_API_KEY=<your_key>
```

## API Endpoints

| Controller | Route | Description |
|---|---|---|
| User | `api/User` | Register, Login, CRUD, theme |
| Song | `api/Song` | Browse, search, paginate, CRUD (Admin) |
| Artist | `api/Artist` | Browse, CRUD (Admin) |
| Order | `api/Order` | Create and view orders |
| Admin | `api/Admin/Login` | Admin authentication |
| Chat | `api/Chat` | AI chatbot |
| UserHistory | `api/UserHistory` | Listen history + recommendations |

Full Swagger docs available at `/swagger` when running in Development mode.

## Architecture Notes

- **Layer rule**: Controller → Service → Repository. Never inject Repository into Controller.
- **Cache**: Redis caches songs (`songs:all:*`, `songs:id:<id>`, TTL 5 min). Invalidated on write.
- **Rate limiting**: 60 req/min sliding window per IP → HTTP 429.
- **Error handling**: Global `ErrorHandlingMiddleware` — no try/catch in controllers.
- **Auth**: JWT in HttpOnly cookie `auth_token` (`SameSite=None`, `Secure=true`, 1 hour).
- **CORS**: `http://localhost:4200` only, with credentials.
- **AI genre tagging**: Background fire-and-forget after song creation.

## Running Tests

```bash
cd "web api"
dotnet test
```

## Docker

Build the API image:

```bash
cd "web api"
docker build -t my-music-api .
```
