"""
Tests for the query classifier.
"""
import pytest
from app.rag.query_classifier import classify_query, QueryMode


class TestQueryClassifier:

    def test_casual_query(self):
        assert classify_query("Hello, how are you?") == QueryMode.casual
        assert classify_query("Hi there!") == QueryMode.casual
        assert classify_query("Thanks!") == QueryMode.casual

    def test_financial_rag_query(self):
        assert classify_query("What was the company's revenue in FY2025?") == QueryMode.rag
        assert classify_query("What is the EBITDA?") == QueryMode.rag
        assert classify_query("Show me the balance sheet") == QueryMode.rag

    def test_analysis_query(self):
        assert classify_query("Why did profitability decline?") == QueryMode.analysis
        assert classify_query("What caused the revenue decrease?") == QueryMode.analysis

    def test_comparison_query(self):
        assert classify_query("Compare Apple and Microsoft revenue") == QueryMode.comparison
        assert classify_query("Which company has higher profit?") == QueryMode.comparison

    def test_risk_query(self):
        assert classify_query("What are the major risks?") == QueryMode.risk
        assert classify_query("What regulatory risks does the company face?") == QueryMode.risk

    def test_metric_query(self):
        assert classify_query("Show me the key financial metrics") == QueryMode.metrics
        assert classify_query("What are the financial ratios?") == QueryMode.metrics

    def test_no_documents_returns_casual(self):
        assert classify_query("Tell me about revenue", has_documents=False) == QueryMode.casual

    def test_follow_up_question(self):
        # Questions with previous year context should still be RAG
        assert classify_query("What about the previous year?") == QueryMode.rag
