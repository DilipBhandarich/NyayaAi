import Case from '../models/Case.js';
import Document from '../models/Document.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { searchByText } from '../services/vector-search.service.js';

export const findSimilar = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  // Build text to search with
  const documents = await Document.find({ caseId: caseDoc._id, isProcessed: true }).select('extractedText');
  const fullText = [
    caseDoc.title,
    caseDoc.description || '',
    caseDoc.aiSummary || '',
    ...documents.map((d) => d.extractedText?.slice(0, 3000) || ''),
  ].join('\n');

  const similarCases = await searchByText(fullText, 10);
  res.json({ success: true, similarCases });
});
