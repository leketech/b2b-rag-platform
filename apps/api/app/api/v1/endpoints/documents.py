# app/api/v1/endpoints/documents.py
from fastapi import APIRouter

router = APIRouter()  # ✅ Must be at top level, not inside a function


@router.get("/")
def get_documents():
    return {"status": "ok"}
