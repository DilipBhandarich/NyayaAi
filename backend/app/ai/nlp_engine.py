"""
NyayaAI - NLP Engine

Provides:
    - Named Entity Recognition (people, dates, places, organizations)
    - Key fact extraction
    - Case summarization
    - Timeline generation from text
    - Evidence strength classification
"""

import logging
import re
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-loaded spaCy model (heavy; load once)
# ---------------------------------------------------------------------------
_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


# ---------------------------------------------------------------------------
# Entity extraction
# ---------------------------------------------------------------------------

def extract_entities(text: str) -> dict:
    """Extract named entities from legal text.

    Returns dict with keys: persons, organizations, dates, locations, laws, money.
    """
    nlp = _get_nlp()
    doc = nlp(text[:100_000])  # spaCy limit safety

    entities: dict[str, list[str]] = {
        "persons": [],
        "organizations": [],
        "dates": [],
        "locations": [],
        "money": [],
    }

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            entities["persons"].append(ent.text)
        elif ent.label_ == "ORG":
            entities["organizations"].append(ent.text)
        elif ent.label_ in ("DATE", "TIME"):
            entities["dates"].append(ent.text)
        elif ent.label_ in ("GPE", "LOC", "FAC"):
            entities["locations"].append(ent.text)
        elif ent.label_ == "MONEY":
            entities["money"].append(ent.text)

    # Deduplicate while preserving order
    for key in entities:
        entities[key] = list(dict.fromkeys(entities[key]))

    # Attempt to extract Indian legal section references
    entities["laws"] = _extract_law_references(text)

    return entities


def _extract_law_references(text: str) -> list[str]:
    """Find references to Indian Penal Code sections and other statutes."""
    patterns = [
        r"Section\s+\d+[A-Z]?\s+(?:of\s+)?(?:the\s+)?(?:Indian\s+Penal\s+Code|IPC|CrPC|CPC|IT\s+Act|BNS|BNSS)",
        r"(?:IPC|CrPC|CPC|BNS|BNSS)\s+Section\s+\d+[A-Z]?",
        r"Section\s+\d+[A-Z]?(?:\(\d+\))?",
        r"Article\s+\d+[A-Z]?\s+of\s+the\s+Constitution",
    ]
    refs = []
    for pattern in patterns:
        refs.extend(re.findall(pattern, text, re.IGNORECASE))
    return list(dict.fromkeys(refs))


# ---------------------------------------------------------------------------
# Summarization (local, no LLM needed)
# ---------------------------------------------------------------------------

def generate_extractive_summary(text: str, num_sentences: int = 5) -> str:
    """Simple extractive summarization using sentence scoring.

    Scores sentences by the number of named entities and legal keywords they
    contain, then picks the top-N.
    """
    nlp = _get_nlp()
    doc = nlp(text[:100_000])
    sentences = list(doc.sents)
    if not sentences:
        return text[:500]

    legal_keywords = {
        "court", "judge", "plaintiff", "defendant", "witness", "evidence",
        "prosecution", "defense", "verdict", "guilty", "innocent", "bail",
        "sentence", "appeal", "order", "petition", "act", "section", "law",
        "crime", "offense", "accused", "complainant", "fir", "charge",
        "convicted", "acquitted", "damages", "compensation", "injunction",
    }

    scored = []
    for sent in sentences:
        text_lower = sent.text.lower()
        entity_count = sum(1 for _ in sent.ents)
        keyword_count = sum(1 for w in sent.text.lower().split() if w in legal_keywords)
        score = entity_count * 2 + keyword_count
        # Prefer earlier sentences slightly
        scored.append((score, sent.start, sent.text.strip()))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:num_sentences]
    # Re-sort by original position for coherence
    top.sort(key=lambda x: x[1])
    return " ".join(s[2] for s in top)


# ---------------------------------------------------------------------------
# Key facts
# ---------------------------------------------------------------------------

def extract_key_facts(text: str) -> list[str]:
    """Extract key factual statements from legal text."""
    nlp = _get_nlp()
    doc = nlp(text[:100_000])
    facts = []
    for sent in doc.sents:
        sent_text = sent.text.strip()
        if len(sent_text) < 20:
            continue
        has_entity = any(True for _ in sent.ents)
        has_legal = any(
            w in sent_text.lower()
            for w in ("accused", "victim", "evidence", "witness", "court", "section", "fir")
        )
        if has_entity and has_legal:
            facts.append(sent_text)
    return facts[:20]  # cap at 20


# ---------------------------------------------------------------------------
# Timeline generation
# ---------------------------------------------------------------------------

def generate_timeline(text: str) -> list[dict]:
    """Attempt to build a timeline of events from the document text.

    Returns list of dicts: [{date, event}, ...]
    """
    nlp = _get_nlp()
    doc = nlp(text[:100_000])
    events = []
    for sent in doc.sents:
        dates_in_sent = [ent.text for ent in sent.ents if ent.label_ in ("DATE", "TIME")]
        if dates_in_sent:
            events.append({
                "date": dates_in_sent[0],
                "event": sent.text.strip()
            })
    # Deduplicate by event text
    seen = set()
    unique = []
    for ev in events:
        if ev["event"] not in seen:
            seen.add(ev["event"])
            unique.append(ev)
    return unique[:30]


# ---------------------------------------------------------------------------
# Evidence strength classification (rule-based baseline)
# ---------------------------------------------------------------------------

STRONG_INDICATORS = [
    "dna", "fingerprint", "cctv", "video", "photograph", "forensic",
    "confession", "eyewitness", "medical report", "post-mortem",
    "scientific", "digital evidence", "bank statement",
]
WEAK_INDICATORS = [
    "hearsay", "rumor", "allegedly", "unverified", "anonymous",
    "circumstantial", "no corroboration", "inconsistent",
]


def classify_evidence_strength(description: str) -> str:
    """Classify evidence as strong / medium / weak based on keywords."""
    text_lower = description.lower()
    strong_hits = sum(1 for kw in STRONG_INDICATORS if kw in text_lower)
    weak_hits = sum(1 for kw in WEAK_INDICATORS if kw in text_lower)
    if strong_hits >= 2:
        return "strong"
    if strong_hits == 1 and weak_hits == 0:
        return "strong"
    if weak_hits >= 2:
        return "weak"
    if weak_hits == 1 and strong_hits == 0:
        return "weak"
    return "medium"
