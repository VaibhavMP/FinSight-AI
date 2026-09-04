"""
Local LLM wrapper using HuggingFace transformers — used as a fallback
when no Cohere/OpenAI API key is available.

This allows the full RAG pipeline to work end-to-end in local development
without requiring a paid API key. Uses gpt2 (small, fast, CPU-compatible).
"""

from __future__ import annotations

from typing import Any, Optional, Union

from langchain_core.language_models.llms import LLM
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.outputs import Generation, LLMResult
from pydantic import Field, PrivateAttr, model_validator


class LocalLLM(LLM):
    """
    A lightweight local LLM wrapper that uses HuggingFace's
    text-generation pipeline. Suitable for development and demo purposes.

    For production use, configure a COHERE_API_KEY or other supported provider.
    """

    model_name: str = Field(default="gpt2", description="HF model name")
    max_new_tokens: int = Field(default=256, description="Max tokens to generate")

    _pipeline = PrivateAttr(default=None)

    def _ensure_pipeline(self):
        if self._pipeline is None:
            from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
            import torch

            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            if tokenizer.pad_token_id is None:
                tokenizer.pad_token_id = tokenizer.eos_token_id
            model = AutoModelForCausalLM.from_pretrained(self.model_name)
            self._pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device=0 if torch.cuda.is_available() else -1,
                max_new_tokens=self.max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.95,
            )
        return self._pipeline

    def _convert_input(self, prompt: Union[str, list[BaseMessage]]) -> str:
        """Convert a string or list of messages into a text prompt."""
        if isinstance(prompt, str):
            return prompt
        text = ""
        for msg in prompt:
            if isinstance(msg, SystemMessage):
                text += f"System: {msg.content}\n\n"
            elif isinstance(msg, HumanMessage):
                text += f"User: {msg.content}\n"
            elif isinstance(msg, AIMessage):
                text += f"Assistant: {msg.content}\n"
            elif isinstance(msg, str):
                text += msg + "\n"
            elif hasattr(msg, "content"):
                text += f"{msg.content}\n"
        return text.strip()

    def _call(
        self,
        prompt: str,
        stop: Optional[list[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> str:
        pipeline = self._ensure_pipeline()
        try:
            result = pipeline(
                prompt,
                max_new_tokens=self.max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.95,
                return_full_text=False,
            )
            if isinstance(result, list) and len(result) > 0:
                return result[0]["generated_text"]
            return "I'm unable to generate a response at the moment."
        except Exception:
            return "I'm unable to generate a response at the moment."

    def _llm_type(self) -> str:
        return "local_transformers"

    @property
    def _identifying_params(self) -> dict:
        return {"model_name": self.model_name}

    def invoke(self, input: Any, config: Optional[Any] = None, **kwargs: Any) -> Any:
        """Override invoke to handle message lists properly."""
        if isinstance(input, str):
            result = self._call(input)
            return AIMessage(content=result)
        elif isinstance(input, list) and all(hasattr(m, "content") for m in input):
            prompt = self._convert_input(input)
            result = self._call(prompt)
            return AIMessage(content=result)
        elif isinstance(input, list) and all(isinstance(m, str) for m in input):
            prompt = "\n".join(input)
            result = self._call(prompt)
            return AIMessage(content=result)
        else:
            result = self._call(str(input))
            return AIMessage(content=result)
