// ===============================================
// USER CHALLENGE ATTEMPT MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const UserChallengeAttemptSchema = new Schema(
  {
    // User and Challenge Reference
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    challenge_id: {
      type: Schema.Types.ObjectId,
      ref: 'ChallengeTest',
      required: true,
      index: true
    },
    
    // Attempt Session
    session_id: {
      type: String,
      required: true,
      unique: true
    },
    
    // User Answers
    answers: [{
      question_index: {
        type: Number,
        required: true,
        min: 0
      },
      selected_answer: {
        type: Number,
        required: true,
        min: 0
      },
      is_correct: {
        type: Boolean,
        required: true
      },
      time_taken: {
        type: Number, // seconds
        default: 0
      },
      answered_at: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Attempt Results
    score: {
      type: Number,
      required: true,
      min: 0
    },
    
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    
    passed: {
      type: Boolean,
      required: true
    },
    
    total_questions: {
      type: Number,
      required: true
    },
    
    correct_answers: {
      type: Number,
      required: true,
      min: 0
    },
    
    incorrect_answers: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Time Tracking
    started_at: {
      type: Date,
      required: true,
      default: Date.now
    },
    
    completed_at: {
      type: Date,
      default: null
    },
    
    time_taken: {
      type: Number, // seconds
      default: 0
    },
    
    time_limit: {
      type: Number, // minutes
      required: true
    },
    
    // Retry Logic
    attempt_number: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    
    can_retry_after: {
      type: Date,
      default: null
    },
    
    // Performance Analysis
    difficulty_breakdown: {
      beginner_correct: {
        type: Number,
        default: 0
      },
      beginner_total: {
        type: Number,
        default: 0
      },
      intermediate_correct: {
        type: Number,
        default: 0
      },
      intermediate_total: {
        type: Number,
        default: 0
      },
      advanced_correct: {
        type: Number,
        default: 0
      },
      advanced_total: {
        type: Number,
        default: 0
      }
    },
    
    skill_breakdown: {
      vocabulary_correct: {
        type: Number,
        default: 0
      },
      vocabulary_total: {
        type: Number,
        default: 0
      },
      grammar_correct: {
        type: Number,
        default: 0
      },
      grammar_total: {
        type: Number,
        default: 0
      },
      listening_correct: {
        type: Number,
        default: 0
      },
      listening_total: {
        type: Number,
        default: 0
      },
      speaking_correct: {
        type: Number,
        default: 0
      },
      speaking_total: {
        type: Number,
        default: 0
      },
      reading_correct: {
        type: Number,
        default: 0
      },
      reading_total: {
        type: Number,
        default: 0
      },
      writing_correct: {
        type: Number,
        default: 0
      },
      writing_total: {
        type: Number,
        default: 0
      }
    },
    
    // Rewards
    xp_gained: {
      type: Number,
      default: 0
    },
    
    badge_earned: {
      type: String,
      default: null
    },
    
    // Status
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'timeout', 'abandoned'],
      default: 'in_progress',
      index: true
    },
    
    // Metadata
    user_level_at_attempt: {
      type: String,
      required: true
    },
    
    user_xp_at_attempt: {
      type: Number,
      required: true
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true,
    collection: 'user_challenge_attempts'
  }
);

// Indexes for better performance
UserChallengeAttemptSchema.index({ user_id: 1, challenge_id: 1 });
UserChallengeAttemptSchema.index({ user_id: 1, status: 1 });
UserChallengeAttemptSchema.index({ challenge_id: 1, passed: 1 });
UserChallengeAttemptSchema.index({ completed_at: 1 });

// Virtual for time remaining
UserChallengeAttemptSchema.virtual('time_remaining').get(function() {
  if (this.status !== 'in_progress') return 0;
  const elapsed = (Date.now() - this.started_at.getTime()) / 1000;
  const remaining = (this.time_limit * 60) - elapsed;
  return Math.max(0, Math.floor(remaining));
});

// Virtual for is_timeout
UserChallengeAttemptSchema.virtual('is_timeout').get(function() {
  return this.time_remaining <= 0 && this.status === 'in_progress';
});

// Ensure virtuals are serialized
UserChallengeAttemptSchema.set('toJSON', { virtuals: true });
UserChallengeAttemptSchema.set('toObject', { virtuals: true });

export const UserChallengeAttempt = mongoose.model('UserChallengeAttempt', UserChallengeAttemptSchema); 