// ===============================================
// CHALLENGE TEST MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const ChallengeTestSchema = new Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    
    // Challenge Type
    type: {
      type: String,
      required: true,
      enum: ['course', 'unit'],
      index: true
    },
    
    // Target Reference
    target_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'target_model',
      index: true
    },
    
    target_model: {
      type: String,
      required: true,
      enum: ['Course', 'Unit']
    },
    
    // Challenge Questions
    questions: [{
      question_text: {
        type: String,
        required: true,
        trim: true
      },
      options: [{
        type: String,
        required: true,
        trim: true
      }],
      correct_answer: {
        type: Number,
        required: true,
        min: 0
      },
      explanation: {
        type: String,
        trim: true
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
      },
      vocabulary_focus: [{
        type: Schema.Types.ObjectId,
        ref: 'Vocabulary'
      }],
      skill_focus: [{
        type: String,
        enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing']
      }]
    }],
    
    // Challenge Settings
    settings: {
      total_questions: {
        type: Number,
        required: true,
        min: 5,
        max: 50
      },
      pass_percentage: {
        type: Number,
        required: true,
        min: 60,
        max: 100,
        default: 80
      },
      must_correct_questions: [{
        type: Number,
        min: 0
      }],
      time_limit: {
        type: Number, // minutes
        required: true,
        min: 5,
        max: 180,
        default: 30
      },
      allow_retry: {
        type: Boolean,
        default: true
      },
      retry_delay_hours: {
        type: Number,
        default: 24
      },
      max_attempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 10
      }
    },
    
    // Challenge Metadata
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    
    xp_reward: {
      type: Number,
      default: 0
    },
    
    badge_reward: {
      type: String,
      default: null
    },
    
    // Status
    is_active: {
      type: Boolean,
      default: true,
      index: true
    },
    
    is_published: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Statistics
    total_attempts: {
      type: Number,
      default: 0
    },
    
    total_passes: {
      type: Number,
      default: 0
    },
    
    average_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // Admin Fields
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    last_updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'challenge_tests'
  }
);

// Indexes for better performance
ChallengeTestSchema.index({ type: 1, target_id: 1 });
ChallengeTestSchema.index({ is_active: 1, is_published: 1 });
ChallengeTestSchema.index({ difficulty: 1 });

// Virtual for pass rate
ChallengeTestSchema.virtual('pass_rate').get(function() {
  if (this.total_attempts === 0) return 0;
  return Math.round((this.total_passes / this.total_attempts) * 100);
});

// Ensure virtuals are serialized
ChallengeTestSchema.set('toJSON', { virtuals: true });
ChallengeTestSchema.set('toObject', { virtuals: true });

export const ChallengeTest = mongoose.model('ChallengeTest', ChallengeTestSchema); 