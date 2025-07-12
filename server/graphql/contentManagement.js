// ===============================================
// CONTENT MANAGEMENT MUTATIONS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const contentMutationTypeDefs = `
  # Course Input Types
  input CreateCourseInput {
    title: String!
    description: String!
    level: String!
    category: String!
    difficulty: String!
    estimatedDuration: Int!
    color: String
    thumbnail: String
    isPremium: Boolean
    learningObjectives: [String!]
    prerequisites: [String!]
    skill_focus: [String!]
    sortOrder: Int
  }

  input UpdateCourseInput {
    title: String
    description: String
    level: String
    category: String
    difficulty: String
    estimatedDuration: Int
    color: String
    thumbnail: String
    isPremium: Boolean
    isPublished: Boolean
    learningObjectives: [String!]
    prerequisites: [String!]
    skill_focus: [String!]
    sortOrder: Int
  }

  # Unit Input Types
  input CreateUnitInput {
    title: String!
    description: String!
    courseId: ID!
    theme: String!
    icon: String
    color: String
    estimatedDuration: Int!
    isPremium: Boolean
    sortOrder: Int!
    vocabulary: [CourseVocabularyInput!]
    grammarPoints: [GrammarPointInput!]
  }

  input UpdateUnitInput {
    title: String
    description: String
    theme: String
    icon: String
    color: String
    estimatedDuration: Int
    isPremium: Boolean
    isPublished: Boolean
    sortOrder: Int
    vocabulary: [CourseVocabularyInput!]
    grammarPoints: [GrammarPointInput!]
  }

  input CourseVocabularyInput {
    word: String!
    meaning: String!
    pronunciation: String
    audioUrl: String
    example: ExampleInput
  }

  input ExampleInput {
    sentence: String!
    translation: String!
  }

  input GrammarPointInput {
    title: String!
    explanation: String!
    examples: [ExampleInput!]
  }

  # Lesson Input Types
  input CreateLessonInput {
    title: String!
    description: String
    courseId: ID!
    unitId: ID!
    type: String!
    icon: String
    thumbnail: String
    estimatedDuration: Int!
    difficulty: String
    isPremium: Boolean
    sortOrder: Int!
    vocabulary: [CourseVocabularyInput!]
    grammarFocus: GrammarPointInput
  }

  input UpdateLessonInput {
    title: String
    description: String
    type: String
    icon: String
    thumbnail: String
    estimatedDuration: Int
    difficulty: String
    isPremium: Boolean
    isPublished: Boolean
    sortOrder: Int
    vocabulary: [CourseVocabularyInput!]
    grammarFocus: GrammarPointInput
  }

  # Exercise Input Types
  input CreateExerciseInput {
    title: String
    instruction: String!
    courseId: ID!
    unitId: ID!
    lessonId: ID!
    type: String!
    question: ExerciseQuestionInput!
    content: String! # JSON string
    maxScore: Int
    difficulty: String
    xpReward: Int
    timeLimit: Int
    estimatedTime: Int
    isPremium: Boolean
    sortOrder: Int!
    feedback: FeedbackInput
    tags: [String!]
  }

  input UpdateExerciseInput {
    title: String
    instruction: String
    type: String
    question: ExerciseQuestionInput
    content: String
    maxScore: Int
    difficulty: String
    xpReward: Int
    timeLimit: Int
    estimatedTime: Int
    isPremium: Boolean
    isActive: Boolean
    sortOrder: Int
    feedback: FeedbackInput
    tags: [String!]
  }

  input ExerciseQuestionInput {
    text: String!
    audioUrl: String
    imageUrl: String
    videoUrl: String
  }

  input FeedbackInput {
    correct: String
    incorrect: String
    hint: String
  }

  extend type Mutation {
    # Course Mutations
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    publishCourse(id: ID!): Course!
    unpublishCourse(id: ID!): Course!

    # Unit Mutations
    createUnit(input: CreateUnitInput!): Unit!
    updateUnit(id: ID!, input: UpdateUnitInput!): Unit!
    deleteUnit(id: ID!): Boolean!
    publishUnit(id: ID!): Unit!
    unpublishUnit(id: ID!): Unit!

    # Lesson Mutations
    createLesson(input: CreateLessonInput!): Lesson!
    updateLesson(id: ID!, input: UpdateLessonInput!): Lesson!
    deleteLesson(id: ID!): Boolean!
    publishLesson(id: ID!): Lesson!
    unpublishLesson(id: ID!): Lesson!

    # Exercise Mutations
    createExercise(input: CreateExerciseInput!): Exercise!
    updateExercise(id: ID!, input: UpdateExerciseInput!): Exercise!
    deleteExercise(id: ID!): Boolean!
    activateExercise(id: ID!): Exercise!
    deactivateExercise(id: ID!): Exercise!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const contentMutationResolvers = {
  Mutation: {
    // ===============================================
    // COURSE MUTATIONS
    // ===============================================

    createCourse: async (parent, { input }, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Creating new course:', input.title);

        const courseData = {
          ...input,
          createdBy: user.userId,
          isPublished: false,
          sortOrder: input.sortOrder || 0
        };

        const course = await db.courses.create(courseData, user.userId);
        return course;
      } catch (error) {
        console.error('❌ Error creating course:', error.message);
        throw new GraphQLError('Failed to create course');
      }
    },

    updateCourse: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Updating course:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const course = await db.courses.update(id, updateData);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        return course;
      } catch (error) {
        console.error('❌ Error updating course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update course');
      }
    },

    deleteCourse: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting course:', id);

        const deleted = await db.courses.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting course:', error.message);
        throw new GraphQLError('Failed to delete course');
      }
    },

    publishCourse: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Publishing course:', id);

        const course = await db.courses.update(id, {
          isPublished: true,
          publishedAt: new Date(),
          lastUpdatedBy: user.userId
        });

        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        return course;
      } catch (error) {
        console.error('❌ Error publishing course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish course');
      }
    },

    // ===============================================
    // UNIT MUTATIONS
    // ===============================================

    createUnit: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Creating new unit:', input.title);

        const unitData = {
          ...input,
          createdBy: user.userId,
          isPublished: false
        };

        const unit = await db.units.create(unitData, user.userId);
        return unit;
      } catch (error) {
        console.error('❌ Error creating unit:', error.message);
        throw new GraphQLError('Failed to create unit');
      }
    },

    updateUnit: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Updating unit:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const unit = await db.units.update(id, updateData);
        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }

        return unit;
      } catch (error) {
        console.error('❌ Error updating unit:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update unit');
      }
    },

    deleteUnit: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting unit:', id);

        const deleted = await db.units.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting unit:', error.message);
        throw new GraphQLError('Failed to delete unit');
      }
    },

    // ===============================================
    // LESSON MUTATIONS
    // ===============================================

    createLesson: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Creating new lesson:', input.title);

        const lessonData = {
          ...input,
          createdBy: user.userId,
          isPublished: false
        };

        const lesson = await db.lessons.create(lessonData, user.userId);
        return lesson;
      } catch (error) {
        console.error('❌ Error creating lesson:', error.message);
        throw new GraphQLError('Failed to create lesson');
      }
    },

    updateLesson: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Updating lesson:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const lesson = await db.lessons.update(id, updateData);
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        return lesson;
      } catch (error) {
        console.error('❌ Error updating lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update lesson');
      }
    },

    deleteLesson: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting lesson:', id);

        const deleted = await db.lessons.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting lesson:', error.message);
        throw new GraphQLError('Failed to delete lesson');
      }
    },

    // ===============================================
    // EXERCISE MUTATIONS
    // ===============================================

    createExercise: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Creating new exercise:', input.type);

        const exerciseData = {
          ...input,
          createdBy: user.userId,
          isActive: true
        };

        const exercise = await db.exercises.create(exerciseData, user.userId);
        return exercise;
      } catch (error) {
        console.error('❌ Error creating exercise:', error.message);
        throw new GraphQLError('Failed to create exercise');
      }
    },

    updateExercise: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Updating exercise:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const exercise = await db.exercises.update(id, updateData);
        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        return exercise;
      } catch (error) {
        console.error('❌ Error updating exercise:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update exercise');
      }
    },

    deleteExercise: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting exercise:', id);

        const deleted = await db.exercises.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting exercise:', error.message);
        throw new GraphQLError('Failed to delete exercise');
      }
    }
  }
};