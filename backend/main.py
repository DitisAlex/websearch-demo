from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.search import router as search_router

app = FastAPI(title="Web Search Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
