# apps/api/Dockerfile
# Multi-stage build for smaller, faster deployments
FROM python:3.11-slim AS builder
WORKDIR /build

# ✅ Copy requirements from build context (apps/api/requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final production image
FROM python:3.11-slim
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /install /usr/local

# ✅ Copy application code from build context (apps/api/.)
COPY . .

# Security: Run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Start Uvicorn with 1 worker (async handles concurrency efficiently)
# On t3.micro (1GB RAM), 4 workers would cause OOMKilled
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]