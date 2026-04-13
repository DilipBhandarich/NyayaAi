"""
NyayaAI - Embedding Engine

Generates sentence embeddings using SentenceTransformers and stores / searches
them in ChromaDB for case similarity matching.
"""

import logging
from typing import Optional
from uuid import UUID

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-loaded resources
# ---------------------------------------------------------------------------
_model = None
_chroma_client = None

COLLECTION_NAME = "nyaya_cases"


def _get_embedding_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        settings = get_settings()
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Loaded embedding model: %s", settings.EMBEDDING_MODEL)
    return _model


def _get_chroma():
    global _chroma_client
    if _chroma_client is None:
        settings = get_settings()
        _chroma_client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
        )
        logger.info("Connected to ChromaDB at %s:%s", settings.CHROMA_HOST, settings.CHROMA_PORT)
    return _chroma_client


def _get_collection():
    client = _get_chroma()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_embedding(text: str) -> list[float]:
    """Generate a dense vector embedding for a piece of text."""
    model = _get_embedding_model()
    # Truncate to model max token length (~512 tokens ~ 2048 chars for safety)
    truncated = text[:8000]
    embedding = model.encode(truncated, show_progress_bar=False)
    return embedding.tolist()


def index_case(case_id: str, text: str, metadata: Optional[dict] = None):
    """Add or update a case embedding in the vector store."""
    collection = _get_collection()
    embedding = generate_embedding(text)
    meta = metadata or {}
    meta = {k: str(v) if v is not None else "" for k, v in meta.items()}
    collection.upsert(
        ids=[case_id],
        embeddings=[embedding],
        documents=[text[:5000]],  # store a snippet for display
        metadatas=[meta],
    )
    logger.info("Indexed case %s in vector store", case_id)


def search_similar_cases(text: str, top_k: int = 10) -> list[dict]:
    """Find the top-K most similar cases to the given text.

    Returns list of dicts: [{id, score, document, metadata}, ...]
    """
    collection = _get_collection()
    embedding = generate_embedding(text)

    try:
        results = collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        logger.error("ChromaDB query failed: %s", e)
        return []

    items = []
    if results and results["ids"]:
        for i, doc_id in enumerate(results["ids"][0]):
            distance = results["distances"][0][i] if results["distances"] else None
            # ChromaDB cosine distance: 0 = identical. Convert to similarity.
            similarity = round(1 - distance, 4) if distance is not None else None
            items.append({
                "id": doc_id,
                "similarity_score": similarity,
                "document": results["documents"][0][i] if results["documents"] else "",
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
            })
    return items


def delete_case(case_id: str):
    """Remove a case from the vector store."""
    try:
        collection = _get_collection()
        collection.delete(ids=[case_id])
    except Exception as e:
        logger.warning("Could not delete case %s from vector store: %s", case_id, e)
