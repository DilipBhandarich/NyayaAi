import Evidence from '../models/Evidence.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { classifyEvidenceStrength } from '../services/ai/evidence-classifier.service.js';

export const listByCaseId = asyncHandler(async (req, res) => {
  const evidence = await Evidence.find({ caseId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, evidence });
});

export const create = asyncHandler(async (req, res) => {
  const { title, description, evidenceType, documentId } = req.body;

  const strength = classifyEvidenceStrength(description || title);

  const evidence = await Evidence.create({
    caseId: req.params.id,
    documentId: documentId || null,
    title,
    description,
    evidenceType,
    strength,
  });

  res.status(201).json({ success: true, evidence });
});
