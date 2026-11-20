import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AuditLog, Student
from ..schemas import (
    LoginRequest, Token, UserResponse, UserRegisterRequest,
    ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
)
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for password reset verification tokens (email -> {token, expires_at})
RESET_TOKENS: dict = {}

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log audit
    audit = AuditLog(
        user_email=user.email,
        action="LOGIN",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"User {user.full_name} logged in with role {user.role}"
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_name": user.full_name,
        "email": user.email,
        "assigned_grades": user.assigned_grades,
        "assigned_sections": user.assigned_sections,
        "linked_student_id": user.linked_student_id
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Creates a new user account (Teacher, Parent, or Admin) and returns an authentication token.
    """
    email_clean = request.email.strip().lower()

    # Validate email uniqueness
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Validate parent linked student if provided
    linked_stu_id = request.linked_student_id.strip() if request.linked_student_id else None
    if request.role == "parent" and linked_stu_id:
        stu = db.query(Student).filter(Student.student_id == linked_stu_id).first()
        if not stu:
            # Look up case-insensitive
            stu = db.query(Student).filter(Student.student_id.ilike(linked_stu_id)).first()
            if stu:
                linked_stu_id = stu.student_id

    user = User(
        email=email_clean,
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name.strip(),
        role=request.role.lower(),
        assigned_grades=request.assigned_grades or "All",
        assigned_sections=request.assigned_sections or "All",
        linked_student_id=linked_stu_id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    audit = AuditLog(
        user_email=user.email,
        action="REGISTER",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"New user registered: {user.full_name} ({user.role})"
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_name": user.full_name,
        "email": user.email,
        "assigned_grades": user.assigned_grades,
        "assigned_sections": user.assigned_sections,
        "linked_student_id": user.linked_student_id
    }

@router.post("/forgot-password", response_model=PasswordResetResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates password reset by issuing a 6-digit verification code.
    For local prototype evaluation, the code is returned in the response and logged.
    """
    email_clean = request.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered user account found with this email address."
        )

    # Generate 6-digit code with 15 min expiry
    code = str(random.randint(100000, 999999))
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    RESET_TOKENS[email_clean] = {"code": code, "expires_at": expires_at}

    # Audit log
    audit = AuditLog(
        user_email=user.email,
        action="REQUEST_PASSWORD_RESET",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"Password reset requested. Code generated: {code}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": f"Verification code generated for {user.email}. Enter the code below to set a new password.",
        "reset_token": code
    }

@router.post("/reset-password", response_model=PasswordResetResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates verification code and updates the user's password.
    """
    email_clean = request.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Validate token
    token_entry = RESET_TOKENS.get(email_clean)
    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active password reset request found. Please request a new verification code."
        )

    if datetime.datetime.utcnow() > token_entry["expires_at"]:
        del RESET_TOKENS[email_clean]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired (15 minutes limit). Please request a new code."
        )

    if str(request.reset_token).strip() != token_entry["code"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check and try again."
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    # Clear used token
    del RESET_TOKENS[email_clean]

    # Audit log
    audit = AuditLog(
        user_email=user.email,
        action="RESET_PASSWORD_SUCCESS",
        resource_type="USER",
        resource_id=str(user.id),
        details="User password successfully reset."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": "Password successfully updated! You can now sign in with your new password.",
        "reset_token": None
    }
