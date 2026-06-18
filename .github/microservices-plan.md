# Plan for Decomposing MY Music Store Monolith into Microservices

> **Status: Planning only — not yet implemented.**
> This document describes the target architecture for decomposing the existing ASP.NET Core monolith into bounded-context microservices.

---

## TL;DR

The existing monolith (`WebAopiShop`) contains users/auth, songs/catalog, artists, orders, ratings, user history, password validation, an AI chat service, and a Kafka consumer. We'll carve it into focused services per domain, choose storage appropriate to each domain's consistency needs, and migrate incrementally using the strangler fig pattern.

---

## 1. Domain Decomposition

### User / Auth Service (`UserSvc`)
- Manages user profiles, registration, login, roles, theme preference.
- Owns: `Users` table, password strength validation (`PasswordService`, `CheckPassword`), JWT issuance.
- Endpoints: `POST /Login`, `POST /Register`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/theme`, `GET /` (admin).
- Language: C#/.NET (reuses existing `UserService`, `UserRepository`, `UserController`).
- DB: SQL Server / PostgreSQL — strong consistency required for credentials and ACID guarantees.
- Auth: Issues JWT Bearer tokens; sets `auth_token` HttpOnly cookie. Admin token via `GenerateAdminToken()`.

### Catalog Service (`CatalogSvc`)
- Manages songs and artists — search, filtering, pagination, genre tagging.
- Owns: `Songs`, `Artists` tables.
- Endpoints: all of `SongController` and `ArtistController`.
- Language: C#/.NET initially; can evolve independently.
- DB: Relational (SQL Server/PostgreSQL) or document DB (MongoDB/Cosmos) for flexible song metadata.
- Special: Song writes trigger background AI genre classification — this async call goes to `AiSvc`.
- Cache: Redis per-song and per-query cache stays within this service (`songs:all:*`, `songs:id:*`, TTL 5 min).

### Order Service (`OrderSvc`)
- Handles orders and order items; validates order sum against catalog prices.
- Owns: `Orders`, `OrderItems` tables.
- Endpoints: all of `OrderController`.
- Language: C#/.NET or Go for performance.
- DB: Relational — transactional integrity required (order sum validation, FK constraints).
- Communication: Calls `CatalogSvc` synchronously to validate song prices before persisting order.
- Events published: `OrderCreated` → Kafka/RabbitMQ.

### Rating Service (`RatingSvc`)
- Logs and stores HTTP request metadata (current `RatingMiddleware` behavior).
- Owns: `RATING` table.
- Can be eventual-consistent; high write volume, low read complexity.
- Language: Lightweight — Go, Node.js, or .NET minimal API.
- DB: Document store (MongoDB/Cosmos) or relational with simple schema.

### User History & Recommendations Service (`HistorySvc`)
- Tracks which songs each user has listened to; serves recommendations.
- Owns: `USER_HISTORY` table (composite PK `UserId + SongId`).
- Endpoints: `UserHistoryController` (`POST /`, `GET /recommended/{userId}`).
- Language: Python or .NET — Python preferred if ML-based recommendations are added.
- DB: Document store or time-series DB; eventual consistency acceptable.

### AI Service (`AiSvc`) — already partially extracted
- Already a standalone FastAPI (Python) app in `ai_service/`.
- Responsibilities: chat (GPT-4o-mini), audio genre classification (librosa), camera-based theme suggestion (OpenCV).
- Ports: 8000 (genre/theme), 8001 (chat).
- Needs: `OPENAI_API_KEY` in `.env`; receives song/artist data from caller (no direct DB access).
- Future: give it read-only access to `CatalogSvc` API instead of receiving product lists in each request.

### Admin Service (`AdminSvc`)
- Admin login, token generation, management views for songs/artists/users.
- Currently: `AdminController` + admin Angular components.
- Could merge into `UserSvc` (role-based) or keep separate for isolation.
- Language: C#/.NET.

### API Gateway
- Front door for all clients (Angular at `localhost:4200`).
- Routes requests to appropriate services, handles CORS, rate limiting (currently 60 req/min sliding window per IP), auth validation.
- Options: **Ocelot** (.NET, easiest migration), Kong, NGINX + Lua.
- Replaces hardcoded `https://localhost:44393` base URL in all Angular services.

---

## 2. Technology & Storage Recommendations

| Service | Language | Database | Consistency |
|---|---|---|---|
| UserSvc | C#/.NET | SQL Server / PostgreSQL | Strong (ACID) |
| CatalogSvc | C#/.NET | SQL Server + Redis cache | Strong + cached reads |
| OrderSvc | C#/.NET / Go | SQL Server / PostgreSQL | Strong (transactions) |
| RatingSvc | Go / Node / .NET | MongoDB / Cosmos DB | Eventual |
| HistorySvc | Python / .NET | MongoDB / Cosmos DB | Eventual |
| AiSvc | Python (FastAPI) | None (stateless) | — |
| AdminSvc | C#/.NET | Shared with UserSvc/CatalogSvc initially | Strong |
| Gateway | Ocelot / Kong | None | — |

**Per-service DB ownership:** no shared database. Each service owns its schema to prevent coupling.

---

## 3. Communication Patterns

- **Synchronous REST** (HTTP/JSON): Gateway → Services, OrderSvc → CatalogSvc (price validation).
- **Asynchronous messaging** (Kafka — already present via `KafkaConsumer` project): `OrderCreated`, `SongAdded`, `UserRegistered`, `GenreTagged`.
- **API contracts**: each service publishes its own Swagger (already configured in `WebAopiShop`).
- **Auth propagation**: Gateway validates JWT; passes claims downstream via headers.

---

## 4. Migration Strategy

### Phase 1 — Extract low-risk services first
1. **AiSvc** — already extracted. Formalize as independent deployment.
2. **RatingSvc** — low coupling, no foreign keys to critical data.
3. **HistorySvc** — isolated table, clear boundary.

### Phase 2 — Extract catalog
4. **CatalogSvc** — move `SongController`, `ArtistController`, `SongService`, `ArtistService`, `SongRepository`, `ArtistRepository`.
5. Keep monolith reading from same DB temporarily (read replica / CDC).

### Phase 3 — Extract transactional services
6. **OrderSvc** — requires CatalogSvc to be stable first (price validation dependency).
7. **UserSvc** — most critical; migrate last or in parallel with full auth testing.

### Strangler Fig Pattern
- Deploy each new service side-by-side with the monolith.
- Update Gateway routing to point to new service for that domain.
- Stop writing to monolith for that domain once service is live and validated.
- Remove dead code from monolith progressively.

### Data Migration
- Use Change Data Capture (CDC) or ETL scripts to replicate existing data into each service's DB.
- Shared DB read period during transition; cut over writes first, then reads.

---

## 5. Deployment

- **Containerize** each service with Docker (one `Dockerfile` per service).
- **Local dev**: Docker Compose with all services + SQL Server + Redis + Kafka.
- **CI/CD**: separate pipeline per service (GitHub Actions — `.github/workflows/`).
- **Orchestration**: Kubernetes for production; Docker Compose for development.

---

## 6. Operational Concerns

- **Logging**: Centralized (ELK stack or Seq) — replaces per-service NLog file logging.
- **Monitoring**: Prometheus + Grafana per service.
- **Resilience**: Polly for retries and circuit breakers on inter-service HTTP calls.
- **API versioning**: version endpoints from day one to allow independent deploys.

---

## 7. Decisions & Rationale

| Decision | Rationale |
|---|---|
| Start all services in C#/.NET | Leverage existing codebase and team knowledge; minimal disruption. |
| Allow polyglot after first two services | HistorySvc/RatingSvc benefit from lightweight runtimes. |
| SQL Server for transactional services | Existing schema, stored procs (`sp_UpdateUserTheme`), no migration cost initially. |
| PostgreSQL for new deploys | Avoid vendor lock-in; open source. |
| Kafka for events | Already present in the project (`KafkaConsumer`); extend rather than introduce new tooling. |
| Ocelot as gateway | Native .NET, low friction for the existing team. |
| AiSvc stays Python | FastAPI + librosa + OpenCV ecosystem has no C# equivalent; keep as-is. |
