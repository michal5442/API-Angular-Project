# Copilot Instructions — MY Music Store

## What the App Does
A full-stack Israeli/Jewish digital music store. Users browse songs, add to cart, purchase, and interact with an AI chatbot. Admins manage songs, artists, and users. A Python AI service handles chat (GPT-4o-mini), automatic genre tagging via audio analysis, and ambient-light-based theme suggestion via camera.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | ASP.NET Core Web API (.NET 8), C# |
| Frontend | Angular 19, standalone components, Angular Material, Bootstrap 5 |
| AI Service | Python FastAPI + OpenAI GPT-4o-mini + librosa + OpenCV |
| Database | SQL Server (EF Core, `UserContext`), stored proc `sp_UpdateUserTheme` |
| Cache | Redis via StackExchange (`localhost:6379`) |
| Messaging | Kafka consumer (separate `KafkaConsumer` project) |
| Auth | JWT Bearer + HttpOnly cookie `auth_token` |
| Logging | NLog → `c:\temp\WebAopiShop\` + email on Error |
| Testing | xUnit (`TestProject/`) |

---

## Project Structure

```
web api/
  Entities/          EF entity classes (User, Song, Artist, Order, OrderItem, Rating, UserHistory)
  DTOs/              C# records (immutable, constructor params) — never expose Entities from Controllers
  Repositories/      EF data access; interfaces + implementations; use UserContext
  Services/          Business logic; inject repositories; use AutoMapper (MappingProfile.cs)
  WebAopiShop/       ASP.NET entry point: Controllers/, Middlewares/, Program.cs, appsettings.json
  KafkaConsumer/     Standalone consumer app
  TestProject/       Integration + unit tests per entity
Angular/
  src/app/
    components/      Standalone feature components (songs, cart, checkout, profile, admin/*, auth/*, chat, audio-recorder)
    services/        One Angular service per domain (user.ts, song.service.ts, artist.ts, order.ts, cart.service.ts, chat.service.ts, admin.service.ts, audio.service.ts, user-history.service.ts, rating.ts)
    models/          TypeScript interfaces (*.model.ts)
    guards/          Route guards
ai_service/
  chat_service.py    FastAPI app (ports 8000 genre/theme, 8001 chat)
  .env               OPENAI_API_KEY — never hardcode
  requirements.txt   fastapi uvicorn openai python-dotenv httpx pydantic opencv-python librosa soundfile
```

---

## How to Run

**API:** `cd "web api/WebAopiShop" && dotnet run` (HTTPS on port 44393)
**Angular:** `cd Angular && npm install && ng serve` (port 4200)
**AI service:** `cd ai_service && pip install -r requirements.txt && uvicorn chat_service:app --port 8001`
**Quick start (Windows):** `Angular/start.bat` launches API + Angular together.

Requires: SQL Server (connection string in `appsettings.json`), Redis on `localhost:6379`, `.env` with `OPENAI_API_KEY`.

---

## Coding Guidelines

### C# / ASP.NET
- Always `async/await` — never `.Result` or `.Wait()`.
- Layer rule: Controller → Service → Repository. Never inject a Repository into a Controller.
- DTOs are `record` types with constructor params. When adding a field update `Services/MappingProfile.cs`.
- Return `ActionResult<T>` from controllers. Use `NoContent()` for empty GETs, `NotFound()` when resource definitively absent.
- Do **not** catch exceptions in controllers — `ErrorHandlingMiddleware` handles them globally.
- Register every new service/repository as `Scoped` in `Program.cs`.
- Invalidate Redis cache (`songs:all:*` and `songs:id:<id>`) on any Song write.

### Known Workarounds (preserve these)
- `UserRepository` and `ArtistRepository` have duplicate camelCase + PascalCase methods (e.g. `addUser`/`AddUser`) for test compatibility — keep both when editing.
- `UserService.getCurrentUserId()` (Angular) checks three field names (`userId`, `id`, `Id`) — defensive coding for backend field name inconsistency.
- `ChatController` has triple `[HttpPost]` attribute — redundant but harmless, do not remove without testing.
- `UserDTO` exposes `Id => UserId` alias property for frontend compatibility.
- `SongDTO` exposes `Id => SongId` alias property.

### Angular / TypeScript
- TypeScript strict mode is on (`strict: true`, `noImplicitReturns`, `strictTemplates`).
- Prettier config: `printWidth: 100`, `singleQuote: true`.
- All components are standalone — do **not** use NgModules.
- HTTP calls follow pattern: `.pipe(catchError(err => throwError(() => err)))`.
- Theme (LIGHT/DARK) stored in `localStorage['currentUser'].preferredTheme` and applied as CSS class on `<body>`.
- API base URLs are hardcoded in each service (`https://localhost:44393/api/...`).

### AI Service (Python)
- `OPENAI_API_KEY` must be in `ai_service/.env`.
- Chat endpoint returns either streaming plain text or structured JSON `{action, artistId, message}` for artist navigation.
- Genre categories are Hebrew: `תפילה, שבת, חסידי, רגשי, שמחה, ישראלי`.

---

## Key Config Values (`appsettings.json`)
- `Jwt:ExpiresInMinutes` = 60 | `Redis:SongsTTLMinutes` = 5
- `AiService:BaseUrl` = `http://localhost:8000`
- CORS: `http://localhost:4200` only, `AllowCredentials`
- Rate limit: 60 req/min sliding window per IP → HTTP 429
