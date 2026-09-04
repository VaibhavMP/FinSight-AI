from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DocumentType(str, Enum):
    annual_report = "annual_report"
    quarterly_report = "quarterly_report"
    investor_presentation = "investor_presentation"
    balance_sheet = "balance_sheet"
    income_statement = "income_statement"
    cash_flow = "cash_flow"
    research_report = "research_report"
    other = "other"


class ProcessingStatus(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    extracting = "extracting"
    chunking = "chunking"
    embedding = "embedding"
    indexing = "indexing"
    completed = "completed"
    failed = "failed"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    company: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    document_type: Mapped[str] = mapped_column(
        String(50), default=DocumentType.other.value, nullable=False
    )
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    upload_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    processing_status: Mapped[str] = mapped_column(
        String(50), default=ProcessingStatus.uploaded.value, nullable=False
    )
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    chroma_collection_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
