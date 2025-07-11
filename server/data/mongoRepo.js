// ===============================================
// MONGO REPOSITORY - FIXED FOR NEW MODELS
// ===============================================

import mongoose from "mongoose";
import { 
  User, 
  Course, 
  Unit, 
  Lesson, 
  ExerciseTemplate,
  Vocabulary,
  UserVocabularyProgress,
  PersonalExerciseBank
} from "./models/index.js";

// ===============================================
// REPOSITORY FACTORY
// ===============================================

const createRepository = (Model) => ({
  // Find operations
  async findById(id) {
    try {
      return await Model.findById(id);
    } catch (error) {
      console.error(`Error finding ${Model.modelName} by ID:`, error.message);
      throw error;
    }
  },

  async findOne(query) {
    try {
      return await Model.findOne(query);
    } catch (error) {
      console.error(`Error finding one ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  async find(query = {}, options = {}) {
    try {
      let mongoQuery = Model.find(query);
      
      if (options.populate) {
        mongoQuery = mongoQuery.populate(options.populate);
      }
      if (options.sort) {
        mongoQuery = mongoQuery.sort(options.sort);
      }
      if (options.limit) {
        mongoQuery = mongoQuery.limit(options.limit);
      }
      if (options.skip) {
        mongoQuery = mongoQuery.skip(options.skip);
      }
      
      return await mongoQuery;
    } catch (error) {
      console.error(`Error finding ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  // Create operations
  async create(data, createdBy = null) {
    try {
      console.log(`📝 Creating new ${Model.modelName}`);
      
      if (createdBy && Model.schema.paths.createdBy) {
        data.createdBy = createdBy;
      }
      
      const document = new Model(data);
      const savedDocument = await document.save();
      
      console.log(`✅ ${Model.modelName} created successfully:`, savedDocument._id);
      return savedDocument;
    } catch (error) {
      console.error(`❌ Error creating ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  // Update operations
  async update(id, updateData) {
    try {
      console.log(`📝 Updating ${Model.modelName}:`, id);
      
      const updatedDocument = await Model.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (updatedDocument) {
        console.log(`✅ ${Model.modelName} updated successfully:`, updatedDocument._id);
      }
      return updatedDocument;
    } catch (error) {
      console.error(`❌ Error updating ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  // Delete operations
  async delete(id) {
    try {
      console.log(`🗑️ Deleting ${Model.modelName}:`, id);
      
      const result = await Model.findByIdAndDelete(id);
      console.log(`✅ ${Model.modelName} deleted successfully:`, id);
      
      return !!result;
    } catch (error) {
      console.error(`❌ Error deleting ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  // Count operations
  async count(query = {}) {
    try {
      return await Model.countDocuments(query);
    } catch (error) {
      console.error(`Error counting ${Model.modelName}:`, error.message);
      throw error;
    }
  },

  // Advanced operations
  async aggregate(pipeline) {
    try {
      return await Model.aggregate(pipeline);
    } catch (error) {
      console.error(`Error aggregating ${Model.modelName}:`, error.message);
      throw error;
    }
  }
});

// ===============================================
// SPECIALIZED REPOSITORIES
// ===============================================

// User Repository with additional methods
const userRepository = {
  ...createRepository(User),
  
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  },
  
  async findByUsername(username) {
    return await User.findOne({ username: username.toLowerCase() });
  },
  
  async updateProgress(userId, progressData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { learning_progress: progressData } },
      { new: true }
    );
  }
};

// Course Repository with additional methods
const courseRepository = {
  ...createRepository(Course),
  
  async findByCategory(category) {
    return await Course.find({ 
      category, 
      is_published: true 
    }).sort({ sort_order: 1 });
  },
  
  async findBySkillFocus(skillFocus) {
    return await Course.find({ 
      skill_focus: skillFocus,
      is_published: true 
    }).sort({ sort_order: 1 });
  }
};

// Unit Repository with additional methods
const unitRepository = {
  ...createRepository(Unit),
  
  async findByCourse(courseId) {
    return await Unit.find({ 
      course_id: courseId,
      is_published: true 
    }).sort({ sort_order: 1 });
  },
  
  async findByTheme(theme) {
    return await Unit.find({ 
      theme,
      is_published: true 
    }).sort({ sort_order: 1 });
  }
};

// Lesson Repository with additional methods
const lessonRepository = {
  ...createRepository(Lesson),
  
  async findByUnit(unitId) {
    return await Lesson.find({ 
      unit_id: unitId,
      is_published: true 
    })
    .populate('vocabulary_pool.vocabulary_id')
    .sort({ sort_order: 1 });
  },
  
  async findByCourse(courseId) {
    return await Lesson.find({ 
      course_id: courseId,
      is_published: true 
    })
    .populate('vocabulary_pool.vocabulary_id')
    .sort({ sort_order: 1 });
  }
};

// Exercise Template Repository
const exerciseTemplateRepository = {
  ...createRepository(ExerciseTemplate),
  
  async findByType(exerciseType) {
    return await ExerciseTemplate.findOne({ 
      exercise_type: exerciseType,
      is_active: true 
    });
  },
  
  async findActiveTemplates() {
    return await ExerciseTemplate.find({ 
      is_active: true 
    }).sort({ exercise_type: 1 });
  }
};

// Vocabulary Repository with additional methods
const vocabularyRepository = {
  ...createRepository(Vocabulary),
  
  async search(query, options = {}) {
    return await Vocabulary.searchWords(query, options);
  },
  
  async findByTheme(theme, difficulty = null) {
    return await Vocabulary.getByTheme(theme, difficulty);
  },
  
  async findByDifficulty(difficulty) {
    return await Vocabulary.find({ 
      difficulty,
      is_active: true 
    }).sort({ frequency_score: -1 });
  }
};

// User Vocabulary Progress Repository
const userVocabularyProgressRepository = {
  ...createRepository(UserVocabularyProgress),
  
  async findByUser(userId, options = {}) {
    let query = { user_id: userId, is_active: true };
    
    if (options.masteryLevel) {
      query.mastery_level = options.masteryLevel;
    }
    
    if (options.dueForReview) {
      query['spaced_repetition.next_review_date'] = { $lte: new Date() };
    }
    
    return await UserVocabularyProgress.find(query)
      .populate('vocabulary_id')
      .sort({ 'spaced_repetition.next_review_date': 1 })
      .limit(options.limit || 20);
  },
  
  async getUserStats(userId) {
    return await UserVocabularyProgress.getUserStats(userId);
  },
  
  async getWordsForReview(userId, limit = 20) {
    return await UserVocabularyProgress.getWordsForReview(userId, limit);
  }
};

// Personal Exercise Bank Repository
const personalExerciseBankRepository = {
  ...createRepository(PersonalExerciseBank),
  
  async findByUser(userId, options = {}) {
    return await PersonalExerciseBank.getExercisesForReview(userId, options);
  },
  
  async getUserStats(userId) {
    return await PersonalExerciseBank.getUserExerciseStats(userId);
  },
  
  async getByVocabulary(userId, vocabularyId) {
    return await PersonalExerciseBank.find({
      user_id: userId,
      vocabulary_focus: vocabularyId,
      is_active: true
    }).sort({ completed_at: -1 });
  }
};

// ===============================================
// EXPORT REPOSITORIES
// ===============================================

export default {
  users: userRepository,
  courses: courseRepository,
  units: unitRepository,
  lessons: lessonRepository,
  exerciseTemplates: exerciseTemplateRepository,
  vocabulary: vocabularyRepository,
  userVocabularyProgress: userVocabularyProgressRepository,
  personalExerciseBank: personalExerciseBankRepository
};

// Individual exports for convenience
export {
  userRepository,
  courseRepository,
  unitRepository,
  lessonRepository,
  exerciseTemplateRepository,
  vocabularyRepository,
  userVocabularyProgressRepository,
  personalExerciseBankRepository
};