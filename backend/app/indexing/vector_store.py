"""
Vector store (Chroma) wrapper — migrated and adapted from AgenticRAG source project.

Key change: instead of a single fixed collection, we create per-document
collections (or a single shared collection with a document_id filter) so that
multi-document comparison and per-document retrieval work cleanly.
"""

from __future__ import annotations

from typing import List

from langchain_core.documents import Document

from app.core.config import get_settings

settings = get_settings()


class ChromaIndex:
    """
    Wrapper class for creating and interacting with a Chroma vector store.

    Each document gets its own collection named ``doc_{document_id}`` so that
    retrieval can be scoped per-document or across multiple documents.
    """

    def __init__(self, embeddings):
        self._embeddings = embeddings

    @property
    def _import_chroma(self):
        from langchain_community.vectorstores import Chroma
        return Chroma

    def create_collection(self, document_id: int):
        """Return a Chroma vector store scoped to a single document id."""
        Chroma = self._import_chroma
        collection_name = f"doc_{document_id}"
        vs = Chroma(
            collection_name=collection_name,
            embedding_function=self._embeddings,
            persist_directory=settings.chroma_persist_directory,
        )
        return vs

    def add_documents(self, vs, docs: List[Document]):
        vs.add_documents(documents=docs)
        vs.persist()

    def get_retriever(self, vs, k: int = 5):
        return vs.as_retriever(
            search_type="mmr",
            search_kwargs={"k": k, "fetch_k": k * 4},
        )

    def delete_collection(self, document_id: int):
        Chroma = self._import_chroma
        Chroma.delete_collection(f"doc_{document_id}")
