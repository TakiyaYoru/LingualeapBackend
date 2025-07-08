// ===============================================
// USER MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const UserSchema = new Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    
    // Profile Information
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      default: null // URL to profile picture
    },
    
    // Learning Progress
    currentLevel: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'A1'
    },
    totalXP: {
      type: Number,
      default: 0
    },
    hearts: {
      type: Number,
      default: 5,
      max: 5
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: {
      type: Date,
      default: null
    },
    
    // Subscription
    subscriptionType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    subscriptionExpiry: {
      type: Date,
      default: null
    },
    
    // Settings
    dailyGoal: {
      type: Number,
      default: 20, // XP per day
      min: 10,
      max: 100
    },
    language: {
      type: String,
      default: 'vi' // Vietnamese interface
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    
    // Authentication
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpiry: {
      type: Date,
      default: null
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'users'
  }
);

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ subscriptionType: 1 });
UserSchema.index({ currentLevel: 1 });

// Virtual field for premium status
UserSchema.virtual('isPremium').get(function() {
  return this.subscriptionType === 'premium' && 
         this.subscriptionExpiry && 
         this.subscriptionExpiry > new Date();
});

// Virtual field for hearts refill time (if hearts < 5)
UserSchema.virtual('heartsRefillTime').get(function() {
  if (this.hearts >= 5) return null;
  
  // Hearts refill every 30 minutes
  const lastHeartLoss = this.updatedAt;
  const refillTime = new Date(lastHeartLoss.getTime() + 30 * 60 * 1000);
  return refillTime;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });