from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class EmbeddingsFactory:
    """
    Factory for creating embedding models, migrated from the original AgenticRAG
    project. Supports Cohere and HuggingFace providers.
    """

    @staticmethod
    def create_embeddings(provider: str, **kwargs):
        if provider.lower() == "cohere":
            from app.embeddings.cohere_embeddings import CohereEmbedding
            assert "cohere_api_key" in kwargs, "Please pass `cohere_api_key` argument"
            return CohereEmbedding(**kwargs).get_embeddings()

        elif provider.lower() == "huggingface":
            from app.embeddings.hf_embeddings import HFEmbedding
            return HFEmbedding(**kwargs).get_embeddings()

        else:
            raise ValueError(f"Unsupported embeddings model provider: {provider}")
