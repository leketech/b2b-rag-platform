import os
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

# In staging/production the pod injects these two non-sensitive vars via ConfigMap.
# The rest of the settings are pulled from AWS Secrets Manager at startup.
_ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
_IS_DEV = _ENVIRONMENT == "development"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env" if _IS_DEV else None,
        extra="ignore",
    )

    # App
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    API_BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # LLM
    LLM_PROVIDER: Literal["openai", "anthropic"] = "openai"
    LLM_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Vector store
    VECTOR_STORE: Literal["pgvector", "pinecone", "chroma"] = "pgvector"
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    PINECONE_INDEX_NAME: str = "b2b-rag"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/b2b_rag"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "b2b-rag-documents"

    # Auth
    AUTH0_DOMAIN: str = ""
    AUTH0_CLIENT_ID: str = ""
    AUTH0_CLIENT_SECRET: str = ""
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Notifications
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "noreply@example.com"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    SLACK_BOT_TOKEN: str = ""
    SLACK_DEPLOY_CHANNEL: str = ""

    # Payments
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Scheduling
    SCHEDULING_PROVIDER: Literal["calcom", "google"] = "calcom"
    CALCOM_API_KEY: str = ""
    GOOGLE_SERVICE_ACCOUNT_JSON: str = ""
    GOOGLE_CALENDAR_ID: str = ""
    DEFAULT_TIMEZONE: str = "UTC"
    GOOGLE_CALENDAR_CLIENT_ID: str = ""
    GOOGLE_CALENDAR_CLIENT_SECRET: str = ""


def _build_settings() -> Settings:
    if _IS_DEV:
        return Settings()

    # In staging/production: pull the JSON secret and pass fields as init kwargs.
    # Init kwargs have the highest pydantic-settings priority, so they override
    # any residual env vars for the same keys — keeping sensitive values out of
    # the container environment entirely.
    secret_name = os.environ["APP_SECRET_NAME"]
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    from app.core.secrets import load_secret
    aws_values = load_secret(secret_name, region)

    # Non-sensitive values that come from the K8s ConfigMap are already present
    # as real env vars; pydantic-settings will pick them up for any field not
    # covered by aws_values.
    return Settings(**aws_values)


settings = _build_settings()
