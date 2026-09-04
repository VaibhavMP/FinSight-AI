from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.document import DocumentType, ProcessingStatus


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class DocumentRead(BaseModel):
    id: int
    filename: str
    company: Optional[str] = None
    document_type: str
    upload_date: datetime
    processing_status: str
    page_count: Optional[int] = None
    file_size_bytes: Optional[int] = None
    chroma_collection_id: Optional[str] = None


class ConversationRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class MessageRead(BaseModel):
    id: int
    conversation_id: int
    question: str
    answer: Optional[str] = None
    created_at: datetime


class SourceRead(BaseModel):
    document: str
    page: Optional[int] = None
    section: Optional[str] = None
    excerpt: Optional[str] = None


class ChatMessage(BaseModel):
    conversation_id: Optional[int] = None
    query: str
    document_ids: Optional[List[int]] = None
    show_reasoning: bool = False


class ChatResponse(BaseModel):
    answer: str
    agent_mode: str
    sources: List[SourceRead] = []
    metrics: List[dict] = []
    conversation_id: Optional[int] = None
    reasoning_steps: Optional[List[str]] = None


class CompareRequest(BaseModel):
    document_ids: List[int]
    metrics: List[str]
