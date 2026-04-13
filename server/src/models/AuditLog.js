import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', default: null },
  action: { type: String, required: true, enum: [
    'case_created', 'case_updated', 'case_deleted',
    'analysis_triggered', 'analysis_completed', 'analysis_failed',
    'prediction_viewed', 'prediction_generated',
    'document_uploaded', 'document_processed',
    'evidence_created', 'evidence_updated',
    'chat_message_sent', 'chat_response_received',
    'similar_cases_searched',
    'bail_assessment_generated',
    'statute_lookup',
    'pdf_exported',
    'login', 'logout'
  ]},
  details: { type: mongoose.Schema.Types.Mixed, default: null }, // Flexible JSON for action-specific data
  aiModel: { type: String, default: null }, // Which AI model was used
  aiInput: { type: String, default: null }, // Truncated input sent to AI (first 500 chars)
  aiOutput: { type: String, default: null }, // Truncated output from AI (first 500 chars)
  aiTokensUsed: { type: Number, default: null },
  durationMs: { type: Number, default: null }, // How long the operation took
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ caseId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
