import mongoose from 'mongoose';

const CASE_TYPES = ['criminal', 'civil', 'constitutional', 'family', 'labor', 'consumer', 'tax', 'land_revenue', 'motor_accident', 'arbitration', 'writ_petition', 'pil'];
const CASE_STATUSES = ['filed', 'under_review', 'analysis_pending', 'analysis_complete', 'judgment_pending', 'closed'];

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    caseType: { type: String, enum: CASE_TYPES, required: true },
    status: { type: String, enum: CASE_STATUSES, default: 'filed' },
    description: { type: String, default: null },

    // Parties
    plaintiffName: { type: String, default: null },
    defendantName: { type: String, default: null },
    plaintiffLawyer: { type: String, default: null },
    defendantLawyer: { type: String, default: null },

    // Court
    courtName: { type: String, default: null },
    filingDate: { type: Date, default: null },

    // AI-generated fields
    aiSummary: { type: String, default: null },
    aiKeyFacts: { type: [String], default: [] },
    aiTimeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
    aiTags: { type: [String], default: [] },
    aiEntities: { type: mongoose.Schema.Types.Mixed, default: null },

    // Judge reference
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });
caseSchema.index({ judgeId: 1 });
caseSchema.index({ createdAt: -1 });

// Cascade delete children when a case is removed
caseSchema.pre('findOneAndDelete', async function (next) {
  const caseDoc = await this.model.findOne(this.getFilter());
  if (caseDoc) {
    const id = caseDoc._id;
    await mongoose.model('Document').deleteMany({ caseId: id });
    await mongoose.model('Evidence').deleteMany({ caseId: id });
    await mongoose.model('Prediction').deleteMany({ caseId: id });
    await mongoose.model('ChatMessage').deleteMany({ caseId: id });
  }
  next();
});

export default mongoose.model('Case', caseSchema);
