from __future__ import annotations

import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


def _str_to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        v = value.strip().lower()
        if v in ("true", "1", "yes", "on", "true"):
            return True
        if v in ("false", "0", "no", "off", "", "none"):
            return False
    return False


from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "FinSight AI"
    app_env: str = "development"
    debug: bool = False

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        return _str_to_bool(v)

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database – MySQL
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "finsight"
    mysql_password: str = "finsight"
    mysql_database: str = "finsight"
    # If set, this overrides the MySQL URL entirely (useful for SQLite in dev)
    database_url: str = ""

    @property
    def database_url_resolved(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # AI providers
    cohere_api_key: str = ""
    llm_api_key: str = ""
    llm_provider: str = "cohere"
    llm_model: str = "command-a-03-2025"

    # Embeddings
    embedding_model: str = "embed-v4.0"
    embedding_provider: str = "cohere"
    hf_embedding_model: str = "sentence-transformers/all-mpnet-base-v2"

    # Chroma
    chroma_persist_directory: str = "./chroma_db"

    # File upload
    upload_dir: str = "./uploaded_files"
    max_file_size_mb: int = 50
    chunk_size: int = 1000
    chunk_overlap: int = 200
    k_retrieved_documents: int = 5

    # Bcrypt
    bcrypt_rounds: int = 12


@lru_cache()
def get_settings() -> Settings:
    return Settings()
