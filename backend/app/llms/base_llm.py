"""
Abstract base class for LLM wrappers — migrated from AgenticRAG source project.
"""

from abc import ABC, abstractmethod


class BaseLLM(ABC):
    """Abstract base class for LLM implementations."""

    @abstractmethod
    def generate(self, prompt: str, stream: bool = False):
        pass
