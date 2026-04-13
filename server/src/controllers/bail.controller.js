import Case from '../models/Case.js';
import Evidence from '../models/Evidence.js';
import BailAssessment from '../models/BailAssessment.js';
import * as aiService from '../services/ai/openai.service.js';
import { searchByText } from '../services/vector-search.service.js';
import { extractLawReferences } from '../services/ai/legal-regex.service.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

export const generate = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) throw new ApiError(404, 'Case not found');

  const evidenceItems = await Evidence.find({ caseId: caseDoc._id }).lean();
  const similarCases = await searchByText(`${caseDoc.title} ${caseDoc.description || ''}`, 5);
  const laws = extractLawReferences(`${caseDoc.title} ${caseDoc.description || ''}`);

  const caseDescription = `CASE: ${caseDoc.title}
Type: ${caseDoc.caseType}
Court: ${caseDoc.courtName || 'N/A'}
Plaintiff/Prosecution: ${caseDoc.plaintiffName || 'N/A'}
Defendant/Accused: ${caseDoc.defendantName || 'N/A'}
Description: ${caseDoc.description || 'N/A'}
AI Summary: ${caseDoc.aiSummary || 'N/A'}
Key Facts: ${(caseDoc.aiKeyFacts || []).join('; ')}`;

  const startTime = Date.now();
  const result = await aiService.assessBail(
    caseDescription,
    evidenceItems.map((e) => ({ title: e.title, strength: e.strength, description: e.description })),
    laws,
    similarCases
  );

  const assessment = await BailAssessment.create({
    caseId: caseDoc._id,
    generatedBy: req.user._id,
    ...result,
  });

  await logAction({
    userId: req.user._id,
    caseId: caseDoc._id,
    action: 'bail_assessment_generated',
    details: { recommendation: result.recommendation },
    durationMs: Date.now() - startTime,
  });

  res.json({ success: true, assessment });
});

export const list = asyncHandler(async (req, res) => {
  const assessments = await BailAssessment.find({ caseId: req.params.id })
    .sort({ createdAt: -1 })
    .populate('generatedBy', 'fullName role')
    .lean();
  res.json({ success: true, assessments });
});
