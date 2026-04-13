import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ caseId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
