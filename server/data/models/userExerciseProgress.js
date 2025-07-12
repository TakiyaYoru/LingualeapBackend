import mongoose from 'mongoose';

const UserExerciseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
  score: { type: Number },
  attempts: { type: Number, default: 0 },
  lastAttemptedAt: { type: Date }
}, { timestamps: true });

UserExerciseProgressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

export const UserExerciseProgress = mongoose.model('UserExerciseProgress', UserExerciseProgressSchema); 