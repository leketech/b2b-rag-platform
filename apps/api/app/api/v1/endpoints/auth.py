import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.models import Organization

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

router = APIRouter()
password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# ─── Schemas ──────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    email: EmailStr
    organization: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class RegisterResponse(BaseModel):
    organization_id: str
    organization_name: str
    email: EmailStr
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    organization_id: str
    organization_name: str
    email: EmailStr


# ─── Helpers ──────────────────────────────────────────────────


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "organization"


async def unique_slug(db: AsyncSession, base_slug: str) -> str:
    slug = base_slug
    suffix = 2

    while True:
        result = await db.execute(select(Organization.id).where(Organization.slug == slug))
        if result.scalar_one_or_none() is None:
            return slug

        slug = f"{base_slug}-{suffix}"
        suffix += 1


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# ─── Endpoints ────────────────────────────────────────────────


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    existing = await db.execute(
        select(Organization).where(Organization.config["admin_email"].as_string() == req.email)
    )

    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    organization = Organization(
        name=req.organization,
        slug=await unique_slug(db, slugify(req.organization)),
        config={
            "admin_email": req.email,
            "password_hash": password_context.hash(req.password),
            "auth_provider": "local",
            "role": "owner",
        },
    )

    db.add(organization)
    await db.flush()

    return RegisterResponse(
        organization_id=str(organization.id),
        organization_name=organization.name,
        email=req.email,
        message="Workspace created successfully.",
    )


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    # Find the organization by admin email stored in the config JSON
    result = await db.execute(
        select(Organization).where(Organization.config["admin_email"].as_string() == req.email)
    )
    org = result.scalar_one_or_none()

    if org is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Verify the password against the stored hash
    password_hash = org.config.get("password_hash", "")
    if not password_context.verify(req.password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(org.id),
            "email": req.email,
            "org_name": org.name,
        }
    )

    return LoginResponse(
        access_token=access_token,
        organization_id=str(org.id),
        organization_name=org.name,
        email=req.email,
    )


# ─── Google OAuth ─────────────────────────────────────────────


@router.get("/google/login")
async def google_login() -> RedirectResponse:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )
    params = urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    })
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    frontend_url = settings.FRONTEND_URL

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            return RedirectResponse(url=f"{frontend_url}/login?error=google_token_failed")

        token_data = token_resp.json()
        access_token_google = token_data.get("access_token")

        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token_google}"},
        )
        if userinfo_resp.status_code != 200:
            return RedirectResponse(url=f"{frontend_url}/login?error=google_userinfo_failed")

        userinfo = userinfo_resp.json()

    google_id: str = userinfo["sub"]
    email: str = userinfo["email"]
    name: str = userinfo.get("name") or email.split("@")[0]
    avatar_url: str = userinfo.get("picture", "")

    # Find by google_id first, then fall back to matching email
    result = await db.execute(
        select(Organization).where(Organization.config["google_id"].as_string() == google_id)
    )
    org = result.scalar_one_or_none()

    if org is None:
        result = await db.execute(
            select(Organization).where(Organization.config["admin_email"].as_string() == email)
        )
        org = result.scalar_one_or_none()

    if org is None:
        org = Organization(
            name=name,
            slug=await unique_slug(db, slugify(name)),
            config={
                "admin_email": email,
                "google_id": google_id,
                "auth_provider": "google",
                "role": "owner",
                "avatar_url": avatar_url,
            },
        )
        db.add(org)
        await db.flush()
    elif org.config.get("google_id") is None:
        # Link Google to an existing email/password account
        org.config = {**org.config, "google_id": google_id, "avatar_url": avatar_url}
        await db.flush()

    jwt_token = create_access_token(
        data={"sub": str(org.id), "email": email, "org_name": org.name}
    )

    params = urlencode({
        "token": jwt_token,
        "org_id": str(org.id),
        "org_name": org.name,
        "email": email,
    })
    return RedirectResponse(url=f"{frontend_url}/auth/callback?{params}")
