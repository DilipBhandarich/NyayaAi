import Case from '../models/Case.js';
import Document from '../models/Document.js';
import Evidence from '../models/Evidence.js';
import Prediction from '../models/Prediction.js';
import { extractText } from './document-processor.service.js';
import { extractLawReferences } from './ai/legal-regex.service.js';
import { classifyEvidenceStrength } from './ai/evidence-classifier.service.js';
import * as openaiService from './ai/openai.service.js';
import { searchByText } from './vector-search.service.js';
import logger from '../utils/logger.js';
import { logAction } from './audit.service.js';

// Safe wrapper: call OpenAI service, return fallback on failure
async function safeAI(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    logger.warn(`OpenAI call failed (${err.message}), using fallback`);
    return fallback;
  }
}

// Generate a basic summary from text without AI
function generateBasicSummary(text, laws) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const firstSentences = sentences.slice(0, 5).map((s) => s.trim()).join('. ');
  const lawText = laws.length > 0 ? `\n\nRelevant legal provisions: ${laws.join(', ')}.` : '';
  return `${firstSentences}.${lawText}`;
}

// Extract basic facts from text using simple heuristics
function extractBasicFacts(text) {
  const facts = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const factPatterns = [
    /(?:alleged|accused|charged|convicted|filed|arrested|complaint|victim|witness)/i,
    /(?:court|judge|bench|tribunal|magistrate|session)/i,
    /(?:section|article|act|amendment|ipc|crpc|cpc)/i,
    /(?:evidence|testimony|document|forensic|medical|report)/i,
    /(?:property|land|compensation|damage|amount|fine|penalty)/i,
  ];
  for (const sentence of sentences) {
    for (const pat of factPatterns) {
      if (pat.test(sentence)) {
        facts.push(sentence.trim());
        break;
      }
    }
    if (facts.length >= 10) break;
  }
  return facts.length > 0 ? facts : sentences.slice(0, 5).map((s) => s.trim());
}

// Extract basic entities using regex
function extractBasicEntities(text) {
  const entities = { persons: [], organizations: [], locations: [], dates: [], laws: [] };
  // Laws
  entities.laws = extractLawReferences(text);
  // Dates
  const dateMatches = text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi);
  if (dateMatches) entities.dates = [...new Set(dateMatches)].slice(0, 10);
  return entities;
}

export async function runFullAnalysis(caseId, userId = null) {
  const startTime = Date.now();
  if (userId) {
    await logAction({ userId, caseId, action: 'analysis_triggered' });
  }

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error('Case not found');

  logger.info(`Starting full analysis for case ${caseDoc.caseNumber}`);

  // 1. Load & process all documents
  const documents = await Document.find({ caseId });
  for (const doc of documents) {
    if (!doc.isProcessed && doc.filePath) {
      try {
        doc.extractedText = await extractText(doc.filePath);
        doc.isProcessed = true;
        await doc.save();
      } catch (err) {
        logger.error(`Failed to extract text from ${doc.filename}: ${err.message}`);
      }
    }
  }

  // 2. Concatenate all extracted text
  const fullText = documents
    .map((d) => d.extractedText)
    .filter(Boolean)
    .join('\n\n');

  // Also include case title and description
  const caseContext = `${caseDoc.title || ''}. ${caseDoc.description || ''}`;
  const analysisText = fullText.trim() ? fullText : caseContext;

  if (!analysisText.trim()) {
    caseDoc.status = 'analysis_complete';
    caseDoc.aiSummary = 'No document text available for analysis.';
    await caseDoc.save();
    return { case: caseDoc, prediction: null, similarCases: [] };
  }

  // 3. Simple regex: extract law references
  const laws = extractLawReferences(analysisText);

  // 4. AI analysis with fallbacks (sequential to respect Gemini free tier rate limits)
  const entities = await safeAI(() => openaiService.extractEntities(analysisText), extractBasicEntities(analysisText));
  const summary = await safeAI(() => openaiService.summarizeDocument(analysisText), generateBasicSummary(analysisText, laws));
  const keyFacts = await safeAI(() => openaiService.extractKeyFacts(analysisText), extractBasicFacts(analysisText));
  const timeline = await safeAI(() => openaiService.generateTimeline(analysisText), []);

  // 5. Update each document with individual AI analysis (sequential for rate limits)
  for (const doc of documents) {
    if (doc.extractedText && doc.extractedText.trim()) {
      const docEntities = await safeAI(() => openaiService.extractEntities(doc.extractedText), extractBasicEntities(doc.extractedText));
      const docSummary = await safeAI(() => openaiService.summarizeDocument(doc.extractedText), generateBasicSummary(doc.extractedText, extractLawReferences(doc.extractedText)));
      doc.aiEntities = docEntities;
      doc.aiSummary = docSummary;
      await doc.save();
    }
  }

  // 6. Auto-create evidence items from documents
  for (const doc of documents) {
    const existingEvidence = await Evidence.findOne({ caseId, documentId: doc._id });
    if (!existingEvidence) {
      const strength = classifyEvidenceStrength(doc.extractedText || doc.originalFilename);
      await Evidence.create({
        caseId,
        documentId: doc._id,
        title: doc.originalFilename,
        description: doc.aiSummary || '',
        strength,
      });
    }
  }

  // 7. Find similar cases FIRST (so we can pass them to prediction) — RAG retrieval step
  const similarCases = await searchByText(analysisText, 10);

  // 8. Run comprehensive prediction (with fallback) — RAG-grounded generation
  // Similar cases context is passed to the AI so it cites VERIFIED precedents only
  const evidenceItems = await Evidence.find({ caseId });
  const fullCaseContext = `CASE: ${caseDoc.title}
Type: ${caseDoc.caseType}
Court: ${caseDoc.court?.name || caseDoc.courtName || 'N/A'}
Parties: ${caseDoc.parties?.petitioner || 'N/A'} v. ${caseDoc.parties?.respondent || 'N/A'}
Description: ${caseDoc.description || 'N/A'}

AI Summary: ${summary}

Key Facts: ${(Array.isArray(keyFacts) ? keyFacts : []).join('; ')}`;

  const predictionResult = await safeAI(
    () => openaiService.predictOutcome(
      fullCaseContext,
      evidenceItems.map((e) => ({ title: e.title, strength: e.strength, description: e.description })),
      laws,
      similarCases,
      caseDoc.caseType
    ),
    {
      predictedOutcome: 'Analysis based on detected legal provisions and evidence classification.',
      confidenceScore: 0,
      reasoning: `Regex-based analysis detected ${laws.length} legal references. ${evidenceItems.length} evidence items classified. ${similarCases.length} similar precedent cases identified. Full AI-powered judgment prediction requires a valid OpenAI API key with available quota.`,
      relevantLaws: laws,
      riskFactors: [],
      aggravatingFactors: [],
      mitigatingFactors: [],
      evidenceAssessment: {
        overallStrength: evidenceItems.length > 0 ? 'Evidence items detected but require AI analysis' : 'No evidence items found',
        keyFindings: evidenceItems.filter(e => e.strength === 'strong').map(e => e.title),
        gaps: ['AI-powered evidence assessment unavailable'],
      },
      precedentAnalysis: similarCases.slice(0, 5).map(sc => ({
        caseName: sc.title || 'Unknown',
        citation: sc.caseReference || 'N/A',
        relevance: sc.score ? `${(sc.score * 100).toFixed(0)}% keyword match` : 'Matched by keyword search',
        howItApplies: sc.summary ? sc.summary.slice(0, 200) : '',
        outcome: sc.outcome || 'N/A',
      })),
      prosecutionStrengths: [],
      defenseStrengths: [],
      disclaimer: 'This is a basic analysis using pattern matching only. Full AI-powered judgment prediction was unavailable.',
    }
  );
  const prediction = await Prediction.create({ caseId, ...predictionResult });

  // 9. Update case with AI results
  caseDoc.aiSummary = summary;
  caseDoc.aiKeyFacts = keyFacts;
  caseDoc.aiTimeline = timeline;
  caseDoc.aiTags = laws;
  caseDoc.aiEntities = entities;
  caseDoc.status = 'analysis_complete';
  await caseDoc.save();

  logger.info(`Analysis complete for case ${caseDoc.caseNumber} (${similarCases.length} similar cases found)`);

  if (userId) {
    await logAction({
      userId, caseId, action: 'analysis_completed',
      details: { similarCasesFound: similarCases.length, predictionConfidence: prediction.confidenceScore },
      durationMs: Date.now() - startTime,
    });
  }

  return { case: caseDoc, prediction, similarCases };
}
