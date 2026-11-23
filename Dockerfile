# ==============================================================================
# StudyPulse Production Dockerfile (Render, Railway, Fly.io, or Local Docker)
# ==============================================================================

# Stage 1: Build React Vite Frontend (Debian glibc runtime with expanded stack)
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Expand V8 call stack and memory to prevent deep AST parser recursion in Rollup
ENV NODE_OPTIONS="--max-old-space-size=4096 --stack-size=65536"

COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Runtime & Static SPA Host
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies for C-extensions (XGBoost, SHAP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application and data
COPY backend/ ./backend/
COPY sample_datasets/ ./sample_datasets/

# Copy built frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set environment
ENV PYTHONPATH=/app/backend
ENV PORT=10000

# Seed database and pre-train XGBoost model
RUN python backend/seed_data.py

EXPOSE 10000

CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
