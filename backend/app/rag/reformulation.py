"""
Query reformulation — migrated and improved from the original AgenticRAG
project.

When a follow-up question references context from the conversation (e.g.
"What about the previous year?" after "What was Apple's revenue?"),
the query is reformulated into a self-contained, searchable question so
that retrieval works correctly.

No chain-of-thought is leaked to the user — only the final answer.
"""

from __future__ import annotations

from typing import List

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

_REFORMULATION_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an expert query reformulation assistant for a
financial document analysis system. Your job is to take a conversation
history and a follow-up question, and produce a single self-contained
question that can be answered by searching financial documents.

Rules:
- If the follow-up is self-contained, return it unchanged.
- If the follow-up depends on prior context (company name, document, year,
  metric, topic), merge that context into a complete question.
- Return ONLY the reformulated question. No explanation. No prefixes.
- Do not mention this is a reformulation.

Examples:
Conversation: User: "What was Apple's revenue in FY2025?"
Follow-up: "What about the previous year?"
Output: "What was Apple's revenue in FY2024?"

Conversation: User: "Compare Apple and Microsoft revenue."
Follow-up: "What about their net income?"
Output: "Compare the net income of Apple and Microsoft."

Conversation: User: "What are the risks in the 2025 annual report?"
Follow-up: "Are there any regulatory risks?"
Output: "What are the regulatory risks in the 2025 annual report?"

Conversation: User: "Hello, how are you?"
Follow-up: "What is the revenue?"
Output: "What is the revenue?"
""",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{question}"),
    ]
)


class QueryReformulator:
    """
    Reformulates follow-up questions using an LLM so that retrieval
    is always performed against a self-contained query.
    """

    def __init__(self, llm):
        self._chain = _REFORMULATION_PROMPT | llm | StrOutputParser()

    def reformulate(self, question: str, chat_history: List) -> str:
        if not chat_history:
            return question

        # Build a compact chat_history list of (role, content) strings
        history_text = []
        for msg in chat_history[-6:]:  # last 6 messages
            if hasattr(msg, "type") and msg.type == "human":
                history_text.append(("human", msg.content))
            elif hasattr(msg, "type") and msg.type == "ai":
                history_text.append(("ai", msg.content))

        if not history_text:
            return question

        try:
            result = self._chain.invoke(
                {"chat_history": history_text, "question": question}
            )
            return result.strip()
        except Exception:
            return question
