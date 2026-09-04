from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import get_settings
from app.core.database import engine, Base
from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.message import Message  # noqa: F401

from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.conversations import router as conversations_router
from app.api.chat import router as chat_router
from app.api.compare import router as compare_router
from app.api.health import router as health_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    description="Agentic RAG-Based Financial Document Intelligence & Analysis Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded documents
upload_dir = settings.upload_dir
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(conversations_router)
app.include_router(chat_router)
app.include_router(compare_router)
