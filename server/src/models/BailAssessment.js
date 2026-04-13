import mongoose from 'mongoose';

const bailAssessmentSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  offenseCategory: { type: String, default: null },
  offenseSections: [{ section: String, description: String, maxPenalty: String }],
  maxSentence: { type: String, default: null },

  custodyDuration: { type: String, default: null },
  criminalHistory: { type: String, default: null },
  cooperationWithInvestigation: { type: String, default: null },
  healthConditions: { type: String, default: null },

  flightRisk: { type: String, enum: ['low', 'medium', 'high', null], default: null },
  flightRiskReasons: [String],
  evidenceTamperingRisk: { type: String, enum: ['low', 'medium', 'high', null], default: null },
  evidenceTamperingReasons: [String],
  witnessInfluenceRisk: { type: String, enum: ['low', 'medium', 'high', null], default: null },
  publicSafetyRisk: { type: String, enum: ['low', 'medium', 'high', null], default: null },

  investigationStatus: { type: String, default: null },
  chargeSheetFiled: { type: Boolean, default: null },
  trialStage: { type: String, default: null },

  victimOpposition: { type: String, default: null },
  prosecutionObjections: [String],

  recommendation: { type: String, enum: ['grant', 'deny', 'conditional', null], default: null },
  recommendedConditions: [String],
  suretyAmount: { type: String, default: null },
  reasoning: { type: String, default: null },

  arneshKumarApplicable: { type: Boolean, default: null },
  arneshKumarChecklist: [{
    item: String,
    satisfied: Boolean,
    remarks: String,
  }],

  relevantPrecedents: [{
    caseName: String,
    citation: String,
    relevance: String,
    outcome: String,
  }],

  disclaimer: { type: String, default: 'DISCLAIMER: This is an AI-generated bail assessment for advisory purposes only. The final decision must be made by the presiding judge.' },
}, { timestamps: { createdAt: true, updatedAt: false } });

bailAssessmentSchema.index({ caseId: 1, createdAt: -1 });

export default mongoose.model('BailAssessment', bailAssessmentSchema);
