// ===============================================
// VOCABULARY MODEL - LINGUALEAP
// Following same pattern as user.js and course.js
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

const VocabularySchema = new Schema(
  {
    // User relationship
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Basic Word Data
    word: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    
    meaning: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    pronunciation: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null
    },
    
    example: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    
    // Difficulty & Frequency - UPDATED
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true
    },
    
    // Frequency Score - NEW FIELD
    frequency_score: {
      type: Number,
      default: 50, // 1-100 scale
      min: 1,
      max: 100
    },
    
    // Definitions with Context - NEW FIELD
    definitions: [{
      context: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      meaning: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },
      example: {
        type: String,
        trim: true,
        maxlength: 1000
      }
    }],
    
    // Learning Progress
    isLearned: {
      type: Boolean,
      default: false,
      index: true
    },
    
    learnedAt: {
      type: Date,
      default: null
    },
    
    // Organization
    category: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'general'
    },
    
    tags: [{
      type: String,
      trim: true,
      maxlength: 30
    }],
    
    // Learning Data
    reviewCount: {
      type: Number,
      default: 0
    },
    
    correctAnswers: {
      type: Number,
      default: 0
    },
    
    totalAttempts: {
      type: Number,
      default: 0
    },
    
    lastReviewed: {
      type: Date,
      default: null
    },
    
    nextReviewDate: {
      type: Date,
      default: null
    },
    
    // Source Information
    source: {
      type: String,
      enum: ['manual', 'lesson', 'import', 'suggestion'],
      default: 'manual'
    },
    
    sourceReference: {
      type: String,
      trim: true,
      default: null
    },
    
    // Lesson Integration (Optional)
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
    },
    
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    
    // Media URLs (Optional)
    audioUrl: {
      type: String,
      default: null
    },
    
    imageUrl: {
      type: String,
      default: null
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // Creator tracking
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    collection: "vocabulary",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===============================================
// INDEXES FOR PERFORMANCE (like other models)
// ===============================================

// Compound indexes
VocabularySchema.index({ userId: 1, word: 1 }, { unique: true }); // Prevent duplicates
VocabularySchema.index({ userId: 1, isLearned: 1 });
VocabularySchema.index({ userId: 1, createdAt: -1 });
VocabularySchema.index({ userId: 1, category: 1 });
VocabularySchema.index({ userId: 1, nextReviewDate: 1 });
VocabularySchema.index({ userId: 1, difficulty: 1 }); // NEW INDEX
VocabularySchema.index({ frequency_score: 1 }); // NEW INDEX

// Text search
VocabularySchema.index({ 
  word: 'text', 
  meaning: 'text' 
});

// ===============================================
// VIRTUAL FIELDS (like user.js pattern)
// ===============================================

VocabularySchema.virtual('daysSinceCreated').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

VocabularySchema.virtual('daysSinceLearned').get(function() {
  if (!this.learnedAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.learnedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

VocabularySchema.virtual('successRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.correctAnswers / this.totalAttempts) * 100);
});

VocabularySchema.virtual('isDueForReview').get(function() {
  if (!this.nextReviewDate || !this.isLearned) return false;
  return new Date() >= this.nextReviewDate;
});

// ===============================================
// PRE-SAVE MIDDLEWARE (like user.js pattern)
// ===============================================

VocabularySchema.pre('save', function(next) {
  // Auto set learnedAt when marking as learned
  if (this.isModified('isLearned')) {
    if (this.isLearned && !this.learnedAt) {
      this.learnedAt = new Date();
    } else if (!this.isLearned) {
      this.learnedAt = null;
    }
  }
  
  // Clean up empty strings
  if (this.pronunciation === '') this.pronunciation = null;
  if (this.example === '') this.example = null;
  if (this.audioUrl === '') this.audioUrl = null;
  if (this.imageUrl === '') this.imageUrl = null;
  
  next();
});

// ===============================================
// STATIC METHODS (following course.js pattern)
// ===============================================

VocabularySchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        isActive: true 
      } 
    },
    {
      $group: {
        _id: null,
        totalWords: { $sum: 1 },
        learnedWords: { 
          $sum: { $cond: ['$isLearned', 1, 0] } 
        },
        totalAttempts: { $sum: '$totalAttempts' },
        correctAnswers: { $sum: '$correctAnswers' },
        averageFrequency: { $avg: '$frequency_score' }
      }
    }
  ]);
};

VocabularySchema.statics.getUserCategories = function(userId) {
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        isActive: true 
      } 
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        learnedCount: { 
          $sum: { $cond: ['$isLearned', 1, 0] } 
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

VocabularySchema.statics.getWordsForReview = function(userId, limit = 10) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isLearned: true,
    isActive: true,
    $or: [
      { nextReviewDate: { $lte: new Date() } },
      { nextReviewDate: null }
    ]
  })
  .sort({ frequency_score: -1, lastReviewed: 1 })
  .limit(limit);
};

VocabularySchema.statics.clearAll = function(userId) {
  return this.deleteMany({ 
    userId: new mongoose.Types.ObjectId(userId) 
  });
};

// ===============================================
// EXPORT MODEL
// ===============================================

export const Vocabulary = mongoose.model('Vocabulary', VocabularySchema);