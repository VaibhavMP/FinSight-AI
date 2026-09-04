"""
LLM factory — migrated from AgenticRAG source project.
"""


class LLMFactory:
    """Factory class for creating LLM instances based on a specified provider type."""

    @staticmethod
    def create_llm(llm_type: str, **kwargs):
        if llm_type.lower() == "cohere":
            assert "cohere_api_key" in kwargs, "Please pass `cohere_api_key` argument"
            from app.llms.cohere_llm import CohereLLM
            return CohereLLM(**kwargs)
        else:
            raise ValueError(f"Unsupported LLM type: {llm_type}")
