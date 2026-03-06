# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Side-by-side web search comparison of GPT-4.1 (non-thinking) vs GPT-5.2 (thinking). Requests go through the AI Service Router (OpenAI-compatible proxy) using the Responses API with mandatory `web_search_preview` tool.

## Architecture

```
frontend/ (React + Tailwind + Vite :5173) → backend/ (FastAPI :8000) → AI Service Router → OpenAI
```

- **Backend**: FastAPI app in `backend/`. Entry point: `backend/main.py`. Config loaded from `.env` via `backend/config.py`. Router client in `backend/router_client.py` calls `/router/responses` with streaming. SSE endpoint in `backend/api/search.py`.
- **Frontend**: React + Tailwind in `frontend/`. Vite proxies `/api/*` to backend. Streaming hook in `src/hooks/useStreamingResponse.ts` parses SSE. Components: `SearchForm`, `ComparisonView`, `ResultPanel`, `ThinkingBlock`.

## Commands

```bash
make install     # Create .venv, install Python + npm deps
make dev         # Start both backend and frontend
make backend     # Start only FastAPI (uvicorn with reload)
make frontend    # Start only Vite dev server
```

Windows: use `make.bat` instead of `make`.

## Environment

- Python 3.11+, virtual environment in `.venv`
- Node.js 18+, frontend deps in `frontend/node_modules`
- Environment variables in `.env` (see `.env.example`)
