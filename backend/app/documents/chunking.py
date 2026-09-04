"""
Document chunking — migrated and enhanced from AgenticRAG source project.

Uses RecursiveCharacterTextSplitter with financial-document-aware separators
and enriches each chunk with metadata (document_id, filename, page_number, etc.).
"""

from __future__ import annotations

from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextSplitter:
    """
    A wrapper for document splitting using RecursiveCharacterTextSplitter.

    Chunk sizes are tuned for financial documents where individual tables,
    line items, and section headers need to be preserved.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                "; ",
                ", ",
                " ",
                "",
            ],
            keep_separator=True,
        )

    def split_documents(self, docs: List[Document]) -> List[Document]:
        return self.text_splitter.split_documents(docs)
