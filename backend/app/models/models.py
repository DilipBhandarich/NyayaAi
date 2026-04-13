"""
NyayaAI - SQLAlchemy ORM Models
"""

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Float, Enum, Boolean, Integer, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, PyEnum):
    JUDGE = "judge"
    CLERK = "clerk"
    LAWYER = "lawyer"
    ADMIN = "admin"


class CaseType(str, PyEnum):
    CRIMINAL = "criminal"
    CIVIL = "civil"


class CaseStatus(str, PyEnum):
    FILED = "filed"
    UNDER_REVIEW = "under_review"
    ANALYSIS_PENDING = "analysis_pending"
    ANALYSIS_COMPLETE = "analysis_complete"
    JUDGMENT_PENDING = "judgment_pending"
    CLOSED = "closed"


class EvidenceStrength(str, PyEnum):
    STRONG = "strong"
    MEDIUM = "medium"
    WEAK = "weak"


class DocumentType(str, PyEnum):
    FIR = "fir"
    CASE_FILE = "case_file"
    EVIDENCE = "evidence"
    WITNESS_STATEMENT = "witness_statement"
    LEGAL_ARGUMENT = "legal_argument"
    COURT_RECORD = "court_record"
    OTHER = "other"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.JUDGE)
    court_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cases = relationship("Case", back_populates="assigned_judge")


class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    case_type = Column(Enum(CaseType), nullable=False)
    status = Column(Enum(CaseStatus), default=CaseStatus.FILED)
    description = Column(Text, nullable=True)

    # Parties
    plaintiff_name = Column(String(255), nullable=True)
    defendant_name = Column(String(255), nullable=True)
    plaintiff_lawyer = Column(String(255), nullable=True)
    defendant_lawyer = Column(String(255), nullable=True)

    # Court details
    court_name = Column(String(255), nullable=True)
    filing_date = Column(DateTime, nullable=True)

    # AI-generated fields
    ai_summary = Column(Text, nullable=True)
    ai_key_facts = Column(JSON, nullable=True)
    ai_timeline = Column(JSON, nullable=True)
    ai_tags = Column(JSON, nullable=True)

    # Foreign keys
    judge_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_judge = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="case", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=True)
    document_type = Column(Enum(DocumentType), default=DocumentType.OTHER)

    # Extracted content
    extracted_text = Column(Text, nullable=True)
    is_processed = Column(Boolean, default=False)

    # AI metadata
    ai_summary = Column(Text, nullable=True)
    ai_entities = Column(JSON, nullable=True)  # people, places, dates

    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="documents")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    evidence_type = Column(String(100), nullable=True)

    # AI analysis
    strength = Column(Enum(EvidenceStrength), nullable=True)
    ai_analysis = Column(Text, nullable=True)
    relevance_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="evidence_items")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)

    # Prediction results
    predicted_outcome = Column(String(255), nullable=True)
    confidence_score = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    relevant_laws = Column(JSON, nullable=True)
    similar_case_ids = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)

    # Disclaimer is always included
    disclaimer = Column(
        Text,
        default="This is an AI suggestion. Final judgment must be made by a judge."
    )

    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="predictions")


class SimilarCase(Base):
    """Pre-indexed legal precedents for similarity search."""
    __tablename__ = "similar_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_reference = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    case_type = Column(Enum(CaseType), nullable=True)
    court = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    outcome = Column(String(255), nullable=True)
    key_laws = Column(JSON, nullable=True)
    full_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
