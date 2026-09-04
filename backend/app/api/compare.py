from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas import CompareRequest, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/compare", tags=["Comparison"])

_rag_service = RAGService()


@router.post("/", response_model=ChatResponse)
def compare_documents(
    payload: CompareRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if len(payload.document_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 documents are required for comparison",
        )

    # Verify ownership
    docs = db.query(Document).filter(
        Document.id.in_(payload.document_ids),
        Document.user_id == current_user.id,
    ).all()
    if len(docs) != len(payload.document_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more documents not found",
        )

    # Build a comparison query from the requested metrics
    metric_names = payload.metrics if payload.metrics else [
        "revenue", "net_income", "operating_margin", "debt", "cash_flow", "eps"
    ]
    metric_str = ", ".join(metric_names)
    query = (
        f"Compare {metric_str} across the selected documents. "
        f"Present the comparison in a table and explain the differences."
    )

    result = _rag_service.process_query(
        query=query,
        document_ids=payload.document_ids,
        chat_history=[],
        show_reasoning=False,
    )

    # Add document context to sources
    result["agent_mode"] = "comparison"

    return ChatResponse(
        answer=result["answer"],
        agent_mode="comparison",
        sources=result["sources"],
        metrics=result["metrics"],
        conversation_id=None,
        reasoning_steps=None,
    )
