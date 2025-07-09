// ===============================================
// MODELS INDEX - LINGUALEAP
// ===============================================

import mongoose from "mongoose";
import { UserSchema } from "./user.js";
import { CourseSchema } from "./course.js";
import { UnitSchema } from "./unit.js";
import { LessonSchema } from "./lesson.js";
import { ExerciseSchema } from "./exercise.js";
export { Vocabulary } from './vocabulary.js'; 
// Export models
export const User = mongoose.model("User", UserSchema);
export const Course = mongoose.model("Course", CourseSchema);
export const Unit = mongoose.model("Unit", UnitSchema);
export const Lesson = mongoose.model("Lesson", LessonSchema);
export const Exercise = mongoose.model("Exercise", ExerciseSchema);

// TODO: Add more models later
// export const Vocabulary = mongoose.model("Vocabulary", VocabularySchema);
// export const UserProgress = mongoose.model("UserProgress", UserProgressSchema);
// export const Assessment = mongoose.model("Assessment", AssessmentSchema);
// export const Achievement = mongoose.model("Achievement", AchievementSchema);
// export const StudyGroup = mongoose.model("StudyGroup", StudyGroupSchema);

// TODO: Add more models later
// export const Vocabulary = mongoose.model("Vocabulary", VocabularySchema);
// export const UserProgress = mongoose.model("UserProgress", UserProgressSchema);
// export const Assessment = mongoose.model("Assessment", AssessmentSchema);
// export const Achievement = mongoose.model("Achievement", AchievementSchema);
// export const StudyGroup = mongoose.model("StudyGroup", StudyGroupSchema);