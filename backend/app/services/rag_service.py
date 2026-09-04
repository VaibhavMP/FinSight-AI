from __future__ import annotations

from typing import List, Optional

from langchain_core.documents import Document

from app.core.config import get_settings
from app.embeddings.embeddings_factory import EmbeddingsFactory
from app.indexing.vector_store import ChromaIndex
from app.rag.agent import FinancialRagAgent
from app.rag.query_classifier import QueryMode
from app.rag.reformulation import QueryReformulator

settings = get_settings()


class RAGService:
    """
    Central orchestration service for document-aware querying.

    Responsibilities:
    - Load the appropriate LLM and embeddings.
    - Retrieve relevant chunks from one or more document collections in Chroma.
    - Reformulate follow-up queries using conversation history.
    - Route to casual-chat, RAG, analysis, comparison, risk, or metrics mode.
    - Generate grounded answers with citations.
    - Persist conversations and messages to MySQL.
    """

    def __init__(self):
        self._llm = None
        self._embeddings = None
        self._vector_index = None
        self._reformulator = None

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
    def llm(self):
        if self._llm is None:
            from app.llms.llm_factory import LLMFactory
            if settings.cohere_api_key:
                cohere_llm = LLMFactory.create_llm(
                    "cohere",
                    cohere_api_key=settings.cohere_api_key,
                    model_name=settings.llm_model,
                )
                self._llm = cohere_llm.get_llm()
            else:
                # Fallback to local LLM when no API key is configured
                local_llm = LLMFactory.create_llm(
                    "local",
                    model_name="gpt2",
                    max_new_tokens=128,
                )
                self._llm = local_llm
        return self._llm

    @property
    def vector_index(self) -> ChromaIndex:
        if self._vector_index is None:
            self._vector_index = ChromaIndex(self.embeddings)
        return self._vector_index

    @property
    def reformulator(self) -> QueryReformulator:
        if self._reformulator is None and self.llm is not None:
            self._reformulator = QueryReformulator(self.llm)
        return self._reformulator

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def _get_vector_stores(self, document_ids: List[int]):
        """Load Chroma collections for the given document ids."""
        stores = []
        for doc_id in document_ids:
            try:
                vs = self.vector_index.create_collection(doc_id)
                stores.append(vs)
            except Exception:
                continue
        return stores

    def retrieve(
        self,
        query: str,
        document_ids: List[int],
        k: int = 5,
    ) -> List[Document]:
        """Retrieve relevant chunks from the specified document collections."""
        stores = self._get_vector_stores(document_ids)
        if not stores:
            return []

        retriever = None
        # Use the first store's retriever (multi-store merge could use
        # MultiVectorRetriever, but for simplicity we search each store)
        all_docs: List[Document] = []
        for vs in stores:
            ret = vs.as_retriever(
                search_type="mmr",
                search_kwargs={"k": k, "fetch_k": k * 4},
            )
            docs = ret.invoke(query)
            all_docs.extend(docs)

        # Deduplicate by (page_content, metadata)
        seen = set()
        unique = []
        for doc in all_docs:
            key = doc.page_content[:200]
            if key not in seen:
                seen.add(key)
                unique.append(doc)

        return unique[:k * 2]

    # ------------------------------------------------------------------
    # Answer Generation
    # ------------------------------------------------------------------

    def _generate_casual_response(self, query: str) -> str:
        """Simple response without retrieval for casual conversation."""
        casual_prompt = (
            "You are FinSight AI, a friendly AI financial assistant. Respond "
            "naturally to the user's message. Keep responses brief and friendly.\n\n"
            f"User: {query}\nFinSight AI:"
        )
        if self.llm is not None:
            try:
                return self.llm.invoke(casual_prompt).content
            except Exception:
                pass
        return "Hello! I'm FinSight AI. Upload a financial document and I'll help you analyze it."

    def _generate_rag_answer(
        self,
        query: str,
        context_docs: List[Document],
        chat_history,
    ) -> str:
        """Generate a grounded answer from retrieved context."""
        if not context_docs:
            return (
                "I wasn't able to find relevant information in the selected "
                "document(s) to answer that question."
            )

        context = "\n\n".join(
            f"[Source: {d.metadata.get('filename', 'doc')}, "
            f"p. {d.metadata.get('page_number', '?')}, "
            f"section: {d.metadata.get('section', 'N/A')}]"
            f"\n{d.page_content}"
            for d in context_docs
        )

        answer_prompt = f"""You are FinSight AI, an expert financial analyst.
Using ONLY the following retrieved context, answer the user's question.
Cite sources as (DocumentName, p. X). Do NOT hallucinate numbers. If the
context does not contain the answer, say so clearly.

CONTEXT:
{context}

CONVERSATION HISTORY:
{self._format_history(chat_history)}

QUESTION: {query}

ANSWER:"""
        if self.llm is not None:
            try:
                return self.llm.invoke(answer_prompt).content
            except Exception:
                pass
        return "I'm unable to generate a response at the moment."

    def _format_history(self, chat_history) -> str:
        if not chat_history:
            return ""
        lines = []
        for msg in chat_history[-8:]:
            role = "User" if (hasattr(msg, "type") and msg.type == "human") else "Assistant"
            lines.append(f"{role}: {msg.content}")
        return "\n".join(lines)

    def _extract_sources(self, docs: List[Document]) -> List[dict]:
        """Build citation objects from retrieved documents."""
        sources = []
        for doc in docs:
            sources.append(
                {
                    "document": doc.metadata.get("filename", "Unknown Document"),
                    "page": doc.metadata.get("page_number"),
                    "section": doc.metadata.get("section", "N/A"),
                    "excerpt": doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else ""),
                    "chunk_id": doc.metadata.get("chunk_id", ""),
                    "document_id": doc.metadata.get("document_id", None),
                    "company": doc.metadata.get("company", ""),
                    "document_type": doc.metadata.get("document_type", ""),
                }
            )
        return sources

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def process_query(
        self,
        query: str,
        document_ids: List[int],
        chat_history=None,
        show_reasoning: bool = False,
    ) -> dict:
        """
        Process a user query end-to-end.

        Returns a dict matching the ChatResponse schema.
        """
        if chat_history is None:
            chat_history = []

        reasoning_steps: List[str] = []

        # Step 1: Classify the query
        from app.rag.query_classifier import classify_query
        mode = classify_query(query, has_documents=bool(document_ids))

        if mode == QueryMode.casual and not document_ids:
            mode = QueryMode.casual

        reasoning_steps.append(f"Query mode: {mode.value}")

        # Step 2: Reformulate if there's history
        effective_query = query
        if self.reformulator and chat_history:
            try:
                effective_query = self.reformulator.reformulate(query, chat_history)
                if effective_query != query:
                    reasoning_steps.append(f"Reformulated query: {effective_query}")
            except Exception:
                pass

        # Step 3: Retrieve
        context_docs: List[Document] = []
        if mode in (QueryMode.rag, QueryMode.analysis, QueryMode.comparison, QueryMode.risk, QueryMode.metrics):
            if document_ids:
                reasoning_steps.append("Retrieving from financial documents...")
                context_docs = self.retrieve(effective_query, document_ids, k=settings.k_retrieved_documents)
                reasoning_steps.append(f"Retrieved {len(context_docs)} relevant chunks")
            else:
                reasoning_steps.append("No documents selected for retrieval")

        # Step 4: Generate
        if mode == QueryMode.casual:
            answer = self._generate_casual_response(query)
            reasoning_steps.append("Responded without retrieval (casual chat)")
            sources = []
        else:
            answer = self._generate_rag_answer(effective_query, context_docs, chat_history)
            sources = self._extract_sources(context_docs)
            reasoning_steps.append("Generated grounded answer with citations")

        # Step 5: Financial analysis if needed
        metrics = []
        if self.llm is not None and mode in (QueryMode.analysis, QueryMode.metrics):
            from app.financial.analyzer import FinancialAnalyzer
            analyzer = FinancialAnalyzer(self.llm)
            context_text = "\n\n".join(d.page_content for d in context_docs)
            metric_result = analyzer.extract_metrics(context_text, [])
            if isinstance(metric_result, dict) and "metrics" in metric_result:
                metrics = metric_result.get("metrics", [])
            elif isinstance(metric_result, dict):
                metrics = metric_result
            reasoning_steps.append(f"Extracted {len(metrics)} financial metrics")

        # Step 6: Risk extraction
        if self.llm is not None and mode == QueryMode.risk:
            from app.financial.analyzer import RiskExtractor
            extractor = RiskExtractor(self.llm)
            context_text = "\n\n".join(d.page_content for d in context_docs)
            risks = extractor.extract_risks(context_text)
            risk_metrics = [
                {"name": "risk", "value": r.description,
                 "category": r.category, "source": r.source_document,
                 "page": r.page}
                for r in risks
            ]
            metrics.extend(risk_metrics)
            reasoning_steps.append(f"Extracted {len(risks)} risk findings")

        return {
            "answer": answer,
            "agent_mode": mode.value,
            "sources": sources,
            "metrics": metrics,
            "reasoning_steps": reasoning_steps if show_reasoning else None,
        }
