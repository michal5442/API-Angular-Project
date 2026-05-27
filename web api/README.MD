# 🎵 MusicShop Web API

A RESTful Web API built with **ASP.NET Core** and **.NET 9**, written in **C#**.

## 🏗️ Architecture

The project is built in **3 layers**:

- **Application** — Controllers, Middlewares, configuration
- **Services** — Business logic
- **Repositories** — Data access layer

The layers communicate via **Dependency Injection** to achieve full decoupling between them.

## ⚙️ Technology Stack

- **ASP.NET Core / .NET 9**
- **Entity Framework Core** — ORM, Database First approach
- **AutoMapper** — Mapping between Entities and DTOs
- **NLog** — Logging library
- **xUnit + Moq** — Unit and Integration testing

## 🔄 Async Programming

All database access is performed **asynchronously** to free up threads and improve scalability.

## 📦 DTO Layer

- DTOs are implemented as **C# Records** — ideal for immutable data transfer
- Removes circular dependencies between layers
- Mapping between Entities and DTOs is handled by **AutoMapper**

## ⚙️ Configuration

All configurations (connection strings, logging levels) are stored separately from the code in **appsettings.json** files.

## 📋 Logging

- Extensive logging using **NLog**
- All logs are written to file from **Information** level and above
- Critical errors are sent via **email**

## 🛡️ Error Handling

All exceptions are handled centrally by **ErrorHandlingMiddleware**, which:
- Logs the error with TraceId, Path and Method
- Returns a structured JSON error response

## 📊 Rating

All incoming requests are tracked automatically by **RatingMiddleware** and saved to the database, including Host, Method, Path, Referer, User-Agent and timestamp.

## ✅ Tests

- At least **5 Unit Tests**
- At least **5 Integration Tests**
- **2 dedicated tests** for order sum validation (happy path & unhappy path)

## 🔐 Security

- **HTTPS** protocol enforced
- Password strength validation
- Order sum validation — server always recalculates the sum independently
