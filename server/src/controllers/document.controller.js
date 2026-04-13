import path from 'path';
import Document from '../models/Document.js';
import Case from '../models/Case.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { extractText } from '../services/document-processor.service.js';
import logger from '../utils/logger.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const doc = await Document.create({
    caseId: caseDoc._id,
    filename: req.file.filename,
    originalFilename: req.file.originalname,
    filePath: req.file.path,
    fileType: path.extname(req.file.originalname).toLowerCase(),
    fileSize: req.file.size,
    documentType: req.body.documentType || 'other',
  });

  // Extract text in background (non-blocking for the response)
  extractText(req.file.path)
    .then(async (text) => {
      doc.extractedText = text;
      doc.isProcessed = true;
      await doc.save();
      logger.info(`Document ${doc._id} processed successfully`);
    })
    .catch((err) => logger.error(`Document processing failed for ${doc._id}: ${err.message}`));

  res.status(201).json({ success: true, document: doc });
});

export const listByCaseId = asyncHandler(async (req, res) => {
  const documents = await Document.find({ caseId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, documents });
});

export const getById = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.docId);
  if (!doc) throw new ApiError(404, 'Document not found');
  res.json({ success: true, document: doc });
});
