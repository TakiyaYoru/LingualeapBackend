// ===============================================
// MONGODB REPOSITORY - LINGUALEAP
// ===============================================

import { User, Course, Unit, Lesson, Exercise } from "./models/index.js";
import bcrypt from "bcrypt";

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
      
      return savedCourse;
    } catch (error) {
      console.error('❌ Error creating course:', error.message);
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
      return savedUnit;
    } catch (error) {
      console.error('❌ Error creating unit:', error.message);
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
      return savedLesson;
    } catch (error) {
      console.error('❌ Error creating lesson:', error.message);
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
      return savedExercise;
    } catch (error) {
      console.error('❌ Error creating exercise:', error.message);
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
  exercises: exerciseRepository
};