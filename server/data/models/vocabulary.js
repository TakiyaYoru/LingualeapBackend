// ===============================================
// VOCABULARY MODEL - CENTRALIZED VOCABULARY SYSTEM
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const VocabularySchema = new Schema(
  {
    // Basic Word Information
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    
    meaning: {
      type: String,
      required: true,
      trim: true // "quả táo", "xin chào"
    },
    
    // Pronunciation & Audio
    pronunciation: {
      type: String,
      trim: true // "/həˈloʊ/", "/ˈæpəl/"
    },
    
    audio_url: {
      type: String,
      default: null // URL to pronunciation audio
    },
    
    // Visual
    image_url: {
      type: String,
      default: null // URL to word illustration
    },
    
    // Classification
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true
    },
    
    frequency_score: {
      type: Number,
      min: 1,
      max: 100,
      default: 50 // How common this word is (1 = rare, 100 = very common)
    },
    
    tags: [{
      type: String,
      trim: true,
      lowercase: true // ["greeting", "food", "common", "daily", "polite"]
    }],
    
    // Multiple Definitions & Contexts
    definitions: [{
      context: {
        type: String,
        required: true // "greeting", "food", "emotion"
      },
      meaning: {
        type: String,
        required: true // "lời chào hỏi", "quả táo đỏ"
      },
      example: {
        sentence: {
          type: String // "Hello, how are you?"
        },
        translation: {
          type: String // "Xin chào, bạn khỏe không?"
        }
      }
    }],
    
    // Word Relationships
    synonyms: [{
      word: String,
      meaning: String // "hi" - "chào"
    }],
    
    antonyms: [{
      word: String,
      meaning: String // "goodbye" - "tạm biệt"
    }],
    
    word_family: [{
      word: String,
      relation: {
        type: String,
        enum: ['noun', 'verb', 'adjective', 'adverb', 'past_tense', 'plural']
      },
      meaning: String
    }],
    
    // Learning Metadata
    part_of_speech: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun'],
      required: true
    },
    
    theme_categories: [{
      type: String,
      enum: [
        'greetings_intro',
        'numbers_time', 
        'family_relationships',
        'food_drinks',
        'shopping_money',
        'transport_directions',
        'weather_seasons',
        'hobbies_interests',
        'work_occupations',
        'health_body',
        'home_furniture',
        'clothes_fashion',
        'technology_media',
        'education_learning',
        'emotions_feelings'
      ]
    }],
    
    // Usage Statistics
    usage_stats: {
      total_lessons_appeared: {
        type: Number,
        default: 0
      },
      total_exercises_used: {
        type: Number,
        default: 0
      },
      avg_user_success_rate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    
    // Administrative
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'vocabulary'
  }
);

// Indexes for performance
VocabularySchema.index({ word: 1, difficulty: 1 });
VocabularySchema.index({ tags: 1 });
VocabularySchema.index({ theme_categories: 1 });
VocabularySchema.index({ frequency_score: -1 });
VocabularySchema.index({ part_of_speech: 1 });
VocabularySchema.index({ is_active: 1 });

// Text index for search functionality
VocabularySchema.index({ 
  word: 'text', 
  meaning: 'text', 
  'definitions.meaning': 'text' 
});

// Virtual for primary definition
VocabularySchema.virtual('primary_definition').get(function() {
  return this.definitions.length > 0 ? this.definitions[0] : null;
});

// Method to get definition by context
VocabularySchema.methods.getDefinitionByContext = function(context) {
  return this.definitions.find(def => def.context === context) || this.definitions[0];
};

// Method to check if word belongs to theme
VocabularySchema.methods.belongsToTheme = function(theme) {
  return this.theme_categories.includes(theme);
};

// Static method to search vocabulary
VocabularySchema.statics.searchWords = function(query, options = {}) {
  const {
    difficulty,
    theme,
    tags,
    limit = 20,
    skip = 0
  } = options;
  
  let searchQuery = {
    is_active: true,
    $text: { $search: query }
  };
  
  if (difficulty) {
    searchQuery.difficulty = difficulty;
  }
  
  if (theme) {
    searchQuery.theme_categories = theme;
  }
  
  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, frequency_score: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get vocabulary by theme
VocabularySchema.statics.getByTheme = function(theme, difficulty = null) {
  let query = {
    theme_categories: theme,
    is_active: true
  };
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return this.find(query).sort({ frequency_score: -1 });
};

// Ensure virtual fields are serialized
VocabularySchema.set('toJSON', { virtuals: true });
VocabularySchema.set('toObject', { virtuals: true });