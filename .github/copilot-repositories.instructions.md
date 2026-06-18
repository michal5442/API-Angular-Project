# Repositories Instructions — MY Music Store

> See also: `copilot-instructions.md`, `copilot-controllers.instructions.md`

All repositories live in `web api/Repositories/`. Injected via constructor DI using `UserContext` (EF Core DbContext).

---

## UserContext (DbContext)

File: `Repositories/UserContext.cs`
DbSets: `Users`, `Songs`, `Artists`, `Orders`, `OrderItems`, `Ratings`, `UserHistories`
Column names are **UPPER_SNAKE_CASE** in DB — always check `OnModelCreating`, never rely on EF conventions.

---

## IUserRepository / UserRepository

```csharp
Task<User> addUser(User user)
Task<User> getUserByID(int id)
Task<List<User>> getAllUsers()
Task<User> login(User val)            // matches UserName + Password both
Task updateUser(User value, int id)   // only updates Password if non-empty
Task<bool> deleteUser(int id)
Task<bool> UpdateUserTheme(int userId, string theme)
```

**Key details:**
- `UpdateUserTheme` calls stored procedure `sp_UpdateUserTheme @USER_ID, @THEME` via `ExecuteSqlRawAsync`.
- `updateUser` skips password update if `value.Password` is null/empty.
- Has both camelCase originals **and** PascalCase wrappers (`AddUser`, `GetUserById`, `LogIn`, `UpdateUser`) — **keep both**, they exist for test compatibility.

---

## ISongRepository / SongRepository

```csharp
Task<(IEnumerable<Song> songs, int total)> getSongs(int? artistId, string description, int? minPrice, int? maxPrice, int? skip, int? position)
Task<Song> addSong(Song newSong)
Task<bool> updateSong(Song song, int id)
Task<bool> deleteSong(int id)
Task<Song> getSongById(int id)
Task UpdateGenreAsync(int songId, string genre)
```

**Key details:**
- `getSongs`: `skip` = page size, `position` = page number (1-based). Pagination: `Skip((page-1) * pageSize).Take(pageSize)`.
- Filters: `description` uses `.Contains()`, all filters are nullable (skip if null).
- Includes `.Include(song => song.ArtistNavigation)` for artist name in DTO.
- `updateSong`: sets `song.SongId = id` then calls `Update(song)` — full entity replace.
- `UpdateGenreAsync`: called by AI background task after genre classification.

---

## IArtistRepository / ArtistRepository

```csharp
Task<List<Artist>> getArtists()
Task<Artist> getArtistById(int id)
Task<Artist> addArtist(Artist artist)
Task<Artist> updateArtist(Artist artist)   // caller must set ArtistId before calling
Task<bool> deleteArtist(int id)
```

**Key details:**
- Has PascalCase wrappers `GetArtists()` and `GetArtistById()` for test compatibility — keep both.
- `updateArtist` uses `Update(artist)` — full replace, caller sets the ID.

---

## IOrderRepository / OrderRepository

```csharp
Task<Order> GetOrderByID(int id)
Task<IEnumerable<Order>> GetOrdersByUserID(int userId)
Task<Order> AddOrder(Order order)
```

**Key details:**
- `GetOrdersByUserID` includes `.Include(o => o.OrderItems)` — eager load items.
- `AddOrder`: after EF assigns `OrderId`, sets `item.OrderId` on each OrderItem manually.
- No update or delete — orders are immutable once placed.

---

## IRatingRepository / RatingRepository

```csharp
Task AddRating(Rating rating)
Task<IEnumerable<Rating>> GetAll()
```

Used exclusively by `RatingMiddleware` to log every HTTP request to the `RATING` DB table.
Fields logged: `Host`, `Method`, `Path`, `Referer`, `UserAgent`, `RecordDate`.

---

## IUserHistoryRepository / UserHistoryRepository

```csharp
Task AddOrUpdate(UserHistory record)
Task<List<UserHistory>> GetByUserId(int userId)
```

**Key details:**
- Composite PK: `(UserId, SongId)`.
- `AddOrUpdate`: if record exists for same user+song, updates `ListenedAt`; otherwise inserts.

---

## General Repository Rules

1. Always `async/await` — no `.Result` or `.Wait()`.
2. Call `SaveChangesAsync()` after every write.
3. Return `null` (not exception) when entity not found by ID.
4. No business logic in repositories — data access only.
5. New repository: create interface + implementation, register both as `Scoped` in `Program.cs`.
