// ===============================================
// MODELS INDEX - LINGUALEAP V2 (SKILL-BASED)
// ===============================================

import mongoose from "mongoose";

// Import all schemas
import { UserSchema } from "./user.js";
import { CourseSchema } from "./course.js";
import { UnitSchema } from "./unit.js";
import { LessonSchema } from "./lesson.js";
import { ExerciseTemplateSchema } from "./exercise_template.js";
import { VocabularySchema } from "./vocabulary.js";
import { UserVocabularyProgressSchema } from "./user_vocabulary_progress.js";
import { PersonalExerciseBankSchema } from "./personal_exercise_bank.js";

// Export models
export const User = mongoose.model("User", UserSchema);
export const Course = mongoose.model("Course", CourseSchema);
export const Unit = mongoose.model("Unit", UnitSchema);
export const Lesson = mongoose.model("Lesson", LessonSchema);
export const ExerciseTemplate = mongoose.model("ExerciseTemplate", ExerciseTemplateSchema);
export const Vocabulary = mongoose.model("Vocabulary", VocabularySchema);
export const UserVocabularyProgress = mongoose.model("UserVocabularyProgress", UserVocabularyProgressSchema);
export const PersonalExerciseBank = mongoose.model("PersonalExerciseBank", PersonalExerciseBankSchema);

// Model summary for logging
console.log('📚 LinguaLeap Models Loaded:');
console.log('   ✅ User - Authentication & gamification');
console.log('   ✅ Course - Skill-based courses');
console.log('   ✅ Unit - Theme-based units');
console.log('   ✅ Lesson - Vocabulary pools + AI config');
console.log('   ✅ ExerciseTemplate - AI prompt templates');
console.log('   ✅ Vocabulary - Centralized vocabulary system');
console.log('   ✅ UserVocabularyProgress - Spaced repetition tracking');
console.log('   ✅ PersonalExerciseBank - AI-generated exercise storage');

// Export model registry for repository pattern
export const ModelRegistry = {
  User,
  Course,
  Unit,
  Lesson,
  ExerciseTemplate,
  Vocabulary,
  UserVocabularyProgress,
  PersonalExerciseBank
};

export default ModelRegistry;