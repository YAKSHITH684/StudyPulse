import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User
from .auth import get_password_hash
from .routers import auth, students, risk, interventions, data_pipeline, analytics, audit, chatbot, tutor, multilingual, llm

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyPulse API",
    description="AI Early-Warning System for Student Dropout",
    version="1.0.0"
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(risk.router)
app.include_router(students.router)
app.include_router(interventions.router)
app.include_router(data_pipeline.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(chatbot.router)
app.include_router(tutor.router)
app.include_router(multilingual.router)
app.include_router(llm.router)

@app.on_event("startup")
def init_default_users():
    """Ensure default users exist on startup for quick demonstration."""
    db = SessionLocal()
    try:
        # 1. Admin
        admin = db.query(User).filter(User.email == "admin@studypulse.edu").first()
        if not admin:
            admin = User(
                email="admin@studypulse.edu",
                hashed_password=get_password_hash("Admin@123"),
                full_name="Principal / Academic Director",
                role="admin",
                assigned_grades="All",
                assigned_sections="All"
            )
            db.add(admin)

        # 2. Teacher (Grade 10, Sections A & B)
        teacher = db.query(User).filter(User.email == "teacher@studypulse.edu").first()
        if not teacher:
            teacher = User(
                email="teacher@studypulse.edu",
                hashed_password=get_password_hash("Teacher@123"),
                full_name="Ms. Ananya Sharma (Grade 10 Lead)",
                role="teacher",
                assigned_grades="10",
                assigned_sections="A,B"
            )
            db.add(teacher)

        # 3. Parent (Linked to STU-1004)
        parent = db.query(User).filter(User.email == "parent@studypulse.edu").first()
        if not parent:
            parent = User(
                email="parent@studypulse.edu",
                hashed_password=get_password_hash("Parent@123"),
                full_name="Mr. Rajesh Rao (Parent of Aryan Rao)",
                role="parent",
                assigned_grades="",
                assigned_sections="",
                linked_student_id="STU-1004"
            )
            db.add(parent)

        db.commit()
    finally:
        db.close()

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/health")
def health():
    return {"status": "healthy"}

# Serve frontend build if dist directory exists (e.g. for Render single-service deployment)
dist_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("frontend/dist"),
    Path("dist")
]
frontend_dist = next((p for p in dist_paths if p.exists() and (p / "index.html").exists()), None)

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static_assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path:
            target_file = frontend_dist / full_path
            if target_file.exists() and target_file.is_file():
                return FileResponse(target_file)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": "StudyPulse API",
            "tagline": "Detect Early. Explain Clearly. Act in Time.",
            "version": "1.0.0",
            "status": "online"
        }
