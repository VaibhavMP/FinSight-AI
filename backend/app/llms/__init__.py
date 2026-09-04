from app.llms.base_llm import BaseLLM
from app.llms.llm_factory import LLMFactory

# Lazy import CohereLLM to avoid hard dependency
def __getattr__(name):
    if name == "CohereLLM":
        from app.llms.cohere_llm import CohereLLM
        return CohereLLM
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
