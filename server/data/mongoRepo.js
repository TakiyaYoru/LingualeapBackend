// ===============================================
// MONGODB REPOSITORY - LINGUALEAP
// ===============================================

import { User, Course, Unit, Lesson, Exercise } from "./models/index.js";
import bcrypt from "bcrypt";
import mongoose from 'mongoose'; // ← ADD THIS LINE
// ===============================================
// USER REPOSITORY
// ===============================================

const userRepository = {
  // Create new user
  async create(userData) {
    try {
      console.log('📝 Creating new user:', userData.email);
      
      // Hash password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      console.log('✅ User created successfully:', savedUser._id);
      
      // Return user without password
      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      console.error('❌ Error finding user by email:', error.message);
      throw error;
    }
  },

  // Find user by username
  async findByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      console.error('❌ Error finding user by username:', error.message);
      throw error;
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      const user = await User.findById(id);
      if (user) {
        // Return user without password
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('❌ Error finding user by ID:', error.message);
      throw error;
    }
  },

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('❌ Error verifying password:', error.message);
      throw error;
    }
  },

  // Update user
  async update(id, updateData) {
    try {
      console.log('📝 Updating user:', id);
      
      // If password is being updated, hash it
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
      const user = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (user) {
        console.log('✅ User updated successfully:', user._id);
        // Return user without password
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('❌ Error updating user:', error.message);
      throw error;
    }
  },

  // Update user XP and streak
  async updateProgress(id, xpGained) {
    try {
      const user = await User.findById(id);
      if (!user) return null;

      const today = new Date();
      const lastStudy = user.lastStudyDate;
      
      // Check if user studied today
      const isStudiedToday = lastStudy && 
        lastStudy.toDateString() === today.toDateString();
      
      let streakUpdate = user.currentStreak;
      
      if (!isStudiedToday) {
        // Check if yesterday (streak continues) or break
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isYesterday = lastStudy && 
          lastStudy.toDateString() === yesterday.toDateString();
        
        if (isYesterday) {
          streakUpdate += 1; // Continue streak
        } else {
          streakUpdate = 1; // New streak
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $inc: { totalXP: xpGained },
          currentStreak: streakUpdate,
          longestStreak: Math.max(user.longestStreak, streakUpdate),
          lastStudyDate: today
        },
        { new: true }
      );

      console.log(`✅ User progress updated: +${xpGained} XP, streak: ${streakUpdate}`);
      
      const { password, ...userWithoutPassword } = updatedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Error updating user progress:', error.message);
      throw error;
    }
  },

  // Use a heart (for wrong answers)
  async useHeart(id) {
    try {
      const user = await User.findById(id);
      if (!user) return null;

      if (user.hearts > 0) {
        user.hearts -= 1;
        await user.save();
        console.log(`💔 User ${id} used a heart. Remaining: ${user.hearts}`);
      }

      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Error using heart:', error.message);
      throw error;
    }
  },

  // Get all users (admin only)
  async getAll() {
    try {
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      return users;
    } catch (error) {
      console.error('❌ Error getting all users:', error.message);
      throw error;
    }
  }
};

// ===============================================
// COURSE REPOSITORY
// ===============================================

const courseRepository = {
  // Get all published courses
  async getAll(filters = {}) {
    try {
      console.log('📚 Getting all courses with filters:', filters);
      
      const query = { isPublished: true };
      
      // Apply filters
      if (filters.level) query.level = filters.level;
      if (filters.category) query.category = filters.category;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.isPremium !== undefined) query.isPremium = filters.isPremium;
      
      const courses = await Course.find(query)
        .populate('createdBy', 'displayName')
        .sort({ sortOrder: 1, createdAt: -1 });
      
      return courses;
    } catch (error) {
      console.error('❌ Error getting courses:', error.message);
      throw error;
    }
  },

  // Get course by ID
  async findById(id) {
    try {
      const course = await Course.findById(id)
        .populate('createdBy', 'displayName');
      return course;
    } catch (error) {
      console.error('❌ Error finding course:', error.message);
      throw error;
    }
  },

  // Create new course (admin only)
  async create(courseData, createdBy) {
    try {
      console.log('📝 Creating new course:', courseData.title);
      
      const course = new Course({
        ...courseData,
        createdBy
      });
      
      const savedCourse = await course.save();
      console.log('✅ Course created successfully:', savedCourse._id);
      
      return await Course.findById(savedCourse._id).populate('createdBy', 'displayName');
    } catch (error) {
      console.error('❌ Error creating course:', error.message);
      throw error;
    }
  },

  // Update course
  async update(id, updateData) {
    try {
      console.log('📝 Updating course:', id);
      
      const course = await Course.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('createdBy', 'displayName');
      
      if (course) {
        console.log('✅ Course updated successfully:', course._id);
      }
      return course;
    } catch (error) {
      console.error('❌ Error updating course:', error.message);
      throw error;
    }
  },

  // Delete course
  async delete(id) {
    try {
      console.log('🗑️ Deleting course:', id);
      
      // Delete related content first
      await Unit.deleteMany({ courseId: id });
      await Lesson.deleteMany({ courseId: id });
      await Exercise.deleteMany({ courseId: id });
      
      const result = await Course.findByIdAndDelete(id);
      console.log('✅ Course deleted successfully:', id);
      
      return !!result;
    } catch (error) {
      console.error('❌ Error deleting course:', error.message);
      throw error;
    }
  }
};

// ===============================================
// UNIT REPOSITORY
// ===============================================

const unitRepository = {
  // Get units by course ID
  async getByCourseId(courseId, filters = {}) {
    try {
      console.log('📖 Getting units for course:', courseId);
      
      const query = { courseId, isPublished: true };
      if (filters.isPremium !== undefined) query.isPremium = filters.isPremium;
      
      const units = await Unit.find(query)
        .populate('courseId', 'title level')
        .sort({ sortOrder: 1 });
      
      return units;
    } catch (error) {
      console.error('❌ Error getting units:', error.message);
      throw error;
    }
  },

  // Get unit by ID
  async findById(id) {
    try {
      const unit = await Unit.findById(id)
        .populate('courseId', 'title level')
        .populate('unlockRequirements.previousUnitId', 'title');
      return unit;
    } catch (error) {
      console.error('❌ Error finding unit:', error.message);
      throw error;
    }
  },

  // Create new unit
  async create(unitData, createdBy) {
    try {
      console.log('📝 Creating new unit:', unitData.title);
      
      const unit = new Unit({
        ...unitData,
        createdBy
      });
      
      const savedUnit = await unit.save();
      
      // Update course total units count
      await Course.findByIdAndUpdate(
        unitData.courseId,
        { $inc: { totalUnits: 1 } }
      );
      
      console.log('✅ Unit created successfully:', savedUnit._id);
      return await Unit.findById(savedUnit._id).populate('courseId', 'title level');
    } catch (error) {
      console.error('❌ Error creating unit:', error.message);
      throw error;
    }
  },

  // Update unit
  async update(id, updateData) {
    try {
      console.log('📝 Updating unit:', id);
      
      const unit = await Unit.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('courseId', 'title level');
      
      if (unit) {
        console.log('✅ Unit updated successfully:', unit._id);
      }
      return unit;
    } catch (error) {
      console.error('❌ Error updating unit:', error.message);
      throw error;
    }
  },

  // Delete unit
  async delete(id) {
    try {
      console.log('🗑️ Deleting unit:', id);
      
      const unit = await Unit.findById(id);
      if (!unit) return false;
      
      // Delete related content
      await Lesson.deleteMany({ unitId: id });
      await Exercise.deleteMany({ unitId: id });
      
      // Update course counter
      await Course.findByIdAndUpdate(
        unit.courseId,
        { $inc: { totalUnits: -1 } }
      );
      
      const result = await Unit.findByIdAndDelete(id);
      console.log('✅ Unit deleted successfully:', id);
      
      return !!result;
    } catch (error) {
      console.error('❌ Error deleting unit:', error.message);
      throw error;
    }
  }
};

// ===============================================
// LESSON REPOSITORY
// ===============================================

const lessonRepository = {
  // Get lessons by unit ID
  async getByUnitId(unitId, filters = {}) {
    try {
      console.log('📝 Getting lessons for unit:', unitId);
      
      const query = { unitId, isPublished: true };
      if (filters.type) query.type = filters.type;
      if (filters.isPremium !== undefined) query.isPremium = filters.isPremium;
      
      const lessons = await Lesson.find(query)
        .populate('unitId', 'title theme')
        .populate('courseId', 'title level')
        .sort({ sortOrder: 1 });
      
      return lessons;
    } catch (error) {
      console.error('❌ Error getting lessons:', error.message);
      throw error;
    }
  },

  // Get lesson by ID
  async findById(id) {
    try {
      const lesson = await Lesson.findById(id)
        .populate('unitId', 'title theme')
        .populate('courseId', 'title level')
        .populate('unlockRequirements.previousLessonId', 'title');
      return lesson;
    } catch (error) {
      console.error('❌ Error finding lesson:', error.message);
      throw error;
    }
  },

  // Create new lesson
  async create(lessonData, createdBy) {
    try {
      console.log('📝 Creating new lesson:', lessonData.title);
      
      const lesson = new Lesson({
        ...lessonData,
        createdBy
      });
      
      const savedLesson = await lesson.save();
      
      // Update unit and course totals
      await Unit.findByIdAndUpdate(
        lessonData.unitId,
        { $inc: { totalLessons: 1 } }
      );
      
      await Course.findByIdAndUpdate(
        lessonData.courseId,
        { $inc: { totalLessons: 1 } }
      );
      
      console.log('✅ Lesson created successfully:', savedLesson._id);
      return await Lesson.findById(savedLesson._id)
        .populate('unitId', 'title theme')
        .populate('courseId', 'title level');
    } catch (error) {
      console.error('❌ Error creating lesson:', error.message);
      throw error;
    }
  },

  // Update lesson
  async update(id, updateData) {
    try {
      console.log('📝 Updating lesson:', id);
      
      const lesson = await Lesson.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('unitId', 'title theme')
       .populate('courseId', 'title level');
      
      if (lesson) {
        console.log('✅ Lesson updated successfully:', lesson._id);
      }
      return lesson;
    } catch (error) {
      console.error('❌ Error updating lesson:', error.message);
      throw error;
    }
  },

  // Delete lesson
  async delete(id) {
    try {
      console.log('🗑️ Deleting lesson:', id);
      
      const lesson = await Lesson.findById(id);
      if (!lesson) return false;
      
      // Delete related exercises
      await Exercise.deleteMany({ lessonId: id });
      
      // Update counters
      await Unit.findByIdAndUpdate(
        lesson.unitId,
        { $inc: { totalLessons: -1 } }
      );
      
      await Course.findByIdAndUpdate(
        lesson.courseId,
        { $inc: { totalLessons: -1 } }
      );
      
      const result = await Lesson.findByIdAndDelete(id);
      console.log('✅ Lesson deleted successfully:', id);
      
      return !!result;
    } catch (error) {
      console.error('❌ Error deleting lesson:', error.message);
      throw error;
    }
  }
};

// ===============================================
// EXERCISE REPOSITORY
// ===============================================

const exerciseRepository = {
  // Get exercises by lesson ID
  async getByLessonId(lessonId, filters = {}) {
    try {
      console.log('🎮 Getting exercises for lesson:', lessonId);
      
      const query = { lessonId, isActive: true };
      if (filters.type) query.type = filters.type;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      
      const exercises = await Exercise.find(query)
        .populate('lessonId', 'title type')
        .sort({ sortOrder: 1 });
      
      return exercises;
    } catch (error) {
      console.error('❌ Error getting exercises:', error.message);
      throw error;
    }
  },

  // Get exercise by ID
  async findById(id) {
    try {
      const exercise = await Exercise.findById(id)
        .populate('lessonId', 'title type')
        .populate('unitId', 'title theme')
        .populate('courseId', 'title level');
      return exercise;
    } catch (error) {
      console.error('❌ Error finding exercise:', error.message);
      throw error;
    }
  },

  // Create new exercise
  async create(exerciseData, createdBy) {
    try {
      console.log('📝 Creating new exercise:', exerciseData.type);
      
      const exercise = new Exercise({
        ...exerciseData,
        createdBy
      });
      
      const savedExercise = await exercise.save();
      
      // Update totals
      await Lesson.findByIdAndUpdate(
        exerciseData.lessonId,
        { $inc: { totalExercises: 1 } }
      );
      
      await Unit.findByIdAndUpdate(
        exerciseData.unitId,
        { $inc: { totalExercises: 1 } }
      );
      
      await Course.findByIdAndUpdate(
        exerciseData.courseId,
        { $inc: { totalExercises: 1 } }
      );
      
      console.log('✅ Exercise created successfully:', savedExercise._id);
      return await Exercise.findById(savedExercise._id)
        .populate('lessonId', 'title type')
        .populate('unitId', 'title theme')
        .populate('courseId', 'title level');
    } catch (error) {
      console.error('❌ Error creating exercise:', error.message);
      throw error;
    }
  },

  // Update exercise
  async update(id, updateData) {
    try {
      console.log('📝 Updating exercise:', id);
      
      const exercise = await Exercise.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('lessonId', 'title type')
       .populate('unitId', 'title theme')
       .populate('courseId', 'title level');
      
      if (exercise) {
        console.log('✅ Exercise updated successfully:', exercise._id);
      }
      return exercise;
    } catch (error) {
      console.error('❌ Error updating exercise:', error.message);
      throw error;
    }
  },

  // Delete exercise
  async delete(id) {
    try {
      console.log('🗑️ Deleting exercise:', id);
      
      const exercise = await Exercise.findById(id);
      if (!exercise) return false;
      
      // Update counters
      await Lesson.findByIdAndUpdate(
        exercise.lessonId,
        { $inc: { totalExercises: -1 } }
      );
      
      await Unit.findByIdAndUpdate(
        exercise.unitId,
        { $inc: { totalExercises: -1 } }
      );
      
      await Course.findByIdAndUpdate(
        exercise.courseId,
        { $inc: { totalExercises: -1 } }
      );
      
      const result = await Exercise.findByIdAndDelete(id);
      console.log('✅ Exercise deleted successfully:', id);
      
      return !!result;
    } catch (error) {
      console.error('❌ Error deleting exercise:', error.message);
      throw error;
    }
  }
};


import { Vocabulary } from './models/index.js';

// ADD this repository BEFORE the final export
const vocabularyRepository = {
  // Find vocabulary by user with filters
  async findByUser(userId, filters = {}) {
    try {
      const query = { 
        //userId: new mongoose.Types.ObjectId(userId), 
        userId: userId, 
        isActive: true 
      };
      
      // Apply filters
      if (filters.isLearned !== undefined) {
        query.isLearned = filters.isLearned;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.search) {
        query.$or = [
          { word: { $regex: filters.search, $options: 'i' } },
          { meaning: { $regex: filters.search, $options: 'i' } },
          { example: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      // Build sort
      let sort = { createdAt: -1 }; // Default: newest first
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'alphabetical':
            sort = { word: 1 };
            break;
          case 'learned_first':
            sort = { isLearned: -1, createdAt: -1 };
            break;
          case 'difficulty':
            sort = { difficulty: -1, createdAt: -1 };
            break;
        }
      }
      
      return await Vocabulary.find(query)
        .sort(sort)
        .limit(filters.limit || 100)
        .lean();
    } catch (error) {
      console.error('❌ Error finding vocabulary by user:', error.message);
      throw error;
    }
  },

  // Find by ID
  async findById(vocabularyId, userId = null) {
    try {
      const query = { _id: vocabularyId, isActive: true };
      if (userId) {
        query.userId = new mongoose.Types.ObjectId(userId);
      }
      
      return await Vocabulary.findOne(query).lean();
    } catch (error) {
      console.error('❌ Error finding vocabulary by ID:', error.message);
      throw error;
    }
  },

  // Create vocabulary word
  async create(vocabularyData) {
    try {
      console.log('📚 Creating vocabulary word:', vocabularyData.word);
      
      const vocabulary = new Vocabulary(vocabularyData);
      const savedVocabulary = await vocabulary.save();
      
      console.log('✅ Vocabulary word created:', savedVocabulary._id);
      return savedVocabulary;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('This word already exists in your vocabulary');
      }
      console.error('❌ Error creating vocabulary:', error.message);
      throw error;
    }
  },

  // Update vocabulary word
  async update(vocabularyId, userId, updateData) {
    try {
      const vocabulary = await Vocabulary.findOneAndUpdate(
        { 
          _id: vocabularyId, 
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true
        },
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      );
      
      if (!vocabulary) {
        throw new Error('Vocabulary word not found');
      }
      
      console.log('✅ Vocabulary word updated:', vocabulary.word);
      return vocabulary;
    } catch (error) {
      console.error('❌ Error updating vocabulary:', error.message);
      throw error;
    }
  },

  // Toggle learned status
  async toggleLearned(vocabularyId, userId) {
    try {
      const vocabulary = await Vocabulary.findOne({
        _id: vocabularyId,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });
      
      if (!vocabulary) {
        throw new Error('Vocabulary word not found');
      }
      
      vocabulary.isLearned = !vocabulary.isLearned;
      if (vocabulary.isLearned) {
        vocabulary.learnedAt = new Date();
        vocabulary.reviewCount += 1;
      } else {
        vocabulary.learnedAt = null;
      }
      
      await vocabulary.save();
      
      console.log('✅ Vocabulary learned status toggled:', vocabulary.word, '→', vocabulary.isLearned);
      return vocabulary;
    } catch (error) {
      console.error('❌ Error toggling vocabulary learned status:', error.message);
      throw error;
    }
  },

  // Delete vocabulary word (soft delete)
  async delete(vocabularyId, userId) {
    try {
      const vocabulary = await Vocabulary.findOneAndUpdate(
        {
          _id: vocabularyId,
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true
        },
        { isActive: false },
        { new: true }
      );
      
      if (!vocabulary) {
        throw new Error('Vocabulary word not found');
      }
      
      console.log('✅ Vocabulary word deleted:', vocabulary.word);
      return vocabulary;
    } catch (error) {
      console.error('❌ Error deleting vocabulary:', error.message);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      const stats = await Vocabulary.getUserStats(userId);
      return stats[0] || {
        totalWords: 0,
        learnedWords: 0,
        unlearnedWords: 0,
        progressPercentage: 0,
        averageDifficulty: 0,
        totalReviews: 0,
        totalAttempts: 0,
        totalCorrect: 0,
        overallSuccessRate: 0
      };
    } catch (error) {
      console.error('❌ Error getting user vocabulary stats:', error.message);
      throw error;
    }
  },

  // Get user categories
  async getUserCategories(userId) {
    try {
      return await Vocabulary.distinct('category', {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      });
    } catch (error) {
      console.error('❌ Error getting user categories:', error.message);
      throw error;
    }
  },

  // Get words for review
  async getWordsForReview(userId, limit = 10) {
    try {
      const today = new Date();
      
      return await Vocabulary.find({
        userId: new mongoose.Types.ObjectId(userId),
        isLearned: true,
        isActive: true,
        $or: [
          { nextReviewDate: { $lte: today } },
          { nextReviewDate: null }
        ]
      })
      .sort({ nextReviewDate: 1, learnedAt: 1 })
      .limit(limit)
      .lean();
    } catch (error) {
      console.error('❌ Error getting words for review:', error.message);
      throw error;
    }
  },

  // Clear all vocabulary
  async clearAll(userId) {
    try {
      const result = await Vocabulary.updateMany(
        { 
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true 
        },
        { isActive: false }
      );
      
      console.log('✅ All vocabulary cleared for user:', userId);
      return {
        deletedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('❌ Error clearing vocabulary:', error.message);
      throw error;
    }
  }
};
// ===============================================
// EXPORT REPOSITORY
// ===============================================

export const db = {
  users: userRepository,
  courses: courseRepository,
  units: unitRepository,
  lessons: lessonRepository,
  exercises: exerciseRepository,
  vocabulary: vocabularyRepository
};