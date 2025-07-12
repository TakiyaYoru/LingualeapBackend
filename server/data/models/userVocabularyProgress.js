import mongoose from 'mongoose';

const UserVocabularyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vocabularyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true, index: true },
  proficiencyLevel: { type: String, enum: ['NEW', 'LEARNING', 'REVIEWING', 'MASTERED'], default: 'NEW' },
  reviewCount: { type: Number, default: 0 },
  lastReviewedAt: { type: Date },
  nextReviewAt: { type: Date },
  customNotes: { type: String }
}, { timestamps: true });

UserVocabularyProgressSchema.index({ userId: 1, vocabularyId: 1 }, { unique: true });

export const UserVocabularyProgress = mongoose.model('UserVocabularyProgress', UserVocabularyProgressSchema); 