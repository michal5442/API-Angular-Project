# Repositories Instructions — MY Music Project

> Part of the GitHub Copilot instructions set.
> See also: `copilot-instructions.md`, `controllers-instructions.md`

All repositories live in `web api/Repositories/`.
They use `UserContext` (EF Core DbContext) injected via constructor.

---

## UserContext (DbContext)

File: `Repositories/UserContext.cs`

DbSets: `Users`, `Songs`, `Artists`, `Orders`, `OrderItems`, `Ratings`, `UserHistories`

Column mapping is explicit (UPPER_SNAKE_CASE in DB).
Do **not** rely on EF conventions for column names — always check `OnModelCreating`.

---

## IUserRepository / UserRepository

### Interface methods

```csharp
Task<User> addUser(User user)
Task<User> getUserByID(int id)
Task<List<User>> getAllUsers()
Task<User> login(User val)           // matches by UserName + Password
Task updateUser(User value, int id)
Task<bool> deleteUser(int id)
Task<bool> UpdateUserTheme(int userId, string theme)
```

### Notable details

- `login()` matches by `UserName` (email) AND `Password` — both must match.
- `updateUser()` only updates `UserName`, `FirstName`, `LastName`, and `Password` (only if non-empty).
- `UpdateUserTheme()` calls SQL stored procedure `sp_UpdateUserTheme @USER_ID, @THEME` via `ExecuteSqlRawAsync`.
- Has camelCase originals + PascalCase wrappers (`GetUserById`, `AddUser`, `LogIn`, `UpdateUser`) — keep both when modifying.

---

## ISongRepository / SongRepository

### Interface methods

```csharp
Task<(IEnumerable<Song> songs, int total)> getSongs(int? artistId, string description, int? minPrice, int? maxPrice, int? skip, int? position)
Task<Song> addSong(Song newSong)
Task<bool> updateSong(Song song, int id)
Task<bool> deleteSong(int id)
Task<Song> getSongById(int id)
Task UpdateGenreAsync(int songId, string genre)
```

### Notable details

- `getSongs()` filters by `artistId`, `description` (Contains), `minPrice`, `maxPrice` then paginates with `skip` (page size) and `position` (page number, 1-based).
- Pagination: `Skip((page-1) * pageSize).Take(pageSize)`.
- Includes `ArtistNavigation` (eager load) for artist name in DTO.
- `updateSong()` sets `song.SongId = id` and calls `_userContext.Songs.Update(song)` — full entity replace.
- `UpdateGenreAsync()` called by AI service background task after genre classification.

---

## IArtistRepository / ArtistRepository

### Interface methods

```csharp
Task<List<Artist>> getArtists()
Task<Artist> getArtistById(int id)
Task<Artist> addArtist(Artist artist)
Task<Artist> updateArtist(Artist artist)
Task<bool> deleteArtist(int id)
```

### Notable details

- `updateArtist()` uses `_userContext.Artists.Update(artist)` — caller must set `ArtistId` before calling.
- Has PascalCase wrappers `GetArtists()` and `GetArtistById()` for test compatibility.

---

## IOrderRepository / OrderRepository

### Interface methods

```csharp
Task<Order> GetOrderByID(int id)
Task<IEnumerable<Order>> GetOrdersByUserID(int userId)
Task<Order> AddOrder(Order order)
```

### Notable details

- `GetOrdersByUserID()` includes `OrderItems` via `.Include(o => o.OrderItems)`.
- `AddOrder()` sets `item.OrderId` on each OrderItem after EF assigns the new `OrderId`.
- No update or delete — orders are immutable once placed.

---

## IRatingRepository / RatingRepository

### Interface methods

```csharp
Task AddRating(Rating rating)
Task<IEnumerable<Rating>> GetAll()
```

### Notable details

- Used by `RatingMiddleware` to log every HTTP request.
- `Rating` stores: `Host`, `Method`, `Path`, `Referer`, `UserAgent`, `RecordDate`.

---

## IUserHistoryRepository / UserHistoryRepository

### Interface methods

```csharp
Task AddOrUpdate(UserHistory record)
Task<List<UserHistory>> GetByUserId(int userId)
```

### Notable details

- Composite PK: `(UserId, SongId)`.
- `AddOrUpdate` — if the record exists (same user+song), updates `ListenedAt`; otherwise inserts.
- Used to track which songs a user has listened to.

---

## General Repository Rules

1. Always use `async/await` — no `.Result` or `.Wait()`.
2. Call `SaveChangesAsync()` after every write operation.
3. Return `null` (not exception) when an entity is not found by ID — let the Service/Controller decide the HTTP response.
4. Never add business logic here — repositories are data access only.
5. When adding a new repository: create interface in `Repositories/`, register in `Program.cs` as Scoped.
