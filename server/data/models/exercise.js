// ===============================================
// EXERCISE MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const ExerciseSchema = new Schema(
  {
    // Basic Information
    title: {
      type: String,
      trim: true,
      maxlength: 200
    },
    instruction: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    // Exercise Type Display - NEW FIELD
    type_display_name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Bài tập"
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
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true
    },
    
    // Exercise Type
    type: {
      type: String,
      required: true,
      enum: [
        'multiple_choice',      // Chọn đáp án đúng
        'fill_blank',          // Điền từ vào chỗ trống
        'listening',           // Nghe và chọn/viết
        'translation',         // Dịch Việt-Anh hoặc Anh-Việt
        'speaking',            // Luyện phát âm
        'reading',             // Đọc hiểu
        'word_matching',       // Ghép từ với nghĩa
        'sentence_building',   // Sắp xếp từ thành câu
        'true_false',          // Đúng/Sai
        'drag_drop',           // Kéo thả
        'listen_choose',       // Nghe và chọn hình ảnh
        'speak_repeat'         // Nói và lặp lại
      ],
      index: true
    },
    
    // AI PROMPT TEMPLATE - NEW FIELD
    prompt_template: {
      system_context: {
        type: String,
        trim: true,
        maxlength: 1000
      },
      main_prompt: {
        type: String,
        trim: true,
        maxlength: 2000
      },
      variables: [{
        type: String,
        trim: true
      }],
      expected_output_format: {
        type: Schema.Types.Mixed,
        default: {}
      },
      fallback_template: {
        type: Schema.Types.Mixed,
        default: {}
      }
    },
    
    // GENERATION RULES - NEW FIELD
    generation_rules: {
      max_attempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 5
      },
      validation_rules: [{
        type: String,
        trim: true
      }],
      difficulty_adaptation: {
        type: Boolean,
        default: true
      },
      content_filters: [{
        type: String,
        trim: true
      }]
    },
    
    // SKILL FOCUS - NEW FIELD
    skill_focus: [{
      type: String,
      enum: ['vocabulary', 'listening', 'pronunciation', 'grammar', 'reading', 'speaking', 'writing'],
      required: true
    }],
    
    // Exercise Content - Base Fields
    question: {
      text: {
        type: String,
        required: true
      },
      audioUrl: String,
      imageUrl: String,
      videoUrl: String
    },
    
    // Type-specific Content - Sử dụng Mixed type để tránh validation issues
    content: {
      type: Schema.Types.Mixed,
      default: {}
    },
    
    wordMatching: {
      pairs: [{
        word: {
          type: String,
          required: true
        },
        meaning: {
          type: String,
          required: true
        },
        audioUrl: String
      }]
    },
    
    sentenceBuilding: {
      targetSentence: {
        type: String,
        required: false
      },
      words: [String], // Shuffled words
      translation: String
    },
    
    // Scoring & Feedback
    maxScore: {
      type: Number,
      default: 100
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    
    // Feedback Messages
    feedback: {
      correct: {
        type: String,
        default: 'Correct! Well done!'
      },
      incorrect: {
        type: String,
        default: 'Not quite right. Try again!'
      },
      hint: String
    },
    
    // Timing
    timeLimit: {
      type: Number, // Seconds, null = no limit
      default: null
    },
    estimatedTime: {
      type: Number, // Seconds
      default: 30
    },
    
    // AUDIO REQUIREMENTS - NEW FIELDS
    requires_audio: {
      type: Boolean,
      default: false
    },
    requires_microphone: {
      type: Boolean,
      default: false
    },
    
    // Gamification
    xpReward: {
      type: Number,
      default: 5
    },
    
    // Access Control
    isPremium: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
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
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
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
    
    // Tags for categorization
    tags: [String]
  },
  {
    timestamps: true,
    collection: 'exercises'
  }
);

// Indexes for better performance
ExerciseSchema.index({ lessonId: 1, sortOrder: 1 });
ExerciseSchema.index({ type: 1, difficulty: 1 });
ExerciseSchema.index({ unitId: 1, type: 1 });
ExerciseSchema.index({ courseId: 1, isPremium: 1 });
ExerciseSchema.index({ skill_focus: 1 }); // NEW INDEX

// Virtual for success rate
ExerciseSchema.virtual('successRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.correctAttempts / this.totalAttempts) * 100);
});

// Virtual for user status
ExerciseSchema.virtual('userAnswer').get(function() {
  return this._userAnswer || null;
});

ExerciseSchema.virtual('isCorrect').get(function() {
  return this._isCorrect || false;
});

ExerciseSchema.virtual('userScore').get(function() {
  return this._userScore || 0;
});

// Ensure virtual fields are serialized
ExerciseSchema.set('toJSON', { virtuals: true });
ExerciseSchema.set('toObject', { virtuals: true });