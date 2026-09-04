"""
Query classification — determines how to route a user query.

The original AgenticRAG determined whether to retrieve or not via the ReAct
agent.  FinSight AI needs explicit routing so the frontend can show the
correct activity trace and so financial-analysis / comparison tools are
available.
"""

from __future__ import annotations

from enum import Enum
from typing import List


class QueryMode(str, Enum):
    casual = "casual"
    rag = "rag"
    analysis = "analysis"
    comparison = "comparison"
    risk = "risk"
    metrics = "metrics"
    unknown = "unknown"


_CASUAL_PATTERNS = [
    "hello", "hi ", "hey", "how are", "good morning", "good evening",
    "thanks", "thank you", "bye", "goodbye", "what's up", "greeting",
    "ok ", "okay ", "cool", "nice", "haha", "lol", "sure",
    "i agree", "got it", "alright", "cheers",
]

_FINANCIAL_RAG_PATTERNS = [
    "revenue", "profit", "loss", "income", "earnings", "eps",
    "asset", "liability", "debt", "cash flow", "operating cash",
    "free cash", "dividend", "margin", "ratio", "expenses",
    "balance sheet", "income statement", "cash flow statement",
    "quarter", "annual report", "annual filing", "filing",
    "growth", "turnover", "cost", "gross profit", "ebitda",
    "net income", "operating income", "total assets", "total liabilities",
    "shareholder", "equity", "capital",
]

_ANALYSIS_PATTERNS = [
    "why did", "why was", "why is", "what caused", "what drove",
    "decline", "decreased", "increased", "improve", "deteriorat",
    "change in", "fluctuat", "trend", "impact", "effect of",
]

_COMPARISON_PATTERNS = [
    "compare", "comparison", "versus", "vs ", "vs.", "difference between",
    "which is better", "which has higher", "which has lower",
    "which company", "which is larger", "which is smaller",
    "rank", "contrast", "more profitable", "better performer",
    "compare the", "compared to", "versus the",
]

_RISK_PATTERNS = [
    "risk", "risks", "risk factor", "exposure",
    "uncertainty", "contingency", "threat", "vulnerabilit",
    "compliance", "regulatory", "litigation", "lawsuit",
]

_METRIC_PATTERNS = [
    "metric", "metrics", "financial ratio", "ratios",
    "key performance", "kpki",
]


def classify_query(query: str, has_documents: bool = True) -> QueryMode:
    """
    Classify a user query into one of the routing modes.

    Classification falls back to casual chat when there are no documents
    to search.
    """
    q = query.lower().strip()

    if not has_documents:
        return QueryMode.casual

    # Order matters — comparison/risk/metrics/analysis are checked first
    # because they often contain financial keywords too.

    for pattern in _COMPARISON_PATTERNS:
        if pattern in q:
            return QueryMode.comparison

    for pattern in _RISK_PATTERNS:
        if pattern in q:
            return QueryMode.risk

    for pattern in _METRIC_PATTERNS:
        if pattern in q:
            return QueryMode.metrics

    for pattern in _ANALYSIS_PATTERNS:
        if pattern in q:
            return QueryMode.analysis

    for pattern in _FINANCIAL_RAG_PATTERNS:
        if pattern in q:
            return QueryMode.rag

    for pattern in _CASUAL_PATTERNS:
        if pattern in q:
            return QueryMode.casual

    if has_documents:
        return QueryMode.rag

    return QueryMode.casual
