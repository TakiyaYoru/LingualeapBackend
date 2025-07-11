// ===============================================
// USER MODEL - UPDATED FOR SKILL-BASED SYSTEM
// ===============================================

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

export const UserSchema = new Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    
    // Profile
    avatar: {
      type: String,
      default: null // URL to avatar image
    },
    bio: {
      type: String,
      maxlength: 200,
      default: ""
    },
    
    // Language Learning Profile (NEW)
    language_profile: {
      native_language: {
        type: String,
        default: 'vi' // Vietnamese
      },
      target_language: {
        type: String,
        default: 'en' // English
      },
      current_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
      },
      learning_goals: [{
        type: String,
        enum: [
          'daily_communication',
          'business_english',
          'travel_english',
          'academic_english',
          'exam_preparation',
          'conversation_skills'
        ]
      }],
      preferred_skills: [{
        type: String,
        enum: ['vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing']
      }]
    },
    
    // Gamification System
    gamification: {
      total_xp: {
        type: Number,
        default: 0,
        min: 0
      },
      current_level: {
        type: Number,
        default: 1,
        min: 1
      },
      hearts: {
        current: {
          type: Number,
          default: 5,
          min: 0,
          max: 5
        },
        last_refill: {
          type: Date,
          default: Date.now
        }
      },
      streak: {
        current: {
          type: Number,
          default: 0,
          min: 0
        },
        longest: {
          type: Number,
          default: 0,
          min: 0
        },
        last_activity: {
          type: Date,
          default: Date.now
        }
      },
      achievements: [{
        achievement_id: String,
        earned_at: {
          type: Date,
          default: Date.now
        },
        progress: {
          type: Number,
          default: 0
        }
      }]
    },
    
    // Learning Progress (NEW - SKILL-BASED)
    learning_progress: {
      // Courses progress
      courses: [{
        course_id: {
          type: Schema.Types.ObjectId,
          ref: 'Course'
        },
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'completed'],
          default: 'not_started'
        },
        progress_percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        started_at: Date,
        completed_at: Date,
        current_unit_id: {
          type: Schema.Types.ObjectId,
          ref: 'Unit'
        },
        current_lesson_id: {
          type: Schema.Types.ObjectId,
          ref: 'Lesson'
        }
      }],
      
      // Vocabulary progress summary
      vocabulary_stats: {
        total_words_learned: {
          type: Number,
          default: 0
        },
        words_by_mastery: {
          new: { type: Number, default: 0 },
          learning: { type: Number, default: 0 },
          learned: { type: Number, default: 0 },
          mastered: { type: Number, default: 0 }
        },
        words_due_for_review: {
          type: Number,
          default: 0
        }
      },
      
      // Exercise performance stats
      exercise_stats: {
        total_exercises_completed: {
          type: Number,
          default: 0
        },
        overall_success_rate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        by_exercise_type: {
          multiple_choice: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          fill_blank: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          listening: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          translation: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          word_matching: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          sentence_building: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          true_false: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          listen_choose: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          },
          speak_repeat: {
            completed: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0 }
          }
        }
      }
    },
    
    // Subscription & Access (EXISTING)
    subscription: {
      type: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
      },
      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: false
      }
    },
    
    // Settings
    preferences: {
      notification_settings: {
        daily_reminder: {
          type: Boolean,
          default: true
        },
        reminder_time: {
          type: String,
          default: "19:00" // 7 PM
        },
        streak_reminder: {
          type: Boolean,
          default: true
        },
        review_reminder: {
          type: Boolean,
          default: true
        }
      },
      
      learning_settings: {
        daily_goal_minutes: {
          type: Number,
          default: 15,
          min: 5,
          max: 120
        },
        auto_play_audio: {
          type: Boolean,
          default: true
        },
        speaking_exercises_enabled: {
          type: Boolean,
          default: true
        },
        difficulty_auto_adjust: {
          type: Boolean,
          default: true
        }
      },
      
      privacy_settings: {
        public_profile: {
          type: Boolean,
          default: false
        },
        show_progress: {
          type: Boolean,
          default: true
        },
        allow_friend_requests: {
          type: Boolean,
          default: true
        }
      }
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'gamification.total_xp': -1 });
UserSchema.index({ 'gamification.streak.current': -1 });
UserSchema.index({ 'learning_progress.courses.course_id': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update hearts
UserSchema.methods.updateHearts = function(change) {
  this.gamification.hearts.current = Math.max(0, Math.min(5, this.gamification.hearts.current + change));
  return this;
};

// Method to refill hearts (every 4 hours)
UserSchema.methods.refillHearts = function() {
  const now = new Date();
  const lastRefill = this.gamification.hearts.last_refill;
  const hoursElapsed = (now - lastRefill) / (1000 * 60 * 60);
  
  if (hoursElapsed >= 4) {
    const heartsToAdd = Math.floor(hoursElapsed / 4);
    this.gamification.hearts.current = Math.min(5, this.gamification.hearts.current + heartsToAdd);
    this.gamification.hearts.last_refill = now;
  }
  
  return this;
};

// Method to update streak
UserSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.gamification.streak.last_activity;
  const daysDifference = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) {
    // Same day - no change
    return this;
  } else if (daysDifference === 1) {
    // Next day - continue streak
    this.gamification.streak.current++;
    if (this.gamification.streak.current > this.gamification.streak.longest) {
      this.gamification.streak.longest = this.gamification.streak.current;
    }
  } else {
    // Missed day(s) - reset streak
    this.gamification.streak.current = 1;
  }
  
  this.gamification.streak.last_activity = now;
  return this;
};

// Method to add XP
UserSchema.methods.addXP = function(amount) {
  this.gamification.total_xp += amount;
  
  // Calculate level (100 XP per level)
  const newLevel = Math.floor(this.gamification.total_xp / 100) + 1;
  if (newLevel > this.gamification.current_level) {
    this.gamification.current_level = newLevel;
    // Could trigger level up event here
  }
  
  return this;
};

// Method to get course progress
UserSchema.methods.getCourseProgress = function(courseId) {
  return this.learning_progress.courses.find(course => 
    course.course_id.toString() === courseId.toString()
  );
};

// Method to update course progress
UserSchema.methods.updateCourseProgress = function(courseId, updates) {
  let courseProgress = this.getCourseProgress(courseId);
  
  if (!courseProgress) {
    courseProgress = {
      course_id: courseId,
      status: 'not_started',
      progress_percentage: 0,
      started_at: new Date()
    };
    this.learning_progress.courses.push(courseProgress);
  }
  
  Object.assign(courseProgress, updates);
  return this;
};

// Virtual for current level progress
UserSchema.virtual('currentLevelProgress').get(function() {
  const currentLevelXP = this.gamification.total_xp % 100;
  return {
    current: currentLevelXP,
    required: 100,
    percentage: currentLevelXP
  };
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });