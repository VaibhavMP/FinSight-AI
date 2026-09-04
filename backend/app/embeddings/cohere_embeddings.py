"""
Cohere embedding wrapper — migrated from AgenticRAG source project.
"""

from langchain_cohere.embeddings import CohereEmbeddings as _CohereEmbeddings


class CohereEmbedding:
    """
    Utility class to initialize and access Cohere embedding models.

    Args:
        - cohere_api_key (str): Your Cohere API key.
        - model_name (str): The name of the Cohere embedding model. Defaults to "embed-v4.0".
    """

    def __init__(self, cohere_api_key: str, model_name: str = "embed-v4.0"):
        self.embeddings = _CohereEmbeddings(
            model=model_name, cohere_api_key=cohere_api_key
        )

    def get_embeddings(self):
        return self.embeddings
