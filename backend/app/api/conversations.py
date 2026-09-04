from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas import ConversationRead, MessageRead


class ConversationCreate(BaseModel):
    title: str = "New Conversation"


router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("/", response_model=List[ConversationRead])
def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return convs


@router.post("/", response_model=ConversationRead)
def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = Conversation(user_id=current_user.id, title=payload.title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("/{conv_id}/messages", response_model=List[MessageRead])
def get_messages(
    conv_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id, Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    msgs = db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.asc()).all()
    return msgs
