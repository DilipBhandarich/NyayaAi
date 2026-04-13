import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },

    // Core prediction
    predictedOutcome: { type: String, default: null },
    confidenceScore: { type: Number, default: null, min: 0, max: 1 },
    reasoning: { type: String, default: null },

    // Judgment recommendation for judges
    judgmentRecommendation: {
      verdict: { type: String, default: null },
      sentencingGuideline: { type: String, default: null },
      fineRange: { type: String, default: null },
      custodialSentence: { type: String, default: null },
      probationEligibility: { type: String, default: null },
      compensationToVictim: { type: String, default: null },
    },

    // Legal analysis
    relevantLaws: { type: [String], default: [] },
    applicableSections: [
      {
        section: String,
        description: String,
        maxPenalty: String,
        applicability: String,
      },
    ],

    // Precedent analysis
    precedentAnalysis: [
      {
        caseName: String,
        citation: String,
        relevance: String,
        howItApplies: String,
        outcome: String,
      },
    ],

    // Factors considered
    aggravatingFactors: { type: [String], default: [] },
    mitigatingFactors: { type: [String], default: [] },
    riskFactors: { type: [String], default: [] },

    // Evidence assessment
    evidenceAssessment: {
      overallStrength: { type: String, default: null },
      keyFindings: { type: [String], default: [] },
      gaps: { type: [String], default: [] },
    },

    // Arguments for both sides
    prosecutionStrengths: { type: [String], default: [] },
    defenseStrengths: { type: [String], default: [] },

    // Bail analysis (for criminal cases)
    bailAnalysis: {
      recommendation: { type: String, default: null },
      conditions: { type: [String], default: [] },
      reasoning: { type: String, default: null },
    },

    // Alternative outcomes
    alternativeOutcomes: [
      {
        outcome: String,
        probability: Number,
        reasoning: String,
      },
    ],

    similarCaseIds: { type: [String], default: [] },
    disclaimer: {
      type: String,
      default:
        'DISCLAIMER: This is an AI-generated advisory analysis only. It is NOT a legal opinion or judgment. The final decision must be made by the presiding judge based on their independent assessment of facts, evidence, and applicable law. AI predictions should be used as a research aid only.',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

predictionSchema.index({ caseId: 1 });

export default mongoose.model('Prediction', predictionSchema);
