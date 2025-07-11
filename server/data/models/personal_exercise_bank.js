// ===============================================
// PERSONAL EXERCISE BANK MODEL - CLIENT-SIDE STORAGE
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const PersonalExerciseBankSchema = new Schema(
  {
    // Relationships
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Exercise Content (Complete AI-generated exercise)
    exercise_content: {
      type: Schema.Types.Mixed,
      required: true
      /*
      Stored JSON structure depends on exercise type:
      
      Multiple Choice:
      {
        "question": "What does 'hello' mean in Vietnamese?",
        "options": ["xin chào", "tạm biệt", "cảm ơn", "xin lỗi"],
        "correct_index": 0,
        "explanation": "'Hello' là lời chào phổ biến nhất"
      }
      
      Fill Blank:
      {
        "sentence": "I say _____ when I meet my friends.",
        "correct_word": "hello",
        "translation": "Tôi nói _____ khi gặp bạn bè.",
        "alternatives": ["hi", "hey"]
      }
      
      Listening:
      {
        "audio_text": "Hello, how are you today?",
        "question": "What greeting did you hear?",
        "options": ["Hello", "Goodbye", "Thank you"],
        "correct_index": 0,
        "audio_url": "http://localhost:4000/audio/play/xyz"
      }
      */
    },
    
    // Exercise Metadata
    exercise_type: {
      type: String,
      required: true,
      enum: [
        'multiple_choice',
        'fill_blank',
        'listening',
        'translation',
        'word_matching',
        'sentence_building',
        'true_false',
        'listen_choose',
        'speak_repeat'
      ],
      index: true
    },
    
    // Source Information
    source_lesson_id: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true
    },
    
    vocabulary_focus: [{
      type: Schema.Types.ObjectId,
      ref: 'Vocabulary',
      required: true
    }],
    
    lesson_context: {
      situation: String, // "meeting new people"
      theme: String,     // "greetings_intro"
      difficulty: String // "beginner"
    },
    
    // Performance Tracking
    completed_at: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    
    performance: {
      type: String,
      required: true,
      enum: ['correct', 'incorrect', 'partially_correct'],
      index: true
    },
    
    time_taken: {
      type: Number, // seconds
      required: true,
      min: 1
    },
    
    // User Response (for analysis)
    user_response: {
      type: Schema.Types.Mixed
      /*
      Stores what user actually answered:
      - Multiple choice: selected_index
      - Fill blank: user_input
      - Translation: user_translation
      - etc.
      */
    },
    
    // Review Priority (for spaced repetition)
    review_priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: function() {
        return this.performance === 'incorrect' ? 'high' : 
               this.performance === 'partially_correct' ? 'medium' : 'low';
      },
      index: true
    },
    
    // AI Generation Info (for debugging/analytics)
    ai_generation_info: {
      model_used: {
        type: String,
        default: 'claude-3-5-sonnet-20241022'
      },
      generation_time: Number, // seconds
      prompt_version: String,
      fallback_used: {
        type: Boolean,
        default: false
      }
    },
    
    // Practice Tracking
    practice_sessions: [{
      practiced_at: {
        type: Date,
        default: Date.now
      },
      performance: {
        type: String,
        enum: ['correct', 'incorrect', 'partially_correct']
      },
      time_taken: Number,
      context: {
        type: String,
        enum: ['lesson_practice', 'review_session', 'challenge_mode']
      }
    }],
    
    // Status
    is_active: {
      type: Boolean,
      default: true
    },
    
    // Flagging for content issues
    is_flagged: {
      type: Boolean,
      default: false
    },
    
    flag_reason: {
      type: String,
      enum: ['inappropriate_content', 'incorrect_answer', 'poor_quality', 'technical_issue']
    }
  },
  {
    timestamps: true,
    collection: 'personal_exercise_bank'
  }
);

// Indexes for performance
PersonalExerciseBankSchema.index({ user_id: 1, exercise_type: 1 });
PersonalExerciseBankSchema.index({ user_id: 1, source_lesson_id: 1 });
PersonalExerciseBankSchema.index({ user_id: 1, review_priority: 1 });
PersonalExerciseBankSchema.index({ user_id: 1, completed_at: -1 });
PersonalExerciseBankSchema.index({ vocabulary_focus: 1 });
PersonalExerciseBankSchema.index({ performance: 1 });

// Virtual for total practice count
PersonalExerciseBankSchema.virtual('total_practices').get(function() {
  return this.practice_sessions.length;
});

// Virtual for latest practice performance
PersonalExerciseBankSchema.virtual('latest_performance').get(function() {
  if (this.practice_sessions.length === 0) return this.performance;
  return this.practice_sessions[this.practice_sessions.length - 1].performance;
});

// Virtual for success rate in practice
PersonalExerciseBankSchema.virtual('practice_success_rate').get(function() {
  if (this.practice_sessions.length === 0) return 0;
  
  const correctCount = this.practice_sessions.filter(session => session.performance === 'correct').length;
  return Math.round((correctCount / this.practice_sessions.length) * 100);
});

// Method to add practice session
PersonalExerciseBankSchema.methods.addPracticeSession = function(performance, timeTaken, context = 'review_session') {
  this.practice_sessions.push({
    practiced_at: new Date(),
    performance: performance,
    time_taken: timeTaken,
    context: context
  });
  
  // Update review priority based on recent performance
  this.updateReviewPriority();
  
  return this;
};

// Method to update review priority
PersonalExerciseBankSchema.methods.updateReviewPriority = function() {
  const recentSessions = this.practice_sessions.slice(-3); // Last 3 sessions
  
  if (recentSessions.length === 0) return this;
  
  const incorrectCount = recentSessions.filter(s => s.performance === 'incorrect').length;
  const correctCount = recentSessions.filter(s => s.performance === 'correct').length;
  
  if (incorrectCount >= 2) {
    this.review_priority = 'high';
  } else if (correctCount >= 3) {
    this.review_priority = 'low';
  } else {
    this.review_priority = 'medium';
  }
  
  return this;
};

// Static method to get exercises for review
PersonalExerciseBankSchema.statics.getExercisesForReview = function(userId, options = {}) {
  const {
    exercise_type,
    review_priority,
    vocabulary_id,
    limit = 20,
    exclude_recent_hours = 24
  } = options;
  
  let query = {
    user_id: userId,
    is_active: true,
    completed_at: {
      $lt: new Date(Date.now() - exclude_recent_hours * 60 * 60 * 1000)
    }
  };
  
  if (exercise_type) {
    query.exercise_type = exercise_type;
  }
  
  if (review_priority) {
    query.review_priority = review_priority;
  }
  
  if (vocabulary_id) {
    query.vocabulary_focus = vocabulary_id;
  }
  
  return this.find(query)
    .populate('vocabulary_focus', 'word meaning')
    .populate('source_lesson_id', 'title')
    .sort({ review_priority: -1, completed_at: 1 })
    .limit(limit);
};

// Static method to get user exercise statistics
PersonalExerciseBankSchema.statics.getUserExerciseStats = function(userId) {
  return this.aggregate([
    { 
      $match: { 
        user_id: new mongoose.Types.ObjectId(userId), 
        is_active: true 
      } 
    },
    {
      $group: {
        _id: {
          exercise_type: '$exercise_type',
          performance: '$performance'
        },
        count: { $sum: 1 },
        avg_time: { $avg: '$time_taken' }
      }
    },
    {
      $group: {
        _id: '$_id.exercise_type',
        total_exercises: { $sum: '$count' },
        performance_breakdown: {
          $push: {
            performance: '$_id.performance',
            count: '$count',
            avg_time: '$avg_time'
          }
        }
      }
    }
  ]);
};

// Static method to get vocabulary practice frequency
PersonalExerciseBankSchema.statics.getVocabularyPracticeFrequency = function(userId, vocabularyId) {
  return this.countDocuments({
    user_id: userId,
    vocabulary_focus: vocabularyId,
    is_active: true
  });
};

// Ensure virtual fields are serialized
PersonalExerciseBankSchema.set('toJSON', { virtuals: true });
PersonalExerciseBankSchema.set('toObject', { virtuals: true });