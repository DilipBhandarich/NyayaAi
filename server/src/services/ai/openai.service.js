import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Rate limiter: space out requests for free tier (15 RPM)
let lastCallTime = 0;
const MIN_DELAY_MS = 4500; // ~13 requests/min to stay under 15 RPM

async function rateLimitedDelay() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise((r) => setTimeout(r, MIN_DELAY_MS - elapsed));
  }
  lastCallTime = Date.now();
}

// Retry wrapper with exponential backoff for 429 errors
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await rateLimitedDelay();
      return await fn();
    } catch (err) {
      if (err.message?.includes('429') && attempt < maxRetries) {
        const retryMatch = err.message.match(/retry in ([\d.]+)s/i);
        const waitSec = retryMatch ? parseFloat(retryMatch[1]) + 2 : (attempt + 1) * 20;
        logger.warn(`Gemini rate limited, retrying in ${waitSec}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw err;
    }
  }
}

function getModel(responseMimeType) {
  const opts = { model: config.GEMINI_MODEL };
  if (responseMimeType) {
    opts.generationConfig = { responseMimeType };
  }
  return genAI.getGenerativeModel(opts);
}

// Helper: call Gemini and return JSON (with rate limiting + retry)
async function geminiJSON(systemInstruction, userPrompt) {
  return withRetry(async () => {
    const model = getModel('application/json');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });
    const text = result.response.text();
    return JSON.parse(text);
  });
}

// Helper: call Gemini and return text (with rate limiting + retry)
async function geminiText(systemInstruction, userPrompt, temperature = 0.3) {
  return withRetry(async () => {
    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature, maxOutputTokens: 1500 },
    });
    return result.response.text();
  });
}

// --- Embeddings (using Gemini embedding model) ---
export async function generateEmbedding(text) {
  return withRetry(async () => {
    const truncated = text.slice(0, 8000);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(truncated);
    return result.embedding.values;
  });
}

// --- Named Entity Recognition ---
export async function extractEntities(text) {
  try {
    return await geminiJSON(
      'You are a legal NER system for Indian law. Extract entities from the text and return ONLY valid JSON: { "persons": [], "organizations": [], "dates": [], "locations": [], "money": [], "laws": [] }',
      text.slice(0, 12000)
    );
  } catch (err) {
    logger.error(`NER failed: ${err.message}`);
    return { persons: [], organizations: [], dates: [], locations: [], money: [], laws: [] };
  }
}

// --- Summarization ---
export async function summarizeDocument(text) {
  return geminiText(
    'Summarize the following Indian legal document in 3-5 concise paragraphs. Focus on key facts, legal issues, and parties involved.',
    text.slice(0, 15000)
  );
}

// --- Key Fact Extraction ---
export async function extractKeyFacts(text) {
  try {
    const parsed = await geminiJSON(
      'Extract key facts from this Indian legal document. Return ONLY JSON: { "facts": ["fact1", "fact2", ...] }. Max 20 facts.',
      text.slice(0, 15000)
    );
    return parsed.facts || [];
  } catch (err) {
    logger.error(`Key facts extraction failed: ${err.message}`);
    return [];
  }
}

// --- Timeline Generation ---
export async function generateTimeline(text) {
  try {
    const parsed = await geminiJSON(
      'Extract a chronological timeline from this legal document. Return ONLY JSON: { "timeline": [{ "date": "...", "event": "..." }] }. Use ISO or natural date formats.',
      text.slice(0, 15000)
    );
    return parsed.timeline || [];
  } catch (err) {
    logger.error(`Timeline generation failed: ${err.message}`);
    return [];
  }
}

// --- Comprehensive Judgment Prediction ---
export async function predictOutcome(caseDescription, evidence, laws, similarCases, caseType) {
  const isCriminal = caseType === 'criminal';

  const systemPrompt = `You are an expert Indian legal analyst and judicial advisory AI. Your role is to provide a comprehensive, structured analysis to assist judges in making informed decisions. You must analyze the case from ALL angles — prosecution, defense, precedents, and applicable law.

You MUST return ONLY valid JSON with this exact structure:
{
  "predictedOutcome": "Clear predicted outcome (e.g. 'Conviction under Section 498A IPC with moderate sentence' or 'Decree in favor of plaintiff')",
  "confidenceScore": 0.0 to 1.0,
  "reasoning": "Detailed 3-5 paragraph legal reasoning covering: (1) Applicable legal framework (2) Analysis of evidence (3) Precedent comparison (4) Final assessment",

  "judgmentRecommendation": {
    "verdict": "Specific recommended verdict",
    "sentencingGuideline": "Recommended sentence range based on IPC/BNS provisions and precedents",
    "fineRange": "Recommended fine range if applicable",
    "custodialSentence": "${isCriminal ? 'Recommended imprisonment duration or alternative' : 'N/A - Civil matter'}",
    "probationEligibility": "${isCriminal ? 'Whether probation under Probation of Offenders Act is appropriate' : 'N/A'}",
    "compensationToVictim": "Recommended compensation under S.357 CrPC or relevant civil provisions"
  },

  "applicableSections": [
    {
      "section": "Section number and Act name",
      "description": "What this section covers",
      "maxPenalty": "Maximum penalty prescribed",
      "applicability": "How it applies to this specific case"
    }
  ],

  "precedentAnalysis": [
    {
      "caseName": "Full case name",
      "citation": "Case citation",
      "relevance": "Why this precedent matters",
      "howItApplies": "Specific application to current case",
      "outcome": "What was decided in the precedent"
    }
  ],

  "aggravatingFactors": ["factors that increase severity"],
  "mitigatingFactors": ["factors that may reduce severity"],
  "riskFactors": ["risks/concerns the judge should be aware of"],

  "evidenceAssessment": {
    "overallStrength": "Strong/Moderate/Weak with explanation",
    "keyFindings": ["key evidence points supporting the case"],
    "gaps": ["missing evidence or weaknesses in evidence"]
  },

  "prosecutionStrengths": ["strong points favoring ${isCriminal ? 'prosecution' : 'plaintiff'}"],
  "defenseStrengths": ["strong points favoring ${isCriminal ? 'defense/accused' : 'defendant'}"],

  "bailAnalysis": {
    "recommendation": "${isCriminal ? 'Grant/Deny/Conditional bail' : 'N/A - Civil matter'}",
    "conditions": [${isCriminal ? '"suggested bail conditions if granted"' : ''}],
    "reasoning": "${isCriminal ? 'Bail reasoning considering Arnesh Kumar guidelines, flight risk, evidence tampering risk, and gravity of offense' : 'Not applicable to civil proceedings'}"
  },

  "alternativeOutcomes": [
    {
      "outcome": "Alternative possible outcome",
      "probability": 0.0 to 1.0,
      "reasoning": "Why this outcome is possible"
    }
  ],

  "relevantLaws": ["All applicable legal provisions"],
  "disclaimer": "DISCLAIMER: This is an AI-generated advisory analysis only. It is NOT a legal opinion or judgment. The final decision must be made by the presiding judge based on their independent assessment of facts, evidence, and applicable law. AI predictions should be used as a research aid only."
}

IMPORTANT GUIDELINES:
- Base your analysis on Indian law (IPC/BNS, CrPC/BNSS, CPC, Evidence Act, specific statutes)
- CRITICAL: For precedent analysis, ONLY cite cases that are provided in the "SIMILAR PRECEDENT CASES FROM DATABASE" section below. Do NOT fabricate or hallucinate case names or citations. If no similar cases are provided, state that no verified precedents were found in the database.
- When referencing IPC sections, also mention the corresponding BNS section (e.g., "Section 302 IPC / Section 103 BNS")
- Consider constitutional provisions (Articles 14, 19, 21 etc.) where applicable
- For criminal cases, apply the "rarest of rare" doctrine (Bachan Singh) for death penalty consideration
- For bail, consider Arnesh Kumar v. State of Bihar guidelines
- For sentencing, consider the principle of proportionality
- Always consider both aggravating and mitigating circumstances
- Assess evidence critically - identify gaps and strengths`;

  const userContent = `CASE DETAILS:
${caseDescription}

EVIDENCE ON RECORD:
${JSON.stringify(evidence, null, 2)}

LAWS/SECTIONS CITED:
${JSON.stringify(laws)}

SIMILAR PRECEDENT CASES FROM DATABASE:
${similarCases?.length > 0 ? similarCases.map((sc, i) => `${i + 1}. ${sc.title} (${sc.caseReference})
   Outcome: ${sc.outcome || 'N/A'}
   Key Laws: ${(sc.keyLaws || []).join(', ')}
   Summary: ${sc.summary || 'N/A'}`).join('\n\n') : 'No similar cases found in database.'}

Please provide a comprehensive judgment advisory analysis.`;

  try {
    return await withRetry(async () => {
      const model = getModel('application/json');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 8000 },
      });
      return JSON.parse(result.response.text());
    });
  } catch (err) {
    logger.error(`Prediction failed: ${err.message}`);
    return {
      predictedOutcome: 'Unable to generate prediction',
      confidenceScore: 0,
      reasoning: `AI analysis failed: ${err.message}`,
      relevantLaws: laws || [],
      riskFactors: [],
      disclaimer: 'DISCLAIMER: This is an AI-generated advisory analysis only.',
    };
  }
}

// --- Bail Assessment ---
export async function assessBail(caseDescription, evidence, laws, similarCases) {
  const systemPrompt = `You are an expert Indian legal analyst specializing in bail jurisprudence. Analyze the case and provide a structured bail assessment following Supreme Court guidelines including Arnesh Kumar v. State of Bihar (2014), Sanjay Chandra v. CBI (2012), and Dataram Singh v. State of UP (2018).

You MUST return ONLY valid JSON:
{
  "offenseCategory": "bailable/non-bailable/capital",
  "maxSentence": "Maximum sentence for the primary offense",
  "custodyDuration": "Current custody duration if mentioned",
  "criminalHistory": "none/minor/significant/repeat_offender",
  "cooperationWithInvestigation": "Assessment of cooperation",
  "healthConditions": "Any health conditions mentioned or N/A",
  "flightRisk": "low/medium/high",
  "flightRiskReasons": ["reasons"],
  "evidenceTamperingRisk": "low/medium/high",
  "evidenceTamperingReasons": ["reasons"],
  "witnessInfluenceRisk": "low/medium/high",
  "publicSafetyRisk": "low/medium/high",
  "investigationStatus": "ongoing/completed/charge_sheet_filed",
  "chargeSheetFiled": true,
  "recommendation": "grant/deny/conditional",
  "recommendedConditions": ["condition1", "condition2"],
  "suretyAmount": "Recommended surety amount",
  "reasoning": "Detailed 3-4 paragraph reasoning covering: (1) Nature and gravity of offense (2) Risk assessment (3) Precedent application (4) Balancing personal liberty vs investigation needs",
  "arneshKumarApplicable": true,
  "arneshKumarChecklist": [
    {"item": "Whether offense carries max sentence of 7 years or less", "satisfied": true, "remarks": "..."},
    {"item": "Whether arrest is necessary to prevent tampering of evidence", "satisfied": false, "remarks": "..."},
    {"item": "Whether accused is likely to commit further offense", "satisfied": false, "remarks": "..."},
    {"item": "Whether accused is likely to abscond", "satisfied": false, "remarks": "..."},
    {"item": "Whether notice under S.41A CrPC/S.35 BNSS was served", "satisfied": true, "remarks": "..."}
  ],
  "relevantPrecedents": [{"caseName": "...", "citation": "...", "relevance": "...", "outcome": "..."}],
  "offenseSections": [{"section": "...", "description": "...", "maxPenalty": "..."}]
}

GUIDELINES:
- Apply the triple test: (1) flight risk (2) evidence tampering (3) witness influence
- For bailable offenses (max 3 years), bail is generally a right
- Consider Article 21 - personal liberty is the rule, deprivation is the exception
- Apply Arnesh Kumar guidelines for offenses with max 7 years, especially S.498A cases
- Consider S.436A CrPC/S.479 BNSS - default bail if detention exceeds half max sentence`;

  const userContent = `CASE DETAILS:\n${caseDescription}\n\nEVIDENCE:\n${JSON.stringify(evidence, null, 2)}\n\nLAWS/SECTIONS:\n${JSON.stringify(laws)}\n\nSIMILAR CASES:\n${similarCases?.length > 0 ? similarCases.map((sc, i) => `${i + 1}. ${sc.title} (${sc.caseReference}) - Outcome: ${sc.outcome || 'N/A'}`).join('\n') : 'None found.'}\n\nProvide a comprehensive bail assessment.`;

  try {
    return await withRetry(async () => {
      const model = getModel('application/json');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 4000 },
      });
      return JSON.parse(result.response.text());
    });
  } catch (err) {
    logger.error(`Bail assessment failed: ${err.message}`);
    return {
      recommendation: 'Unable to generate assessment',
      reasoning: `AI analysis failed: ${err.message}`,
      offenseCategory: 'unknown',
      flightRisk: 'medium',
      evidenceTamperingRisk: 'medium',
      arneshKumarApplicable: false,
      arneshKumarChecklist: [],
      relevantPrecedents: [],
      recommendedConditions: [],
      offenseSections: [],
    };
  }
}

// --- Conversational Chat ---
export async function chatAboutCase(messages, caseContext) {
  const systemInstruction = `You are NyayaAI — a senior legal advisor and judicial research expert with deep expertise in Indian law. You function as a professional legal counsel. You speak with authority and give definitive legal opinions.

CASE CONTEXT:
${caseContext}

YOUR IDENTITY:
- You ARE a professional legal advisor. Never say "I am an AI", "as an AI", "I cannot render judgment", or any disclaimer. Never hedge with "I'm not a substitute for legal advice." You are the legal advice.
- Respond exactly as a senior advocate or retired judge would — with confidence, authority, and precision.
- Own your analysis. Say "The accused is guilty" not "The accused would likely be found guilty."

HOW TO RESPOND:

**When asked for a judgment/verdict:**
Deliver a structured ruling:
1. **Charges Framed** — List each section of law with its ingredients
2. **Evidence Assessment** — Analyze each piece of evidence (dying declarations, witness testimony, forensic reports, documentary evidence) with its evidentiary value under the Indian Evidence Act
3. **Legal Analysis** — Apply the law to the facts. Discuss burden of proof, presumptions (e.g., Section 113-B Evidence Act for dowry death), mens rea, actus reus
4. **Verdict** — State the verdict clearly (Guilty/Not Guilty on each charge)
5. **Sentencing** — Prescribe the sentence citing the exact statutory provision, minimum/maximum punishment, and reasoning for the quantum of sentence
6. **Order** — Final operative order

**When asked a question in one line:**
Give a crisp, definitive one-line answer followed by the legal basis. No filler, no hedging.

**When asked about bail:**
Apply the three-part test: (1) Flight risk (2) Severity of offense and punishment prescribed (3) Likelihood of tampering with evidence/witnesses. Reference Arnesh Kumar v. State of Bihar (2014), Dataram Singh v. State of UP, and other relevant precedents. Give a clear Grant/Deny recommendation with conditions.

**When asked about sentencing:**
State the exact punishment under the relevant section. Reference aggravating and mitigating factors. Cite sentencing precedents from Supreme Court and High Courts.

**When asked to explain law/sections:**
Explain the section, its ingredients, punishment, and how it applies to this specific case. Cross-reference IPC with BNS equivalents (e.g., Section 304B IPC = Section 80 BNS).

FORMATTING RULES:
- Use **bold headings**, bullet points, and numbered lists for structure
- Cite sections precisely: "Section 304B IPC (Section 80 BNS)"
- Cite landmark cases: "As held in Shanti v. State of Haryana (1991) 1 SCC 371..."
- Use legal terminology naturally: prima facie, mens rea, actus reus, beyond reasonable doubt, preponderance of probability
- Be thorough but not verbose. Every sentence must add legal value.
- NEVER include any disclaimer, caveat, or "AI" reference anywhere in the response. Not at the start, not at the end, nowhere.`;

  // Convert message history to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const model = getModel();
  return withRetry(async () => {
    const result = await model.generateContent({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    });
    return result.response.text();
  });
}
