import SimilarCase from '../models/SimilarCase.js';
import { generateEmbedding } from './ai/openai.service.js';
import logger from '../utils/logger.js';

// Common legal stopwords to ignore during keyword matching
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
  'these', 'those', 'it', 'its', 'not', 'no', 'nor', 'as', 'if', 'then',
  'than', 'so', 'such', 'only', 'own', 'same', 'too', 'very', 'just',
  'about', 'above', 'after', 'again', 'all', 'also', 'any', 'because',
  'before', 'between', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'under', 'until', 'up', 'out', 'over', 'into', 'through',
  'during', 'while', 'which', 'who', 'whom', 'what', 'where', 'when',
  'how', 'there', 'here', 'they', 'them', 'their', 'he', 'she', 'him',
  'her', 'his', 'we', 'our', 'us', 'you', 'your',
]);

// Extract meaningful keywords from text
function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// Extract legal references (IPC sections, Articles, Act names)
function extractLegalTerms(text) {
  if (!text) return [];
  const patterns = [
    /section\s+\d+[a-z]?/gi,
    /article\s+\d+[a-z]?/gi,
    /ipc/gi, /crpc/gi, /cpc/gi, /bns/gi, /bnss/gi,
    /amendment/gi,
    /fundamental\s+right/gi,
    /right\s+to\s+\w+/gi,
    /article\s+21/gi, /article\s+14/gi, /article\s+19/gi,
    /supreme\s+court/gi, /high\s+court/gi,
    /constitution/gi,
  ];
  const terms = [];
  for (const pat of patterns) {
    const matches = text.match(pat);
    if (matches) terms.push(...matches.map((m) => m.toLowerCase().trim()));
  }
  return [...new Set(terms)];
}

// Score how similar two cases are based on keyword overlap
function computeKeywordScore(queryKeywords, queryLegalTerms, caseDoc) {
  const caseText = `${caseDoc.title || ''} ${caseDoc.summary || ''} ${caseDoc.fullText || ''} ${(caseDoc.keyLaws || []).join(' ')}`;
  const caseKeywords = new Set(extractKeywords(caseText));
  const caseLegalTerms = new Set(extractLegalTerms(caseText));

  // Keyword overlap score
  let keywordMatches = 0;
  for (const kw of queryKeywords) {
    if (caseKeywords.has(kw)) keywordMatches++;
  }
  const keywordScore = queryKeywords.length > 0 ? keywordMatches / queryKeywords.length : 0;

  // Legal term overlap score (weighted higher)
  let legalMatches = 0;
  for (const lt of queryLegalTerms) {
    if (caseLegalTerms.has(lt)) legalMatches++;
  }
  const legalScore = queryLegalTerms.length > 0 ? legalMatches / queryLegalTerms.length : 0;

  // Case type bonus
  const caseTypeScore = 0;

  // Combined score: legal terms weighted 3x more than general keywords
  return (keywordScore * 0.3) + (legalScore * 0.7);
}

// Index a precedent case: generate embedding (if possible) and save
export async function indexSimilarCase(caseData) {
  let embedding = null;
  try {
    const textForEmbedding = `${caseData.title}. ${caseData.summary || ''}. ${caseData.fullText || ''}`;
    embedding = await generateEmbedding(textForEmbedding);
  } catch (err) {
    logger.warn(`Embedding generation failed for ${caseData.caseReference}: ${err.message}. Saving without embedding.`);
  }

  const updateData = { ...caseData };
  if (embedding) updateData.embedding = embedding;

  const sc = await SimilarCase.findOneAndUpdate(
    { caseReference: caseData.caseReference },
    updateData,
    { upsert: true, new: true }
  );
  logger.info(`Indexed similar case: ${sc.caseReference}${embedding ? ' (with embedding)' : ' (text only)'}`);
  return sc;
}

// Find similar cases using Atlas Vector Search
export async function findSimilar(queryEmbedding, topK = 10) {
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: topK * 10,
          limit: topK,
        },
      },
      {
        $project: {
          _id: 1,
          caseReference: 1,
          title: 1,
          caseType: 1,
          court: 1,
          year: 1,
          summary: 1,
          outcome: 1,
          keyLaws: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await SimilarCase.aggregate(pipeline);
    return results;
  } catch (err) {
    logger.warn(`Vector search failed (${err.message}), falling back to keyword search`);
    return fallbackTextSearch('', topK);
  }
}

// Search by text: try embedding-based search, fall back to keyword search
export async function searchByText(text, topK = 10) {
  // First try embedding-based vector search
  try {
    const embedding = await generateEmbedding(text);
    return findSimilar(embedding, topK);
  } catch (err) {
    logger.warn(`Embedding search failed (${err.message}), using keyword fallback`);
  }

  // Keyword-based fallback
  return keywordSearch(text, topK);
}

// Keyword-based similarity search fallback
async function keywordSearch(queryText, topK = 10) {
  const queryKeywords = extractKeywords(queryText);
  const queryLegalTerms = extractLegalTerms(queryText);

  logger.info(`Keyword search: ${queryKeywords.length} keywords, ${queryLegalTerms.length} legal terms`);

  // Fetch all cases from the collection
  const allCases = await SimilarCase.find().lean();

  if (allCases.length === 0) return [];

  // Score each case
  const scored = allCases.map((c) => ({
    _id: c._id,
    caseReference: c.caseReference,
    title: c.title,
    caseType: c.caseType,
    court: c.court,
    year: c.year,
    summary: c.summary,
    outcome: c.outcome,
    keyLaws: c.keyLaws,
    score: computeKeywordScore(queryKeywords, queryLegalTerms, c),
  }));

  // Sort by score descending, return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((s) => s.score > 0);
}

// Fallback when no query text available
async function fallbackTextSearch(queryText, topK) {
  if (queryText) return keywordSearch(queryText, topK);
  return SimilarCase.find()
    .select('caseReference title caseType court year summary outcome keyLaws')
    .sort({ createdAt: -1 })
    .limit(topK);
}
