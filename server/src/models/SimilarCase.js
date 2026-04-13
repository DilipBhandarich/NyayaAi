import mongoose from 'mongoose';

const CASE_TYPES = ['criminal', 'civil', 'constitutional', 'family', 'labor', 'consumer', 'tax', 'land_revenue', 'motor_accident', 'arbitration', 'writ_petition', 'pil'];

const similarCaseSchema = new mongoose.Schema(
  {
    caseReference: { type: String, required: true },
    title: { type: String, required: true },
    caseType: { type: String, enum: CASE_TYPES, default: null },
    court: { type: String, default: null },
    year: { type: Number, default: null },
    summary: { type: String, default: null },
    outcome: { type: String, default: null },
    keyLaws: { type: [String], default: [] },
    fullText: { type: String, default: null },

    // Vector embedding for Atlas Vector Search (1536 dims for text-embedding-3-small)
    embedding: { type: [Number], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

similarCaseSchema.index({ caseReference: 1 });
similarCaseSchema.index({ caseType: 1 });
similarCaseSchema.index({ year: -1 });

export default mongoose.model('SimilarCase', similarCaseSchema);
