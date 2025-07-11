// ===============================================
// COURSE MODEL - SKILL-BASED ARCHITECTURE
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const CourseSchema = new Schema(
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
      maxlength: 500
    },
    
    // Skill-based Classification (NEW)
    category: {
      type: String,
      required: true,
      enum: [
        'basic_communication',  // "Bắt đầu với tiếng Anh"
        'daily_life',          // "Giao tiếp hàng ngày"
        'food_dining',         // "Ăn uống & Mua sắm"
        'work_career',         // "Công việc & Sự nghiệp"
        'travel_transport',    // "Du lịch & Giao thông"
        'family_friends',      // "Gia đình & Bạn bè"
        'health_fitness',      // "Sức khỏe & Thể dục"
        'business'             // "Tiếng Anh Thương mại"
      ],
      index: true
    },
    
    skill_focus: [{
      type: String,
      enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing'],
      required: true
    }],
    
    // Visual & Media
    thumbnail: {
      type: String,
      default: null // URL to course thumbnail
    },
    color: {
      type: String,
      default: '#4A90E2' // Hex color for course theme
    },
    
    // Course Structure
    total_units: {
      type: Number,
      default: 0
    },
    estimated_duration: {
      type: Number, // Total estimated hours
      required: true,
      min: 1
    },
    
    // Prerequisites & Challenge Test (NEW)
    prerequisites: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    
    challenge_test: {
      total_questions: {
        type: Number,
        default: 25
      },
      pass_percentage: {
        type: Number,
        default: 80
      },
      must_correct_questions: [{
        type: Number // câu liệt phải đúng
      }],
      time_limit: {
        type: Number,
        default: 30 // minutes
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
    published_at: {
      type: Date,
      default: null
    },
    
    // Ordering & Admin
    sort_order: {
      type: Number,
      default: 0
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'courses'
  }
);

// Indexes for performance
CourseSchema.index({ category: 1, is_published: 1 });
CourseSchema.index({ skill_focus: 1 });
CourseSchema.index({ sort_order: 1 });

// Virtual for course slug
CourseSchema.virtual('slug').get(function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
});

// Ensure virtual fields are serialized
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });