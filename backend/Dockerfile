# ==============================================================================
# StudyPulse Backend Microservice Dockerfile (Render, Fly.io, Railway, AWS ECS)
# ==============================================================================
FROM python:3.12-slim

WORKDIR /app

# Install system build dependencies for C-extensions (XGBoost, SHAP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code and sample datasets
COPY app/ ./app/
COPY seed_data.py ./
COPY ../sample_datasets/ /sample_datasets/

# Environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Pre-train XGBoost & seed initial database
RUN python seed_data.py

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
