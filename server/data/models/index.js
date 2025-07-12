// ===============================================
// MODELS INDEX - LINGUALEAP
// ===============================================

import mongoose from "mongoose";
import { UserSchema } from "./user.js";
import { CourseSchema } from "./course.js";
import { UnitSchema } from "./unit.js";
import { LessonSchema } from "./lesson.js";
import { ExerciseSchema } from "./exercise.js";
import { Vocabulary } from "./vocabulary.js";
import { UserVocabularyProgress } from "./userVocabularyProgress.js";
import { UserExerciseProgress } from "./userExerciseProgress.js";
import { ChallengeTestSchema, ChallengeTest } from "./challengeTest.js";
import { UserChallengeAttemptSchema, UserChallengeAttempt } from "./userChallengeAttempt.js";

// Export models
export const User = mongoose.model("User", UserSchema);
export const Course = mongoose.model("Course", CourseSchema);
export const Unit = mongoose.model("Unit", UnitSchema);
export const Lesson = mongoose.model("Lesson", LessonSchema);
export const Exercise = mongoose.model("Exercise", ExerciseSchema);
export { Vocabulary };
export { UserVocabularyProgress };
export { UserExerciseProgress };
export { ChallengeTest };
export { UserChallengeAttempt };