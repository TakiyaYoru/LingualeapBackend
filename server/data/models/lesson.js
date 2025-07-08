// ===============================================
// LESSON MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const LessonSchema = new Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    
    // Relationships
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true
    },
    
    // Lesson Type
    type: {
      type: String,
      required: true,
      enum: [
        'vocabulary',     // Từ vựng
        'grammar',        // Ngữ pháp
        'listening',      // Nghe
        'speaking',       // Nói
        'reading',        // Đọc
        'writing',        // Viết
        'conversation',   // Hội thoại
        'review',         // Ôn tập
        'test'           // Kiểm tra
      ],
      index: true
    },
    
    // Visual & Media
    icon: {
      type: String,
      default: null
    },
    thumbnail: {
      type: String,
      default: null
    },
    
    // Lesson Content
    introduction: {
      text: String,
      audioUrl: String
    },
    
    // Learning Materials
    vocabulary: [{
      word: {
        type: String,
        required: true,
        trim: true
      },
      meaning: {
        type: String,
        required: true,
        trim: true
      },
      pronunciation: String,
      audioUrl: String,
      imageUrl: String,
      example: {
        sentence: String,
        translation: String,
        audioUrl: String
      }
    }],
    
    grammarFocus: {
      title: String,
      explanation: String,
      examples: [{
        sentence: String,
        translation: String,
        highlight: String // Part to highlight
      }]
    },
    
    // Lesson Structure
    totalExercises: {
      type: Number,
      default: 0
    },
    estimatedDuration: {
      type: Number, // Minutes
      required: true,
      min: 1
    },
    
    // Difficulty & Requirements
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    
    // Access Control
    isPremium: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    
    // Unlock Requirements
    requiresUnlock: {
      type: Boolean,
      default: true
    },
    unlockRequirements: {
      previousLessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        default: null
      },
      minimumScore: {
        type: Number,
        default: 80 // Minimum percentage score from previous lesson
      },
      requiredHearts: {
        type: Number,
        default: 1 // Hearts needed to start lesson
      }
    },
    
    // Gamification
    xpReward: {
      type: Number,
      default: 10 // Base XP for completing lesson
    },
    perfectScoreBonus: {
      type: Number,
      default: 5 // Extra XP for perfect score
    },
    
    // Lesson Goals
    targetAccuracy: {
      type: Number,
      default: 80 // Target accuracy percentage
    },
    passThreshold: {
      type: Number,
      default: 70 // Minimum score to pass
    },
    
    // Ordering
    sortOrder: {
      type: Number,
      required: true,
      index: true
    },
    
    // Statistics
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    
    // Admin Fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Lesson Notes (for instructors)
    teachingNotes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'lessons'
  }
);

// Compound indexes
LessonSchema.index({ unitId: 1, sortOrder: 1 });
LessonSchema.index({ courseId: 1, type: 1 });
LessonSchema.index({ isPremium: 1, isPublished: 1 });
LessonSchema.index({ type: 1, difficulty: 1 });

// Virtual for lesson status
LessonSchema.virtual('status').get(function() {
  // Will be set based on user progress
  return this._status || 'locked'; // locked, available, completed
});

// Virtual for user score
LessonSchema.virtual('userScore').get(function() {
  return this._userScore || null;
});

// Virtual for completion status
LessonSchema.virtual('isCompleted').get(function() {
  return this._isCompleted || false;
});

// Virtual for unlock status
LessonSchema.virtual('isUnlocked').get(function() {
  return this._isUnlocked !== undefined ? this._isUnlocked : false;
});

// Ensure virtual fields are serialized
LessonSchema.set('toJSON', { virtuals: true });
LessonSchema.set('toObject', { virtuals: true });