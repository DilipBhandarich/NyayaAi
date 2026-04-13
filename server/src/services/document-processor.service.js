import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const extractors = {
    '.pdf': extractPdf,
    '.docx': extractDocx,
    '.doc': extractDocx,
    '.txt': extractTxt,
    '.png': extractImage,
    '.jpg': extractImage,
    '.jpeg': extractImage,
    '.tiff': extractImage,
    '.bmp': extractImage,
  };

  const extractor = extractors[ext];
  if (!extractor) {
    logger.warn(`Unsupported file type ${ext}, falling back to raw text read`);
    return extractTxt(filePath);
  }
  return extractor(filePath);
}

async function extractPdf(filePath) {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  if (data.text && data.text.trim().length > 0) {
    return data.text;
  }
  logger.info('PDF has no extractable text; attempting OCR');
  return extractImage(filePath);
}

async function extractDocx(filePath) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

function extractTxt(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

async function extractImage(filePath) {
  try {
    const Tesseract = (await import('tesseract.js')).default;
    // Support English + Hindi + Bengali + Tamil + Telugu + Kannada + Malayalam
    const worker = await Tesseract.createWorker('eng+hin');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    return text;
  } catch (err) {
    // Fallback to English only if multi-language fails
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const worker = await Tesseract.createWorker('eng');
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      return text;
    } catch (fallbackErr) {
      logger.error(`OCR failed for ${filePath}: ${fallbackErr.message}`);
      return '';
    }
  }
}
