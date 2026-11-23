#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================================="
echo "  StudyPulse - Building for Render Cloud Deployment"
echo "=========================================================="

# 1. Install backend dependencies
echo "[1/3] Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 2. Build React Vite Frontend
echo "[2/3] Building React SPA Frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Seed database and train models if not already present
echo "[3/3] Initializing Database & XGBoost + SHAP Artifacts..."
export PYTHONPATH="backend:$PYTHONPATH"
python backend/seed_data.py

echo "=========================================================="
echo "  Build Completed Successfully! Ready to launch."
echo "=========================================================="
