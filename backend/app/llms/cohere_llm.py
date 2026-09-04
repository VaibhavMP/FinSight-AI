"""
Cohere LLM wrapper — migrated from AgenticRAG source project.
"""

from typing import Union, Iterator

from langchain_cohere.chat_models import ChatCohere

from app.llms.base_llm import BaseLLM


class CohereLLM(BaseLLM):
    """
    Cohere LLM implementation using LangChain's ChatCohere.

    Args:
        - cohere_api_key (str): The API key for Cohere.
        - model_name (str): Model name. Defaults to "command-a-03-2025".
    """

    def __init__(self, cohere_api_key: str, model_name: str = "command-a-03-2025"):
        super().__init__()
        self.chat_model = ChatCohere(model=model_name, cohere_api_key=cohere_api_key)

    def get_llm(self):
        return self.chat_model

    def generate(self, prompt: str, stream: bool = False) -> Union[str, Iterator[str]]:
        if stream:
            return self.chat_model.stream(prompt)
        else:
            return self.chat_model.invoke(prompt).content
