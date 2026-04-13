import mongoose from 'mongoose';

const EVIDENCE_STRENGTHS = ['strong', 'medium', 'weak'];

const evidenceSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
    evidenceType: { type: String, default: null },
    strength: { type: String, enum: EVIDENCE_STRENGTHS, default: null },
    aiAnalysis: { type: String, default: null },
    relevanceScore: { type: Number, default: null, min: 0, max: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

evidenceSchema.index({ caseId: 1 });

export default mongoose.model('Evidence', evidenceSchema);
