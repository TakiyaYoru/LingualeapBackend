// ===============================================
// UNIT MODEL - THEME-BASED ARCHITECTURE
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
    
    // Theme Classification (NEW)
    theme: {
      type: String,
      required: true,
      enum: [
        'greetings_intro',      // Chào hỏi & Giới thiệu
        'numbers_time',         // Số đếm & Thời gian
        'family_relationships', // Gia đình & Các mối quan hệ
        'food_drinks',          // Thức ăn & Đồ uống
        'shopping_money',       // Mua sắm & Tiền bạc
        'transport_directions', // Giao thông & Chỉ đường
        'weather_seasons',      // Thời tiết & Mùa
        'hobbies_interests',    // Sở thích & Quan tâm
        'work_occupations',     // Công việc & Nghề nghiệp
        'health_body',          // Sức khỏe & Cơ thể
        'home_furniture',       // Nhà cửa & Nội thất
        'clothes_fashion',      // Quần áo & Thời trang
        'technology_media',     // Công nghệ & Truyền thông
        'education_learning',   // Giáo dục & Học tập
        'emotions_feelings'     // Cảm xúc & Cảm giác
      ],
      index: true
    },
    
    // Visual & Media
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
    total_lessons: {
      type: Number,
      default: 0
    },
    estimated_duration: {
      type: Number, // Estimated minutes to complete
      required: true,
      min: 15
    },
    
    // Prerequisites & Challenge Test (NEW)
    prerequisites: {
      previous_unit_id: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        default: null
      },
      minimum_score: {
        type: Number,
        default: 80 // 80% unit trước
      },
      required_hearts: {
        type: Number,
        default: 5 // hearts cần để unlock
      }
    },
    
    challenge_test: {
      total_questions: {
        type: Number,
        default: 15
      },
      pass_percentage: {
        type: Number,
        default: 80
      },
      must_correct_questions: [{
        type: Number // câu liệt [2, 7, 12]
      }],
      time_limit: {
        type: Number,
        default: 20 // minutes
      }
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
    collection: 'units'
  }
);

// Indexes for performance
UnitSchema.index({ course_id: 1, sort_order: 1 });
UnitSchema.index({ theme: 1 });
UnitSchema.index({ is_published: 1 });

// Virtual for progress percentage (will be calculated based on user progress)
UnitSchema.virtual('progress_percentage').get(function() {
  return this._progress_percentage || 0;
});

// Virtual for unlock status
UnitSchema.virtual('is_unlocked').get(function() {
  return this._is_unlocked !== undefined ? this._is_unlocked : false;
});

// Ensure virtual fields are serialized
UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });