// ===============================================
// COURSE MODEL - LINGUALEAP
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
    
    // Course Classification
    level: {
      type: String,
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'general',        // General English
        'business',       // Business English
        'travel',         // Travel English
        'ielts',         // IELTS Preparation
        'conversation',   // Conversation Practice
        'grammar',       // Grammar Focus
        'vocabulary'     // Vocabulary Building
      ],
      index: true
    },
    
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
    estimatedDuration: {
      type: Number, // Total estimated hours
      required: true,
      min: 1
    },
    totalUnits: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    totalExercises: {
      type: Number,
      default: 0
    },
    
    // Access Control
    isPremium: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    
    // Learning Objectives
    learningObjectives: [{
      type: String,
      trim: true,
      maxlength: 200
    }],
    prerequisites: [{
      type: String,
      trim: true,
      maxlength: 100
    }],
    
    // Course Metadata
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true
    },
    language: {
      from: {
        type: String,
        default: 'vi' // Vietnamese
      },
      to: {
        type: String,
        default: 'en' // English
      }
    },
    
    // Gamification
    totalXP: {
      type: Number,
      default: 0 // Total XP available in this course
    },
    badgeIcon: {
      type: String,
      default: null // Icon for course completion badge
    },
    
    // Statistics (updated by triggers)
    enrollmentCount: {
      type: Number,
      default: 0
    },
    completionCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
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
    
    // Ordering
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'courses'
  }
);

// Indexes for better performance
CourseSchema.index({ level: 1, category: 1 });
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ isPremium: 1, isPublished: 1 });
CourseSchema.index({ sortOrder: 1 });

// Virtual for completion rate
CourseSchema.virtual('completionRate').get(function() {
  if (this.enrollmentCount === 0) return 0;
  return Math.round((this.completionCount / this.enrollmentCount) * 100);
});

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