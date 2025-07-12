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
    
    // Lesson Type - UPDATED
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
    
    // Lesson Type Focus - NEW FIELD
    lesson_type: {
      type: String,
      enum: ['vocabulary', 'grammar', 'mixed'],
      default: 'vocabulary'
    },
    
    // Lesson Objective - NEW FIELD
    objective: {
      type: String,
      trim: true,
      maxlength: 200
    },
    
    // VOCABULARY POOL - NEW FIELD
    vocabulary_pool: [{
      vocabulary_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vocabulary'
      },
      context_in_lesson: {
        type: String,
        trim: true,
        maxlength: 100
      },
      is_main_focus: {
        type: Boolean,
        default: true
      },
      introduction_order: {
        type: Number,
        default: 1
      },
      difficulty_weight: {
        type: Number,
        default: 3,
        min: 1,
        max: 5
      }
    }],
    
    // LESSON CONTEXT - NEW FIELD
    lesson_context: {
      situation: {
        type: String,
        trim: true,
        maxlength: 200
      },
      cultural_context: {
        type: String,
        trim: true,
        maxlength: 300
      },
      use_cases: [{
        type: String,
        trim: true,
        maxlength: 100
      }],
      avoid_topics: [{
        type: String,
        trim: true,
        maxlength: 100
      }]
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
    
    // Learning Materials - DEPRECATED (use vocabulary_pool instead)
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
    
    // GRAMMAR INTEGRATION - NEW FIELD
    grammar_point: {
      title: {
        type: String,
        trim: true,
        maxlength: 100
      },
      explanation: {
        type: String,
        trim: true,
        maxlength: 500
      },
      pattern: {
        type: String,
        trim: true,
        maxlength: 100
      },
      examples: [{
        type: String,
        trim: true,
        maxlength: 200
      }]
    },
    
    // EXERCISE GENERATION CONFIG - NEW FIELD
    exercise_generation: {
      total_exercises: {
        type: Number,
        default: 6,
        min: 4,
        max: 10
      },
      exercise_distribution: {
        multiple_choice: {
          type: Number,
          default: 2,
          min: 0
        },
        fill_blank: {
          type: Number,
          default: 2,
          min: 0
        },
        listening: {
          type: Number,
          default: 1,
          min: 0
        },
        translation: {
          type: Number,
          default: 1,
          min: 0
        },
        word_matching: {
          type: Number,
          default: 1,
          min: 0
        },
        listen_choose: {
          type: Number,
          default: 1,
          min: 0
        },
        speak_repeat: {
          type: Number,
          default: 1,
          min: 0
        }
      },
      difficulty_progression: {
        type: Boolean,
        default: true
      },
      vocabulary_coverage: {
        type: String,
        enum: ['all', 'random_subset'],
        default: 'all'
      }
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
LessonSchema.index({ lesson_type: 1 }); // NEW INDEX

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