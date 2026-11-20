# 🚀 Deploying StudyPulse to Render Cloud

StudyPulse is configured for deployment on **Render** (as a unified single-service free-tier Web App or Docker container).

Both the **FastAPI Backend** and the **React Vite Frontend** run together in a single Web Service, avoiding CORS issues and staying 100% within Render's free tier.

---

## ⚡ Method 1: Automatic Blueprint Deployment (Fastest)

Render includes native support for the included [`render.yaml`](render.yaml) blueprint:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Render cloud deployment"
   git push origin master
   ```
2. Open your [Render Dashboard](https://dashboard.render.com).
3. Click **"New +"** in the top-right corner and select **"Blueprint"**.
4. Connect your GitHub repository (`Study-Pluse`).
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name:** `studypulse`
   - **Runtime:** Python 3.12 + Node.js 20
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check:** `/health`
6. Click **"Apply"**.
7. In the **Environment Variables** tab of your new service, add your Groq key:
   - `GROQ_API_KEY`: `gsk_...`
   - `GROQ_MODEL`: `qwen/qwen3.8-27b`
8. Render will build and deploy your app at:  
   `https://studypulse-xxxx.onrender.com`

---

## 🛠️ Method 2: Manual Web Service Setup on Render

If you prefer setting up manually without Blueprints:

1. In the [Render Dashboard](https://dashboard.render.com), click **"New +"** → **"Web Service"**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name:** `studypulse`
   - **Region:** Any (e.g. *Oregon* or *Frankfurt*)
   - **Branch:** `master` (or `main`)
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     ./render-build.sh
     ```
   - **Start Command:**
     ```bash
     python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** `Free`

4. Expand the **Environment Variables** section and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PYTHONPATH` | `backend` | Required for imports |
   | `PYTHON_VERSION` | `3.12.3` | Python runtime |
   | `NODE_VERSION` | `20.12.0` | Required for Vite frontend build |
   | `GROQ_API_KEY` | `gsk_your_groq_api_key` | Your Groq LLM key |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` | Active generative model |

5. Click **"Create Web Service"**.

---

## 🐳 Method 3: Docker Deployment on Render (100% Hermetic)

If you prefer containerized builds, StudyPulse includes a multi-stage production [`Dockerfile`](Dockerfile):

1. Click **"New +"** → **"Web Service"** on Render.
2. Select your repository.
3. Under **Runtime**, select **"Docker"**.
4. Render will automatically read `Dockerfile`, compile the React frontend in Stage 1, bundle it with Python 3.12 and XGBoost in Stage 2, and start the service on port 10000.
5. Add `GROQ_API_KEY` in the Environment Variables tab.
6. Click **"Create Web Service"**.

---

## 🔑 Default Demonstration Logins on Your Deployed App

Once deployed, the app will be live on your `.onrender.com` URL with the new executive login page and instant 1-click persona switchers:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@studypulse.edu` | `Admin@123` | School-wide access, pipeline re-runs, and audit trails |
| 👩‍🏫 **Class Teacher** | `teacher@studypulse.edu` | `Teacher@123` | Section-restricted to Grade 10 (Sections A & B) |
| 👨‍👩‍👧 **Parent** | `parent@studypulse.edu` | `Parent@123` | Restricted solely to linked child **Aryan Rao** (`STU-1004`) |

---

## 💡 Troubleshooting on Render

- **Free Tier Cold Starts:** Render free tier services spin down after 15 minutes of inactivity. When accessed again, the first request may take 30-50 seconds to wake up the service.
- **Viewing Live Logs:** Use the **"Logs"** tab in the Render dashboard to view real-time uvicorn request logs and model predictions.
