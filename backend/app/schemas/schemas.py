"""
NyayaAI - Pydantic Schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: str = "judge"
    court_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    court_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------------
# Case Schemas
# ---------------------------------------------------------------------------

class CaseCreate(BaseModel):
    title: str
    case_type: str  # "criminal" or "civil"
    case_number: str
    description: Optional[str] = None
    plaintiff_name: Optional[str] = None
    defendant_name: Optional[str] = None
    plaintiff_lawyer: Optional[str] = None
    defendant_lawyer: Optional[str] = None
    court_name: Optional[str] = None
    filing_date: Optional[datetime] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    plaintiff_name: Optional[str] = None
    defendant_name: Optional[str] = None


class CaseOut(BaseModel):
    id: UUID
    case_number: str
    title: str
    case_type: str
    status: str
    description: Optional[str]
    plaintiff_name: Optional[str]
    defendant_name: Optional[str]
    plaintiff_lawyer: Optional[str]
    defendant_lawyer: Optional[str]
    court_name: Optional[str]
    filing_date: Optional[datetime]
    ai_summary: Optional[str]
    ai_key_facts: Optional[list]
    ai_timeline: Optional[list]
    ai_tags: Optional[list]
    judge_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CaseListOut(BaseModel):
    id: UUID
    case_number: str
    title: str
    case_type: str
    status: str
    plaintiff_name: Optional[str]
    defendant_name: Optional[str]
    court_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Document Schemas
# ---------------------------------------------------------------------------

class DocumentOut(BaseModel):
    id: UUID
    case_id: UUID
    filename: str
    original_filename: str
    file_type: str
    file_size: Optional[int]
    document_type: str
    is_processed: bool
    ai_summary: Optional[str]
    ai_entities: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Evidence Schemas
# ---------------------------------------------------------------------------

class EvidenceOut(BaseModel):
    id: UUID
    case_id: UUID
    title: str
    description: Optional[str]
    evidence_type: Optional[str]
    strength: Optional[str]
    ai_analysis: Optional[str]
    relevance_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Prediction Schemas
# ---------------------------------------------------------------------------

class PredictionOut(BaseModel):
    id: UUID
    case_id: UUID
    predicted_outcome: Optional[str]
    confidence_score: Optional[float]
    reasoning: Optional[str]
    relevant_laws: Optional[list]
    similar_case_ids: Optional[list]
    risk_factors: Optional[list]
    disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Similar Case Schemas
# ---------------------------------------------------------------------------

class SimilarCaseOut(BaseModel):
    id: UUID
    case_reference: str
    title: str
    case_type: Optional[str]
    court: Optional[str]
    year: Optional[int]
    summary: Optional[str]
    outcome: Optional[str]
    key_laws: Optional[list]
    similarity_score: Optional[float] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Chat Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    case_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    reply: str
    case_id: Optional[UUID] = None
    sources: Optional[list] = None


# ---------------------------------------------------------------------------
# Analysis Schemas
# ---------------------------------------------------------------------------

class AnalysisRequest(BaseModel):
    case_id: UUID


class FullAnalysisOut(BaseModel):
    case: CaseOut
    documents: list[DocumentOut]
    evidence: list[EvidenceOut]
    prediction: Optional[PredictionOut]
    similar_cases: list[SimilarCaseOut]
    timeline: Optional[list]


# ---------------------------------------------------------------------------
# Dashboard Schemas
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_cases: int
    pending_analysis: int
    completed_analysis: int
    criminal_cases: int
    civil_cases: int
    recent_cases: list[CaseListOut]
    recent_predictions: list[PredictionOut]
