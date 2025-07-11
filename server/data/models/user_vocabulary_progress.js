// ===============================================
// USER VOCABULARY PROGRESS MODEL - SPACED REPETITION
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const UserVocabularyProgressSchema = new Schema(
  {
    // Relationships
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    vocabulary_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vocabulary',
      required: true,
      index: true
    },
    
    // Learning Progress
    mastery_level: {
      type: String,
      required: true,
      enum: ['new', 'learning', 'learned', 'mastered'],
      default: 'new',
      index: true
    },
    
    // Performance Tracking
    correct_answers: {
      type: Number,
      default: 0,
      min: 0
    },
    
    total_attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Learning Context
    first_learned_lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    
    lesson_encounters: [{
      lesson_id: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      context: {
        type: String // "main_focus", "supporting_word", "review"
      },
      performance: {
        correct: {
          type: Number,
          default: 0
        },
        total: {
          type: Number,
          default: 0
        }
      }
    }],
    
    // Spaced Repetition System
    spaced_repetition: {
      interval: {
        type: Number,
        default: 1 // days until next review
      },
      
      ease_factor: {
        type: Number,
        default: 2.5,
        min: 1.3 // Anki-style ease factor
      },
      
      repetitions: {
        type: Number,
        default: 0 // number of successful repetitions
      },
      
      last_reviewed: {
        type: Date,
        default: null
      },
      
      next_review_date: {
        type: Date,
        default: function() {
          return new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
        },
        index: true
      },
      
      review_history: [{
        date: {
          type: Date,
          default: Date.now
        },
        quality: {
          type: Number,
          min: 0,
          max: 5 // 0-5 scale (0=total failure, 5=perfect)
        },
        interval_before: Number,
        interval_after: Number,
        ease_factor_before: Number,
        ease_factor_after: Number
      }]
    },
    
    // Exercise Performance by Type
    exercise_performance: {
      multiple_choice: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      fill_blank: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      listening: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      translation: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      word_matching: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      sentence_building: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      true_false: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      listen_choose: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      speak_repeat: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      }
    },
    
    // Metadata
    first_learned_at: {
      type: Date,
      default: Date.now
    },
    
    last_practiced_at: {
      type: Date,
      default: Date.now
    },
    
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'user_vocabulary_progress'
  }
);

// Compound indexes for performance
UserVocabularyProgressSchema.index({ user_id: 1, vocabulary_id: 1 }, { unique: true });
UserVocabularyProgressSchema.index({ user_id: 1, mastery_level: 1 });
UserVocabularyProgressSchema.index({ user_id: 1, 'spaced_repetition.next_review_date': 1 });
UserVocabularyProgressSchema.index({ 'spaced_repetition.next_review_date': 1 });

// Virtual for success rate
UserVocabularyProgressSchema.virtual('success_rate').get(function() {
  return this.total_attempts > 0 ? Math.round((this.correct_answers / this.total_attempts) * 100) : 0;
});

// Virtual for is due for review
UserVocabularyProgressSchema.virtual('is_due_for_review').get(function() {
  return this.spaced_repetition.next_review_date <= new Date();
});

// Method to update progress after exercise
UserVocabularyProgressSchema.methods.updateProgress = function(exerciseType, isCorrect, quality = null) {
  // Update overall stats
  this.total_attempts++;
  if (isCorrect) {
    this.correct_answers++;
  }
  
  // Update exercise-specific performance
  if (this.exercise_performance[exerciseType]) {
    this.exercise_performance[exerciseType].total++;
    if (isCorrect) {
      this.exercise_performance[exerciseType].correct++;
    }
  }
  
  // Update spaced repetition if quality provided
  if (quality !== null) {
    this.updateSpacedRepetition(quality);
  }
  
  // Update mastery level based on success rate
  this.updateMasteryLevel();
  
  this.last_practiced_at = new Date();
  
  return this;
};

// Method to update spaced repetition (SM-2 algorithm)
UserVocabularyProgressSchema.methods.updateSpacedRepetition = function(quality) {
  const sr = this.spaced_repetition;
  
  // Record review history
  sr.review_history.push({
    date: new Date(),
    quality: quality,
    interval_before: sr.interval,
    interval_after: null, // will be set below
    ease_factor_before: sr.ease_factor,
    ease_factor_after: null // will be set below
  });
  
  if (quality >= 3) {
    // Correct response
    if (sr.repetitions === 0) {
      sr.interval = 1;
    } else if (sr.repetitions === 1) {
      sr.interval = 6;
    } else {
      sr.interval = Math.round(sr.interval * sr.ease_factor);
    }
    sr.repetitions++;
  } else {
    // Incorrect response
    sr.repetitions = 0;
    sr.interval = 1;
  }
  
  // Update ease factor
  sr.ease_factor = sr.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (sr.ease_factor < 1.3) {
    sr.ease_factor = 1.3;
  }
  
  // Set next review date
  sr.last_reviewed = new Date();
  sr.next_review_date = new Date(Date.now() + sr.interval * 24 * 60 * 60 * 1000);
  
  // Update history record
  const lastHistory = sr.review_history[sr.review_history.length - 1];
  lastHistory.interval_after = sr.interval;
  lastHistory.ease_factor_after = sr.ease_factor;
  
  return this;
};

// Method to update mastery level
UserVocabularyProgressSchema.methods.updateMasteryLevel = function() {
  const successRate = this.success_rate;
  const totalAttempts = this.total_attempts;
  
  if (totalAttempts >= 10 && successRate >= 90) {
    this.mastery_level = 'mastered';
  } else if (totalAttempts >= 5 && successRate >= 70) {
    this.mastery_level = 'learned';
  } else if (totalAttempts >= 1) {
    this.mastery_level = 'learning';
  } else {
    this.mastery_level = 'new';
  }
  
  return this;
};

// Static method to get words due for review
UserVocabularyProgressSchema.statics.getWordsForReview = function(userId, limit = 20) {
  return this.find({
    user_id: userId,
    'spaced_repetition.next_review_date': { $lte: new Date() },
    is_active: true
  })
  .populate('vocabulary_id')
  .sort({ 'spaced_repetition.next_review_date': 1 })
  .limit(limit);
};

// Static method to get progress stats
UserVocabularyProgressSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId), is_active: true } },
    {
      $group: {
        _id: '$mastery_level',
        count: { $sum: 1 },
        avg_success_rate: { $avg: { $cond: [{ $gt: ['$total_attempts', 0] }, { $multiply: [{ $divide: ['$correct_answers', '$total_attempts'] }, 100] }, 0] } }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
UserVocabularyProgressSchema.set('toJSON', { virtuals: true });
UserVocabularyProgressSchema.set('toObject', { virtuals: true });