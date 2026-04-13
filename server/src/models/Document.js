import mongoose from 'mongoose';

const DOC_TYPES = ['fir', 'case_file', 'evidence', 'witness_statement', 'legal_argument', 'court_record', 'other'];

const documentSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: null },
    documentType: { type: String, enum: DOC_TYPES, default: 'other' },

    extractedText: { type: String, default: null },
    isProcessed: { type: Boolean, default: false },

    aiSummary: { type: String, default: null },
    aiEntities: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

documentSchema.index({ caseId: 1 });
documentSchema.index({ isProcessed: 1 });

export default mongoose.model('Document', documentSchema);
