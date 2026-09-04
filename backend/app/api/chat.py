from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas import ChatMessage, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/chat", tags=["Chat"])

_rag_service = RAGService()


@router.post("/", response_model=ChatResponse)
def chat(
    payload: ChatMessage,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Get or create conversation
    if payload.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == payload.conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conv = Conversation(user_id=current_user.id, title=payload.query[:100])
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Load chat history for this conversation
    history_msgs = db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(Message.created_at.asc()).all()

    chat_history = []
    for msg in history_msgs:
        chat_history.append(HumanMessage(content=msg.question))
        if msg.answer:
            chat_history.append(AIMessage(content=msg.answer))

    # Process the query
    result = _rag_service.process_query(
        query=payload.query,
        document_ids=payload.document_ids or [],
        chat_history=chat_history,
        show_reasoning=payload.show_reasoning,
    )

    # Save messages
    human_msg = Message(
        conversation_id=conv.id,
        question=payload.query,
        answer=result["answer"],
    )
    db.add(human_msg)
    db.commit()
    db.refresh(human_msg)

    # Update conversation title if it was auto-created
    if not payload.conversation_id and conv.title == payload.query[:100]:
        # Try to generate a better title
        conv.title = payload.query[:100] if len(payload.query) <= 100 else conv.title
        db.commit()
        db.refresh(conv)

    # Update updated_at
    from datetime import datetime, timezone
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()

    return ChatResponse(
        answer=result["answer"],
        agent_mode=result["agent_mode"],
        sources=result["sources"],
        metrics=result["metrics"],
        conversation_id=conv.id,
        reasoning_steps=result.get("reasoning_steps"),
    )
