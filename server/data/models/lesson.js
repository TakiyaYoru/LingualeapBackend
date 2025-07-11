// ===============================================
// LESSON MODEL - VOCABULARY PROMPTS + AI CONFIG
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
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    unit_id: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true
    },
    
    // Lesson Content Focus
    lesson_type: {
      type: String,
      required: true,
      enum: ['vocabulary', 'grammar', 'mixed'],
      default: 'vocabulary'
    },
    objective: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200 // "Học cách chào hỏi cơ bản"
    },
    
    // VOCABULARY PROMPTS POOL - KEY SECTION
    vocabulary_pool: [{
      vocabulary_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vocabulary',
        required: true
      },
      context_in_lesson: {
        type: String,
        required: true // "greeting words", "polite expressions"
      },
      is_main_focus: {
        type: Boolean,
        default: true // true = từ chính, false = từ phụ
      },
      introduction_order: {
        type: Number,
        required: true // thứ tự giới thiệu trong lesson
      },
      difficulty_weight: {
        type: Number,
        min: 1,
        max: 5,
        default: 3 // ảnh hưởng exercise generation
      }
    }],
    
    // Context cho AI Generation - KEY SECTION
    lesson_context: {
      situation: {
        type: String,
        required: true // "meeting new people", "ordering food"
      },
      cultural_context: {
        type: String,
        default: "Vietnamese social customs"
      },
      use_cases: [{
        type: String // ["formal greeting", "casual greeting"]
      }],
      avoid_topics: [{
        type: String // ["romantic", "religious", "political"]
      }]
    },
    
    // Grammar Integration (nhẹ)
    grammar_point: {
      title: {
        type: String // "Present Simple with 'be'"
      },
      explanation: {
        type: String
      },
      pattern: {
        type: String // "I am + adjective"
      },
      examples: [{
        type: String // "I am happy", "You are nice"
      }]
    },
    
    // Exercise Generation Config - KEY SECTION
    exercise_generation: {
      total_exercises: {
        type: Number,
        default: 7,
        min: 5,
        max: 10
      },
      exercise_distribution: {
        multiple_choice: {
          type: Number,
          default: 2
        },
        fill_blank: {
          type: Number,
          default: 2
        },
        listening: {
          type: Number,
          default: 1
        },
        translation: {
          type: Number,
          default: 1
        },
        word_matching: {
          type: Number,
          default: 1
        },
        listen_choose: {
          type: Number,
          default: 0
        },
        speak_repeat: {
          type: Number,
          default: 0
        }
      },
      difficulty_progression: {
        type: Boolean,
        default: true // true = dễ → khó
      },
      vocabulary_coverage: {
        type: String,
        enum: ['all', 'random_subset', 'main_focus_only'],
        default: 'all'
      }
    },
    
    // Lesson Metadata
    estimated_duration: {
      type: Number, // 15-20 minutes
      required: true,
      min: 10,
      max: 30
    },
    xp_reward: {
      type: Number,
      default: 10
    },
    
    // Access Control
    is_premium: {
      type: Boolean,
      default: false
    },
    is_published: {
      type: Boolean,
      default: false
    },
    
    // Ordering
    sort_order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'lessons'
  }
);

// Indexes for performance
LessonSchema.index({ course_id: 1, unit_id: 1, sort_order: 1 });
LessonSchema.index({ lesson_type: 1 });
LessonSchema.index({ is_published: 1 });
LessonSchema.index({ 'vocabulary_pool.vocabulary_id': 1 });

// Virtual fields for user progress
LessonSchema.virtual('status').get(function() {
  return this._status || 'locked'; // 'locked', 'available', 'in_progress', 'completed'
});

LessonSchema.virtual('is_completed').get(function() {
  return this._is_completed || false;
});

LessonSchema.virtual('is_unlocked').get(function() {
  return this._is_unlocked !== undefined ? this._is_unlocked : false;
});

LessonSchema.virtual('user_score').get(function() {
  return this._user_score || 0;
});

// Method to get main vocabulary words
LessonSchema.methods.getMainVocabulary = function() {
  return this.vocabulary_pool.filter(item => item.is_main_focus);
};

// Method to get vocabulary by difficulty
LessonSchema.methods.getVocabularyByDifficulty = function(difficulty) {
  return this.vocabulary_pool.filter(item => item.difficulty_weight === difficulty);
};

// Ensure virtual fields are serialized
LessonSchema.set('toJSON', { virtuals: true });
LessonSchema.set('toObject', { virtuals: true });