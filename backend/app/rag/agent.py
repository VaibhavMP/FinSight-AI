"""
Enhanced RAG agent — migrated and extended from the original AgenticRAG
``ReActRagAgent``.

Key changes from the source:
- Per-document Chroma collections for multi-document support.
- Financial-aware system prompt.
- Citation extraction from retrieved chunks.
- Works as a plain retriever-augmented generator (no Streamlit dependency).
"""

from __future__ import annotations

from typing import List, Optional

from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.memory import ConversationBufferMemory
from langchain_core.documents import Document

from app.core.config import get_settings

settings = get_settings()


_FINANCIAL_AGENT_SYSTEM = """
You are **FinSight AI**, an expert AI financial research analyst.
You answer questions about financial documents using only retrieved evidence.

Guidelines:
- Always cite the source document, page number, and section when referencing
  information from the documents.
- Use a table format for structured financial data whenever possible.
- Be concise but thorough.
- If information is not in the retrieved context, say so clearly — do NOT
  hallucinate financial figures.
- When comparing, present data side-by-side.
- Enclose direct quotes in quotation marks.
- Cite page numbers as (p. X).

Plan → Retrieve → Answer.
"""


class FinancialRagAgent:
    """
    ReAct-style RAG agent for financial documents, migrated from the
    original AgenticRAG source and adapted for the FinSight AI workflow.

    Attributes:
        - llm: LangChain-compatible LLM.
        - vector_store: Chroma vector store with indexed documents.
        - memory: ConversationBufferMemory for context retention.
        - retriever: MMR retriever scoped to the vector store.
        - tools: List of tools for the agent.
    """

    def __init__(self, llm, vector_stores: list, k: int = 5):
        self.llm = llm
        self.k = k
        self.memory = ConversationBufferMemory(
            return_messages=True, memory_key="chat_history"
        )
        self.tools = []

        self._prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(_FINANCIAL_AGENT_SYSTEM),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                HumanMessagePromptTemplate.from_template("{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )

        for vs in vector_stores:
            retriever = vs.as_retriever(
                search_type="mmr",
                search_kwargs={"k": k, "fetch_k": k * 4},
            )
            tool = create_retriever_tool(
                retriever,
                name="financial_document_retriever",
                description=(
                    "Searches and returns excerpts from the indexed "
                    "financial documents related to the user query. Use this "
                    "tool whenever the user asks about financial figures, "
                    "risks, or any content from the uploaded documents."
                ),
            )
            self.tools.append(tool)

        self.agent = create_tool_calling_agent(
            llm=llm, tools=self.tools, prompt=self._prompt
        )

    def create_agent_executor(self) -> AgentExecutor:
        return AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=False,
            handle_parsing_errors=True,
            return_intermediate_steps=True,
            memory=self.memory,
        )

    def clear_memory(self):
        self.memory.clear()

    @staticmethod
    def extract_sources(intermediate_steps) -> list[dict]:
        """Extract citation metadata from the retriever's output."""
        sources = []
        for step in intermediate_steps:
            observation = getattr(step, "observation", None)
            if isinstance(observation, str):
                # The retriever tool returns concatenated docs
                # Try to parse them — but we'll use the retriever directly
                # for cleaner metadata in the service layer.
                pass
        return sources
