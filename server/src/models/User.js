import mongoose from 'mongoose';

const USER_ROLES = ['judge', 'clerk', 'lawyer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashedPassword: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: 'judge' },
    courtName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
