// ===============================================
// UNIT MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const UnitSchema = new Schema(
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
      required: true,
      trim: true,
      maxlength: 300
    },
    
    // Course Relationship
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    
    // Unit Theme
    theme: {
      type: String,
      required: true,
      enum: [
        'daily_life',           // Cuộc sống hàng ngày
        'family_friends',       // Gia đình và bạn bè
        'food_dining',          // Ăn uống
        'travel_transport',     // Du lịch và giao thông
        'work_career',          // Công việc và sự nghiệp
        'health_fitness',       // Sức khỏe và thể dục
        'shopping',             // Mua sắm
        'education',            // Giáo dục
        'entertainment',        // Giải trí
        'weather_seasons',      // Thời tiết và mùa
        'home_living',          // Nhà ở và sinh hoạt
        'numbers_time',         // Số và thời gian
        'colors_shapes',        // Màu sắc và hình dạng
        'greetings_intro',      // Chào hỏi và giới thiệu
        'hobbies_interests'     // Sở thích và quan tâm
      ],
      index: true
    },
    
    // Visual
    icon: {
      type: String,
      default: null // Icon name or URL
    },
    color: {
      type: String,
      default: '#4A90E2' // Hex color for unit theme
    },
    illustration: {
      type: String,
      default: null // URL to unit illustration
    },
    
    // Unit Structure
    totalLessons: {
      type: Number,
      default: 0
    },
    totalExercises: {
      type: Number,
      default: 0
    },
    estimatedDuration: {
      type: Number, // Estimated minutes to complete
      required: true,
      min: 5
    },
    
    // Prerequisites & Challenge - UPDATED
    prerequisites: {
      previous_unit_id: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        default: null
      },
      minimum_score: {
        type: Number,
        default: 80, // 80% from previous unit
        min: 0,
        max: 100
      },
      required_hearts: {
        type: Number,
        default: 1, // hearts needed to unlock
        min: 0,
        max: 5
      }
    },
    
    // Challenge Test - NEW FIELD
    challenge_test: {
      total_questions: {
        type: Number,
        default: 10,
        min: 5,
        max: 20
      },
      pass_percentage: {
        type: Number,
        default: 80,
        min: 60,
        max: 100
      },
      must_correct_questions: [{
        type: Number,
        min: 1
      }]
    },
    
    // Learning Content
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
      pronunciation: {
        type: String,
        default: null // IPA or phonetic
      },
      audioUrl: {
        type: String,
        default: null
      },
      example: {
        sentence: String,
        translation: String
      }
    }],
    
    grammarPoints: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      explanation: {
        type: String,
        required: true
      },
      examples: [{
        sentence: String,
        translation: String
      }]
    }],
    
    // Access Control
    isPremium: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    
    // Unlock Requirements - DEPRECATED (use prerequisites instead)
    requiresUnlock: {
      type: Boolean,
      default: true
    },
    unlockRequirements: {
      previousUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        default: null
      },
      minimumXP: {
        type: Number,
        default: 0
      },
      minimumStreak: {
        type: Number,
        default: 0
      }
    },
    
    // Gamification
    xpReward: {
      type: Number,
      default: 50 // XP for completing entire unit
    },
    badgeReward: {
      type: String,
      default: null // Badge name for unit completion
    },
    
    // Ordering
    sortOrder: {
      type: Number,
      required: true,
      index: true
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
    }
  },
  {
    timestamps: true,
    collection: 'units'
  }
);

// Compound indexes
UnitSchema.index({ courseId: 1, sortOrder: 1 });
UnitSchema.index({ theme: 1, isPremium: 1 });
UnitSchema.index({ courseId: 1, isPublished: 1 });

// Virtual for unit progress (calculated from user progress)
UnitSchema.virtual('progressPercentage').get(function() {
  // This will be populated when querying with user context
  return this._progressPercentage || 0;
});

// Virtual for unlock status
UnitSchema.virtual('isUnlocked').get(function() {
  // This will be calculated based on user progress
  return this._isUnlocked !== undefined ? this._isUnlocked : false;
});

// Ensure virtual fields are serialized
UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });