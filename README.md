# Web Search Demo — GPT-4.1 vs GPT-5.2

A side-by-side comparison of web search output from **GPT-4.1** (non-thinking) and **GPT-5.2** (thinking model). Both models are queried in parallel with streaming, and web search is mandatory on every request.

Requests are routed through the [AI Service Router](https://github.com/coolblue-development/ai-service-router), an OpenAI-compatible proxy with automatic failover.

## Prerequisites

- Python 3.11+
- Node.js 18+
- Access to the AI Service Router (token + client name)

## Setup

1. Clone and configure:

```bash
git clone <repo-url> && cd websearch-demo
cp .env.example .env
# Edit .env with your ROUTER_BEARER_TOKEN and ROUTER_CLIENT_HEADER
```

2. Install dependencies:

```bash
# Mac / Linux
make install

# Windows
make.bat install
```

3. Start both servers:

```bash
# Mac / Linux
make dev

# Windows
make.bat dev
```

4. Open http://localhost:5173

## Architecture

```
React (Vite :5173)  →  FastAPI (:8000)  →  AI Service Router  →  OpenAI
```

- **Frontend** sends POST to `/api/search` (proxied by Vite to FastAPI)
- **Backend** calls the AI Service Router's `/router/responses` endpoint with the OpenAI Responses API format, including `web_search_preview` as a required tool
- Responses are streamed via SSE back to the frontend
- GPT-5.2 includes reasoning summaries displayed in a collapsible "Thinking" block

## Environment Variables

| Variable | Description |
|---|---|
| `ROUTER_BASE_URL` | AI Service Router base URL |
| `ROUTER_BEARER_TOKEN` | Bearer token for authentication |
| `ROUTER_CLIENT_HEADER` | Client identifier header |

Model names (`gpt-4.1-2025-04-14`, `gpt-5.2-2025-12-11`) are configured in `frontend/src/App.tsx`.
