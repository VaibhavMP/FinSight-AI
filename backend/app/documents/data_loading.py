"""
Document loading and text extraction for PDF, DOCX, and TXT files.

Migrated from the original ``data_loading.py`` (PyMuPDFLoader) and extended
to support DOCX and TXT.
"""

from __future__ import annotations

import os
from typing import List

from langchain_community.document_loaders import (
    Docx2txtLoader,
    PyMuPDFLoader,
    TextLoader,
)
from langchain_core.documents import Document


class DataLoader:
    """
    Load PDF, DOCX, and TXT documents into LangChain Document objects.

    Args:
        - file_path (str): Path to the file.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            self.loader = PyMuPDFLoader(file_path=file_path)
        elif ext == ".docx":
            self.loader = Docx2txtLoader(file_path)
        elif ext == ".txt":
            self.loader = TextLoader(file_path, encoding="utf-8")
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def get_docs(self) -> List[Document]:
        docs = self.loader.load()
        # Normalise metadata — ensure page_number is an int
        for doc in docs:
            if "page" in doc.metadata:
                doc.metadata["page_number"] = doc.metadata["page"]
            doc.metadata.setdefault("page_number", 1)
        return docs


def detect_sections(docs: List[Document], company: str = "") -> List[Document]:
    """
    Heuristic section detection for financial documents.

    Tags each chunk with a ``section`` based on nearby heading-like text.
    """
    known_sections = [
        "balance sheet", "income statement", "cash flow",
        "statement of cash flows", "notes to", "risk factors",
        "management discussion", "executive summary", "auditor",
        "shareholders", "director", "financial review",
        "results of operations", "liquidity", "capital",
        "investments", "debt", "provision", "contingency",
    ]

    for doc in docs:
        content_lower = doc.page_content.lower()
        section = "General"
        for keyword in known_sections:
            if keyword in content_lower:
                section = keyword.title()
                break
        doc.metadata["section"] = section
        if company:
            doc.metadata["company"] = company

    return docs


def enrich_metadata(
    docs: List[Document],
    document_id: int,
    filename: str,
    company: str = "",
    document_type: str = "",
) -> List[Document]:
    """Add standard metadata fields to every chunk."""
    for doc in docs:
        doc.metadata["document_id"] = document_id
        doc.metadata["filename"] = filename
        doc.metadata["company"] = company
        doc.metadata["document_type"] = document_type
        doc.metadata.setdefault("section", "")
        doc.metadata.setdefault("page_number", 1)
    return docs
