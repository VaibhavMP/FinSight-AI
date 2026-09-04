"""
High-level document processing service.

Orchestrates: text extraction → metadata enrichment → chunking → embedding
generation → Chroma indexing.  Also tracks processing status in the database
so the frontend can show real progress.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from langchain_core.documents import Document
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.documents.data_loading import DataLoader, detect_sections, enrich_metadata
from app.documents.chunking import TextSplitter
from app.embeddings.embeddings_factory import EmbeddingsFactory
from app.indexing.vector_store import ChromaIndex
from app.models.document import ProcessingStatus, Document as DocumentModel

if TYPE_CHECKING:
    pass

settings = get_settings()


class DocumentProcessor:
    """
    Process a single uploaded document through the entire RAG ingestion pipeline.
    """

    def __init__(self, db: Session):
        self.db = db
        self._embeddings = None
        self._vector_index = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            if settings.cohere_api_key:
                self._embeddings = EmbeddingsFactory.create_embeddings(
                    "cohere", cohere_api_key=settings.cohere_api_key
                )
            else:
                self._embeddings = EmbeddingsFactory.create_embeddings("huggingface")
        return self._embeddings

    @property
    def vector_index(self) -> ChromaIndex:
        if self._vector_index is None:
            self._vector_index = ChromaIndex(self.embeddings)
        return self._vector_index

    def _set_status(self, doc: DocumentModel, status: str, page_count: int | None = None):
        doc.processing_status = status
        if page_count is not None:
            doc.page_count = page_count
        self.db.commit()
        self.db.refresh(doc)

    def process(self, doc: DocumentModel) -> dict:
        """Run the full pipeline. Updates ``doc.processing_status`` as it goes."""
        try:
            self._set_status(doc, ProcessingStatus.extracting.value)

            # 1. Load
            loader = DataLoader(doc.file_path)
            docs = loader.get_docs()
            self._set_status(doc, ProcessingStatus.chunking.value, page_count=len(docs))

            # 2. Enrich metadata
            docs = enrich_metadata(
                docs,
                document_id=doc.id,
                filename=doc.filename,
                company=doc.company,
                document_type=doc.document_type,
            )
            docs = detect_sections(docs, company=doc.company)

            # 3. Chunk
            splitter = TextSplitter(
                chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap
            )
            chunks = splitter.split_documents(docs)

            # 4. Build / clear collection
            collection_name = f"doc_{doc.id}"
            try:
                self.vector_index.delete_collection(doc.id)
            except Exception:
                pass

            vs = self.vector_index.create_collection(doc.id)
            self._set_status(doc, ProcessingStatus.embedding.value)

            # 5. Add chunks (embedding happens inside add_documents)
            self.vector_index.add_documents(vs, chunks)
            self._set_status(doc, ProcessingStatus.indexing.value)

            vs.persist()

            # 6. Done
            doc.chroma_collection_id = collection_name
            self._set_status(doc, ProcessingStatus.completed.value)

            return {
                "status": "completed",
                "page_count": len(docs),
                "chunk_count": len(chunks),
                "collection_id": collection_name,
            }

        except Exception as exc:
            self._set_status(doc, ProcessingStatus.failed.value)
            raise
