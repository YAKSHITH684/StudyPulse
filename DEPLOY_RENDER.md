# 🚀 Deploying StudyPulse on Render (Decoupled Architecture)

StudyPulse is configured for a **decoupled, multi-service deployment** on Render:
1. **Backend Web Service (`studypulse-backend`)**: Python 3.12 FastAPI microservice handling XGBoost risk inference, SHAP root cause attribution, SQLite database, and Groq LLM inference.
2. **Frontend Static Site (`studypulse-frontend`)**: React 18 + Vite SPA deployed on Render's global high-speed CDN, communicating with the backend via HTTPS.

---

## ⚡ Method 1: Automatic Blueprint (1-Click Deployment)

The repository includes a ready-to-use [`render.yaml`](render.yaml) blueprint that spins up both services simultaneously and links them automatically:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Decouple frontend and backend deployments"
   git push origin master
   ```
2. Navigate to your [Render Dashboard](https://dashboard.render.com).
3. Click **"New +"** in the top navigation bar and select **"Blueprint"**.
4. Connect your GitHub repository: **`YAKSHITH684/StudyPulse`**.
5. Render detects `render.yaml` and lists the two services:
   - 🖥️ **`studypulse-backend`** (Python Web Service)
   - 🌐 **`studypulse-frontend`** (Static Site with SPA rewrite rules)
6. Under **Environment Variables**, provide your Groq API key:
   - `GROQ_API_KEY`: *(paste your `gsk_...` key)*
7. Click **"Apply"**.

Render will deploy both services:
- **Backend URL:** `https://studypulse-backend.onrender.com`
- **Frontend URL:** `https://studypulse-frontend.onrender.com`

*(The blueprint automatically wires `VITE_API_URL` on the frontend to the backend's host!)*

---

## 🛠️ Method 2: Manual Setup (Deploying Step-by-Step in Render UI)

If you prefer creating the two services manually in the Render dashboard:

### Step 1: Deploy Backend Web Service
1. In the Render Dashboard, click **"New +"** → **"Web Service"**.
2. Select your repository `YAKSHITH684/StudyPulse`.
3. Configure the fields:
   - **Name:** `studypulse-backend`
   - **Region:** Any (e.g. *Oregon*)
   - **Branch:** `main` (or `master`)
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install --upgrade pip && pip install -r backend/requirements.txt && export PYTHONPATH=backend && python backend/seed_data.py
     ```
   - **Start Command:**
     ```bash
     python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free`
4. In **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `PYTHONPATH` | `backend` |
   | `PYTHON_VERSION` | `3.12.3` |
   | `GROQ_API_KEY` | *(Your Groq API key)* |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` |
5. Click **"Create Web Service"**.
6. Note your backend URL (e.g. `https://studypulse-backend-xxxx.onrender.com`).

---

### Step 2: Deploy Frontend Static Site
1. In the Render Dashboard, click **"New +"** → **"Static Site"**.
2. Select your repository `YAKSHITH684/StudyPulse`.
3. Configure the fields:
   - **Name:** `studypulse-frontend`
   - **Branch:** `main` (or `master`)
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://studypulse-backend-xxxx.onrender.com` |
5. In **Redirects / Rewrites**, add the SPA rewrite rule:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **"Create Static Site"**.

---

## 🔄 Dynamic In-App API Switcher

Even if you deploy the frontend before the backend or change domains later, StudyPulse includes an **in-browser API Endpoint Switcher** on the login screen:
1. Open your frontend URL.
2. At the bottom of the login card, view the active **Backend API** indicator.
3. Click **"Change"** to enter your custom backend URL (e.g. `https://your-custom-backend.onrender.com`).
4. Click **"Save & Ping"** — it immediately tests the `/health` endpoint and saves to your browser!

---

## 🔑 Default Credentials for Login

| Role | Email | Password |
| :--- | :--- | :--- |
| 👑 **Administrator** | `admin@studypulse.edu` | `Admin@123` |
| 👩‍🏫 **Class Teacher** | `teacher@studypulse.edu` | `Teacher@123` |
| 👨‍👩‍👧 **Parent** | `parent@studypulse.edu` | `Parent@123` |

---

## 💡 Notes on Render Free Tier
- **Cold Starts:** When inactive for 15 minutes, Render free-tier web services sleep. The first request may take 30–50 seconds to wake up. The frontend login screen displays a live wake-up notice automatically.
