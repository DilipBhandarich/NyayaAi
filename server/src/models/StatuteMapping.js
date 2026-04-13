import mongoose from 'mongoose';

const statuteMappingSchema = new mongoose.Schema({
  oldCode: { type: String, required: true }, // e.g., "IPC", "CrPC", "Evidence Act"
  oldSection: { type: String, required: true }, // e.g., "302", "498A"
  oldDescription: { type: String, default: null },
  newCode: { type: String, required: true }, // e.g., "BNS", "BNSS", "BSA"
  newSection: { type: String, required: true }, // e.g., "103", "86"
  newDescription: { type: String, default: null },
  maxPenalty: { type: String, default: null },
  cognizable: { type: Boolean, default: null },
  bailable: { type: Boolean, default: null },
  compoundable: { type: Boolean, default: null },
  category: { type: String, default: null }, // e.g., "Offences Against Body", "Property Offences"
}, { timestamps: { createdAt: true, updatedAt: false } });

statuteMappingSchema.index({ oldCode: 1, oldSection: 1 });
statuteMappingSchema.index({ newCode: 1, newSection: 1 });
statuteMappingSchema.index({ category: 1 });

export default mongoose.model('StatuteMapping', statuteMappingSchema);
