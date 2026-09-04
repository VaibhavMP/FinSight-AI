from __future__ import annotations

import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.core.config import get_settings
from app.models.user import User
from app.models.document import Document, DocumentType, ProcessingStatus
from app.schemas import DocumentRead
from app.documents.processor import DocumentProcessor

router = APIRouter(prefix="/api/documents", tags=["Documents"])

settings = get_settings()


@router.get("/", response_model=List[DocumentRead])
def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(
        Document.upload_date.desc()
    ).all()
    return [
        DocumentRead(
            id=d.id,
            filename=d.filename,
            company=d.company,
            document_type=d.document_type,
            upload_date=d.upload_date,
            processing_status=d.processing_status,
            page_count=d.page_count,
            file_size_bytes=d.file_size_bytes,
            chroma_collection_id=d.chroma_collection_id,
        )
        for d in docs
    ]


@router.post("/upload", response_model=DocumentRead)
async def upload_document(
    file: UploadFile = File(...),
    company: str = Form(""),
    document_type: str = Form("other"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Validate file type
    allowed_extensions = {".pdf", ".docx", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_extensions)}",
        )

    # Validate file size
    contents = await file.read()
    file_size = len(contents)
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb} MB",
        )

    # Save file with safe name
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, safe_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create DB record
    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        company=company or "",
        document_type=DocumentType(document_type) if document_type in DocumentType.__members__ else DocumentType.other,
        file_path=file_path,
        file_size_bytes=file_size,
        processing_status=ProcessingStatus.uploaded,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentRead(
        id=doc.id,
        filename=doc.filename,
        company=doc.company,
        document_type=doc.document_type,
        upload_date=doc.upload_date,
        processing_status=doc.processing_status,
        page_count=doc.page_count,
        file_size_bytes=doc.file_size_bytes,
        chroma_collection_id=doc.chroma_collection_id,
    )


@router.post("/{doc_id}/process", response_model=dict)
def process_document(
    doc_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    processor = DocumentProcessor(db)
    try:
        result = processor.process(doc)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(exc)}",
        )


@router.delete("/{doc_id}", response_model=dict)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Remove from Chroma
    try:
        from app.indexing.vector_store import ChromaIndex
        from app.core.config import get_settings
        settings = get_settings()
        from app.embeddings.embeddings_factory import EmbeddingsFactory
        if settings.cohere_api_key:
            embeddings = EmbeddingsFactory.create_embeddings(
                "cohere", cohere_api_key=settings.cohere_api_key
            )
        else:
            embeddings = EmbeddingsFactory.create_embeddings("huggingface")
        index = ChromaIndex(embeddings)
        index.delete_collection(doc.id)
    except Exception:
        pass

    # Remove file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}
