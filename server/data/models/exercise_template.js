// ===============================================
// EXERCISE TEMPLATE MODEL - AI PROMPT TEMPLATES
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const ExerciseTemplateSchema = new Schema(
  {
    // Basic Information
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
      unique: true,
      index: true
    },
    
    type_display_name: {
      type: String,
      required: true // "Chọn đáp án đúng", "Điền từ vào chỗ trống"
    },
    
    description: {
      type: String,
      required: true,
      maxlength: 300
    },
    
    // AI PROMPT TEMPLATE - KEY SECTION
    prompt_template: {
      system_context: {
        type: String,
        required: true
        /* 
        "Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
        Bạn tạo bài tập {exercise_type} phù hợp văn hóa Việt Nam."
        */
      },
      
      main_prompt: {
        type: String,
        required: true
        /*
        "Tạo câu hỏi multiple choice cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
        
        Yêu cầu:
        - Câu hỏi thực tế, dễ hiểu
        - 4 đáp án: 1 đúng, 3 sai hợp lý  
        - Đáp án sai cùng chủ đề nhưng rõ ràng sai
        - Tránh ngữ pháp phức tạp
        - Phù hợp tình huống {situation}
        
        Trả về JSON format: {json_structure}"
        */
      },
      
      variables: [{
        type: String,
        required: true // ["word", "meaning", "lesson_context", "user_level", "situation"]
      }],
      
      expected_output_format: {
        type: Schema.Types.Mixed,
        required: true
        /*
        {
          "question": "string",
          "options": ["string1", "string2", "string3", "string4"],
          "correct_index": "number",
          "explanation": "string"
        }
        */
      },
      
      fallback_template: {
        type: Schema.Types.Mixed,
        required: true // Template tĩnh khi AI fail
      }
    },
    
    // Generation Rules
    generation_rules: {
      max_attempts: {
        type: Number,
        default: 3 // 3 lần retry nếu AI fail
      },
      validation_rules: [{
        type: String,
        enum: [
          'check_json_format',
          'check_appropriate_content',
          'check_difficulty_level',
          'check_cultural_sensitivity',
          'check_grammar_correctness'
        ]
      }],
      difficulty_adaptation: {
        type: Boolean,
        default: true // true = adjust theo user level
      },
      content_filters: [{
        type: String,
        enum: [
          'no_violence',
          'family_friendly',
          'no_politics',
          'no_religion',
          'cultural_appropriate'
        ]
      }]
    },
    
    // Exercise Metadata
    skill_focus: [{
      type: String,
      enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing', 'pronunciation', 'translation'],
      required: true
    }],
    
    estimated_time: {
      type: Number, // seconds per exercise
      required: true,
      min: 10,
      max: 120
    },
    
    requires_audio: {
      type: Boolean,
      default: false // true cho listening, speak_repeat
    },
    
    requires_microphone: {
      type: Boolean,
      default: false // true cho speak_repeat
    },
    
    requires_images: {
      type: Boolean,
      default: false // true cho listen_choose với images
    },
    
    // Exercise Configuration
    difficulty_levels: [{
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }],
    
    // Status
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'exercise_templates'
  }
);

// Indexes for performance
ExerciseTemplateSchema.index({ exercise_type: 1 });
ExerciseTemplateSchema.index({ is_active: 1 });
ExerciseTemplateSchema.index({ skill_focus: 1 });

// Method to get prompt with variables replaced
ExerciseTemplateSchema.methods.getPromptWithVariables = function(variables) {
  let prompt = this.prompt_template.main_prompt;
  
  // Replace variables in prompt
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    prompt = prompt.replace(regex, value);
  }
  
  return {
    system_context: this.prompt_template.system_context.replace(/{(\w+)}/g, (match, key) => variables[key] || match),
    main_prompt: prompt,
    expected_format: this.prompt_template.expected_output_format
  };
};

// Method to validate AI response
ExerciseTemplateSchema.methods.validateResponse = function(response) {
  const rules = this.generation_rules.validation_rules;
  const errors = [];
  
  // Basic JSON format check
  if (rules.includes('check_json_format')) {
    try {
      if (typeof response !== 'object') {
        JSON.parse(response);
      }
    } catch (error) {
      errors.push('Invalid JSON format');
    }
  }
  
  // Add more validation rules as needed
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Ensure virtual fields are serialized
ExerciseTemplateSchema.set('toJSON', { virtuals: true });
ExerciseTemplateSchema.set('toObject', { virtuals: true });