import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User
from .auth import get_password_hash
from .routers import auth, students, risk, interventions, data_pipeline, analytics, audit

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyPulse API",
    description="AI Early-Warning System for Student Dropout - PRASUNEX INNOVATHON 2026",
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

@app.get("/")
def root():
    return {
        "name": "StudyPulse API",
        "tagline": "Detect Early. Explain Clearly. Act in Time.",
        "version": "1.0.0",
        "event": "PRASUNEX INNOVATHON 2026 – Round 3",
        "status": "online"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
