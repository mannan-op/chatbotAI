<img width="1901" height="911" alt="image" src="https://github.com/user-attachments/assets/8d4cadcd-6cc7-4682-9f0d-ed4c0e2c609d" />

# ChatbotAI

An AI-powered e-commerce assistant that helps users discover products, ask policy questions, and chat in real time with server-sent event (SSE) streaming.

## Overview

ChatbotAI combines a React frontend, an Express API, PostgreSQL, and Groq function-calling to deliver a guided shopping assistant experience:

- Product discovery with tool-driven search
- FAQ lookups for returns, shipping, orders, and warranty
- Real-time streaming chat responses over SSE
- Clerk-based authentication
- Per-user token budget tracking
- Dockerized local development with Nginx reverse proxy

## Architecture

- Client: React + Vite (TypeScript)
- API: Express + TypeScript
- Database: PostgreSQL + Drizzle ORM
- LLM: Groq (`llama-3.3-70b-versatile`) with tool calling
- Auth: Clerk
- Edge proxy: Nginx

Request flow:

1. Browser sends requests to Nginx (`http://localhost`)
2. Nginx routes `/` to client and `/api/*` to server
3. Server validates auth/session and streams chat events over SSE
4. LLM may call tools (`search_products`, `get_faq`)
5. Tool results are injected back into the model context
6. Final response and usage are persisted

## Monorepo Structure

```text
chatbotAI/
  client/      React app (UI)
  server/      Express API, tools, DB schema
  nginx/       Reverse-proxy config
  Docker-compose.yml
  .env.example
```

## Quick Start (Docker Recommended)

### 1. Prerequisites

- Docker Desktop
- A Clerk project
- A Groq API key

### 2. Configure environment

```bash
cp .env.example .env
```

Then update required values in `.env`:

- `GROQ_API_KEY`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- Optional: `OPENAI_API_KEY` (if you add image features later)

### 3. Start the stack

```bash
docker compose up --build -d
```

### 4. Open the app

- App: `http://localhost`
- API health: `http://localhost/api/health`

### 5. Stop the stack

```bash
docker compose down
```

## Local Development (Without Docker)

Use this mode if you prefer running processes directly.

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Run PostgreSQL

Start a local PostgreSQL instance and set `DATABASE_URL` in `.env`.

### 3. Apply schema and seed data

```bash
cd server
npm run db:push
npm run db:seed
```

### 4. Run backend and frontend

In separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

If you are not using Nginx locally, point the client API base URL to `http://localhost:4000`.

## Environment Variables

| Variable                     | Required | Description                        |
| ---------------------------- | -------- | ---------------------------------- |
| `POSTGRES_USER`              | Yes      | PostgreSQL username                |
| `POSTGRES_PASSWORD`          | Yes      | PostgreSQL password                |
| `POSTGRES_DB`                | Yes      | PostgreSQL database name           |
| `DATABASE_URL`               | Yes      | Drizzle/Postgres connection string |
| `GROQ_API_KEY`               | Yes      | Groq API key for chat completions  |
| `CLERK_SECRET_KEY`           | Yes      | Clerk backend secret               |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk frontend publishable key     |
| `OPENAI_API_KEY`             | No       | Optional future image tooling      |
| `PORT`                       | No       | API server port (default `4000`)   |
| `NODE_ENV`                   | No       | Runtime environment                |

## API Endpoints

### Health

- `GET /api/health`
  - Returns service and DB status

### Products

- `GET /api/products`
  - List all products
- `GET /api/products/:id`
  - Get one product
- `POST /api/products` (auth required)
  - Create a product

### Chat

- `POST /api/chat` (auth required)
  - SSE endpoint for chat streaming
  - Server emits events:
    - `delta`: incremental text
    - `tool`: tool execution result payload
    - `done`: final marker with token usage
    - `error`: generic failure message

## Tooling and Data Model

### Model tools

- `search_products`: query catalog by text/category/price/in-stock filters
- `get_faq`: retrieve FAQ answers for policy-like questions

### Core database tables

- `products`
- `faqs`
- `chat_sessions`
- `user_budgets`

## Security and Limits

- Clerk middleware is applied globally on API requests
- Protected routes enforce authenticated user identity
- Chat route tracks token usage per user
- Default budget limit is `50,000` tokens per user

## Scripts

### Client (`client/package.json`)

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

### Server (`server/package.json`)

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run db:push`
- `npm run db:studio`
- `npm run db:seed`

## Troubleshooting

- App loads but API fails:
  - Check `docker compose logs server`
  - Verify Clerk and Groq keys in `.env`
- Auth errors (`401`):
  - Confirm Clerk keys and frontend sign-in flow are configured
- Database connection errors:
  - Verify `DATABASE_URL` and Postgres container health
- SSE appears stuck:
  - Ensure requests are sent through Nginx and buffering is disabled in `nginx/nginx.conf`
