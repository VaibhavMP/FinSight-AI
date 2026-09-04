"""
Financial analysis service.

Extracts structured financial metrics and risks from retrieved document
chunks using an LLM with a strict prompt that forbids hallucination.
"""

from __future__ import annotations

import re
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field


class FinancialMetric(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None
    year: Optional[str] = None
    confidence: str = "high"


class RiskFinding(BaseModel):
    category: str
    description: str
    source_document: str
    page: Optional[int] = None
    section: Optional[str] = None


_METRIC_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a financial data extraction expert.

From the RETRIEVED CONTEXT below, extract the requested financial metrics.
Return ONLY valid JSON. If a metric cannot be found, set its value to null.
Never make up numbers.

Available metrics: revenue, revenue_growth, gross_profit, operating_income,
operating_margin, ebitda, net_income, net_profit_margin, eps, assets,
liabilities, debt, equity, cash_flow, operating_cash_flow, free_cash_flow.

{{
  "revenue": "value or null",
  "revenue_year": "year or null",
  "revenue_source": "document and page or null",
  ...
}}

For each value found, also record:
- the year or period it refers to
- the source document name and page number

If nothing is found, output {"metrics": [], "note": "No metrics found in retrieved context."}""",
        ),
        ("human", "RETRIEVED CONTEXT:\n{context}\n\nREQUESTED METRICS: {metrics}\n\nJSON:"),
    ]
)

_RISK_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a financial risk analyst.

From the RETRIEVED CONTEXT below, extract risk findings.
Return ONLY a JSON array of objects with keys:
category, description, source_document, page, section.

Categories: Financial Risk, Operational Risk, Market Risk,
Regulatory Risk, Liquidity Risk, Debt Risk, Strategic Risk.

If no risks are found, return an empty array [].

Never make up risks that are not in the text.""",
        ),
        ("human", "RETRIEVED CONTEXT:\n{context}\n\nRISKS JSON:"),
    ]
)


class FinancialAnalyzer:
    """Extract structured financial metrics from text chunks."""

    def __init__(self, llm):
        self._llm = llm
        self._chain = _METRIC_PROMPT | llm | JsonOutputParser()

    def extract_metrics(
        self, context: str, requested_metrics: List[str]
    ) -> dict:
        if not requested_metrics:
            requested_metrics = [
                "revenue", "gross_profit", "net_income",
                "operating_income", "ebitda", "assets",
                "liabilities", "debt", "equity",
                "cash_flow", "eps", "operating_margin",
                "net_profit_margin",
            ]

        metrics_str = ", ".join(requested_metrics)
        try:
            result = self._chain.invoke(
                {"context": context, "metrics": metrics_str}
            )
            if isinstance(result, str):
                # JSON parse failed — return empty
                return {"metrics": [], "note": "Failed to parse metrics"}
            return result
        except Exception:
            return {"metrics": [], "note": "Extraction failed"}


class RiskExtractor:
    """Extract and classify financial risks from text chunks."""

    def __init__(self, llm):
        self._llm = llm
        self._chain = _RISK_PROMPT | llm | JsonOutputParser()

    def extract_risks(self, context: str) -> List[RiskFinding]:
        try:
            result = self._chain.invoke({"context": context})
            if isinstance(result, list):
                return [RiskFinding(**r) for r in result if isinstance(r, dict)]
            return []
        except Exception:
            return []
