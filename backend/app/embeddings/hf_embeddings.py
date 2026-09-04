"""
HuggingFace embedding wrapper — migrated from AgenticRAG source project.
"""

from langchain_huggingface.embeddings import HuggingFaceEmbeddings


class HFEmbedding:
    """
    Utility class to initialize and access Hugging Face embedding models.

    Args:
        - model_name (str): Hugging Face model name.
            Defaults to "sentence-transformers/all-mpnet-base-v2".
    """

    def __init__(self, model_name: str = "sentence-transformers/all-mpnet-base-v2"):
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)

    def get_embeddings(self):
        return self.embeddings
