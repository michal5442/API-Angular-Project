# MY Music 🎵

A full-stack digital music store with an AI-powered chat assistant.

## Tech Stack

- **Frontend:** Angular 21
- **Backend:** ASP.NET Core Web API (C#)
- **AI Service:** FastAPI (Python) + OpenAI GPT-4o-mini
- **Database:** SQL Server

## Features

- 🎵 Browse and purchase songs
- 🎤 Explore artists and their songs
- ❤️ Save songs to favorites
- 🛒 Shopping cart & checkout
- 👤 User profile & order history
- 🤖 AI chat assistant (Musix) — powered by GPT-4o-mini

## AI Assistant (Musix)

Musix is a smart shopping assistant that can:
- Search songs and artists from the real store inventory
- Show songs by a specific artist (navigates automatically)
- Answer questions about cart, favorites, orders and profile
- Requires login to access personal cart & favorites data

## Project Structure

```
API-Angular-Project/
├── Angular/          # Angular frontend
├── ai_service/       # Python FastAPI AI service
│   ├── chat_service.py
│   └── .env          # OpenAI API key (not committed)
└── web api/          # ASP.NET Core backend
```

## Getting Started

### 1. Angular Frontend
```bash
cd Angular
npm install
ng serve
```
Runs on `http://localhost:4200`

### 2. AI Service
```bash
cd ai_service
pip install fastapi uvicorn openai python-dotenv
uvicorn chat_service:app --port 8001 --reload
```
Create a `.env` file in `ai_service/`:
```
OPENAI_API_KEY=your-key-here
```

### 3. .NET Backend
Open `web api/WebAopiShop.sln` in Visual Studio and run.

## Security Notes

- Never commit `.env` to Git
- Before going live, replace `allow_origins=["*"]` in `chat_service.py` with your actual domain
