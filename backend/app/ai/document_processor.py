"""
NyayaAI - Document text extraction.

Handles PDF, DOCX, images (via OCR), and plain text files.
"""

import os
import logging
from pathlib import Path

from PyPDF2 import PdfReader
from docx import Document as DocxDocument
from PIL import Image

logger = logging.getLogger(__name__)


def extract_text(file_path: str) -> str:
    """Extract text from a file based on its extension."""
    ext = Path(file_path).suffix.lower()
    extractors = {
        ".pdf": _extract_pdf,
        ".docx": _extract_docx,
        ".doc": _extract_docx,
        ".txt": _extract_txt,
        ".png": _extract_image,
        ".jpg": _extract_image,
        ".jpeg": _extract_image,
        ".tiff": _extract_image,
        ".bmp": _extract_image,
    }
    extractor = extractors.get(ext)
    if extractor is None:
        logger.warning("Unsupported file type: %s – falling back to raw read", ext)
        return _extract_txt(file_path)
    return extractor(file_path)


def _extract_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    full_text = "\n\n".join(pages)
    # If the PDF is image-based, there will be no text
    if not full_text.strip():
        logger.info("PDF has no extractable text; attempting OCR")
        return _ocr_pdf(file_path)
    return full_text


def _ocr_pdf(file_path: str) -> str:
    """Fallback OCR for scanned PDFs using Tesseract."""
    try:
        import pytesseract
        from pdf2image import convert_from_path

        images = convert_from_path(file_path)
        texts = [pytesseract.image_to_string(img) for img in images]
        return "\n\n".join(texts)
    except ImportError:
        logger.warning("pdf2image/pytesseract not available; returning empty text")
        return ""
    except Exception as e:
        logger.error("OCR failed: %s", e)
        return ""


def _extract_docx(file_path: str) -> str:
    doc = DocxDocument(file_path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _extract_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def _extract_image(file_path: str) -> str:
    """Extract text from an image using Tesseract OCR."""
    try:
        import pytesseract

        img = Image.open(file_path)
        return pytesseract.image_to_string(img)
    except ImportError:
        logger.warning("pytesseract not installed; cannot OCR image")
        return ""
    except Exception as e:
        logger.error("Image OCR failed: %s", e)
        return ""
