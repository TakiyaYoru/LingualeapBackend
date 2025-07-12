// ===============================================
// COURSE GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const courseTypeDefs = `
  type Course {
    id: ID!
    title: String!
    description: String!
    level: String!
    category: String!
    skill_focus: [String!]!
    thumbnail: String
    color: String!
    estimatedDuration: Int!
    totalUnits: Int!
    totalLessons: Int!
    totalExercises: Int!
    prerequisites: [Course!]!
    challenge_test: ChallengeTest
    isPremium: Boolean!
    isPublished: Boolean!
    publishedAt: String
    learningObjectives: [String!]!
    difficulty: String!
    totalXP: Int!
    enrollmentCount: Int!
    completionCount: Int!
    averageRating: Float!
    completionRate: Int!
    slug: String!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  type ChallengeTest {
    total_questions: Int!
    pass_percentage: Int!
    must_correct_questions: [Int!]!
    time_limit: Int!
  }

  type Unit {
    id: ID!
    title: String!
    description: String!
    courseId: String!
    theme: String!
    icon: String
    color: String!
    totalLessons: Int!
    totalExercises: Int!
    estimatedDuration: Int!
    prerequisites: UnitPrerequisites
    challenge_test: ChallengeTest
    isPremium: Boolean!
    isPublished: Boolean!
    xpReward: Int!
    sortOrder: Int!
    progressPercentage: Int!
    isUnlocked: Boolean!
    vocabulary: [UnitVocabulary!]!
    createdAt: String!
  }

  type UnitPrerequisites {
    previous_unit_id: String
    minimum_score: Int!
    required_hearts: Int!
  }

  type UnitVocabulary {
    word: String!
    meaning: String!
    pronunciation: String
    audioUrl: String
    example: VocabularyExample
  }

  type VocabularyExample {
    sentence: String!
    translation: String!
  }

  type Lesson {
    id: ID!
    title: String!
    description: String
    courseId: String!
    unitId: String!
    type: String!
    lesson_type: String!
    objective: String
    vocabulary_pool: [VocabularyPoolItem!]!
    lesson_context: LessonContext
    grammar_point: GrammarPoint
    exercise_generation: ExerciseGeneration
    icon: String
    thumbnail: String
    totalExercises: Int!
    estimatedDuration: Int!
    difficulty: String!
    isPremium: Boolean!
    isPublished: Boolean!
    xpReward: Int!
    perfectScoreBonus: Int!
    targetAccuracy: Int!
    passThreshold: Int!
    sortOrder: Int!
    status: String!
    isCompleted: Boolean!
    isUnlocked: Boolean!
    userScore: Int
    createdAt: String!
  }

  type VocabularyPoolItem {
    vocabulary_id: String
    context_in_lesson: String!
    is_main_focus: Boolean!
    introduction_order: Int!
    difficulty_weight: Int!
  }

  type LessonContext {
    situation: String
    cultural_context: String
    use_cases: [String!]!
    avoid_topics: [String!]!
  }

  type GrammarPoint {
    title: String
    explanation: String
    pattern: String
    examples: [String!]!
  }

  type ExerciseGeneration {
    total_exercises: Int!
    exercise_distribution: ExerciseDistribution!
    difficulty_progression: Boolean!
    vocabulary_coverage: String!
  }

  type ExerciseDistribution {
    multiple_choice: Int!
    fill_blank: Int!
    listening: Int!
    translation: Int!
    word_matching: Int!
    listen_choose: Int!
    speak_repeat: Int!
  }

  type Exercise {
    id: ID!
    title: String
    instruction: String!
    type_display_name: String!
    courseId: String!
    unitId: String!
    lessonId: String!
    type: String!
    prompt_template: PromptTemplate
    generation_rules: GenerationRules
    skill_focus: [String!]!
    question: ExerciseQuestion!
    content: String! # JSON string containing exercise-specific content
    maxScore: Int!
    difficulty: String!
    xpReward: Int!
    timeLimit: Int
    estimatedTime: Int!
    requires_audio: Boolean!
    requires_microphone: Boolean!
    isPremium: Boolean!
    isActive: Boolean!
    sortOrder: Int!
    successRate: Int!
    createdAt: String!
  }

  type PromptTemplate {
    system_context: String
    main_prompt: String
    variables: [String!]!
    expected_output_format: String! # JSON string
    fallback_template: String! # JSON string
  }

  type GenerationRules {
    max_attempts: Int!
    validation_rules: [String!]!
    difficulty_adaptation: Boolean!
    content_filters: [String!]!
  }

  type ExerciseQuestion {
    text: String!
    audioUrl: String
    imageUrl: String
    videoUrl: String
  }

  input CourseFilters {
    level: String
    category: String
    difficulty: String
    isPremium: Boolean
    isPublished: Boolean
    skill_focus: [String!]
  }

  extend type Query {
    # Get all courses
    courses(filters: CourseFilters): [Course!]!
    
    # Get single course by ID
    course(id: ID!): Course
    
    # Get units by course ID
    courseUnits(courseId: ID!): [Unit!]!
    
    # Get lessons by unit ID
    unitLessons(unitId: ID!): [Lesson!]!
    
    # Get exercises by lesson ID
    lessonExercises(lessonId: ID!): [Exercise!]!
    
    # Get single lesson with exercises
    lesson(id: ID!): Lesson
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const courseResolvers = {
  Query: {
    // Get all courses
    courses: async (parent, { filters = {} }, { db }) => {
      try {
        console.log('📚 Getting courses with filters:', filters);
        
        const courses = await db.courses.getAll(filters);
        return courses;
      } catch (error) {
        console.error('❌ Error in courses query:', error.message);
        throw new GraphQLError('Failed to fetch courses');
      }
    },

    // Get single course
    course: async (parent, { id }, { db }) => {
      try {
        console.log('📚 Getting course:', id);
        
        const course = await db.courses.findById(id);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }
        
        return course;
      } catch (error) {
        console.error('❌ Error in course query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch course');
      }
    },

    // Get course units
    courseUnits: async (parent, { courseId }, { db, user }) => {
      try {
        console.log('📖 Getting units for course:', courseId);
        
        // Check if course exists
        const course = await db.courses.findById(courseId);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Get units
        const filters = {};
        
        // If user is not premium, filter out premium units
        if (!user || user.subscriptionType !== 'premium') {
          filters.isPremium = false;
        }

        const units = await db.units.getByCourseId(courseId, filters);
        
        // TODO: Add user progress calculation
        // For now, set basic unlock logic
        units.forEach((unit, index) => {
          unit._isUnlocked = index === 0; // First unit always unlocked
          unit._progressPercentage = 0;
        });

        return units;
      } catch (error) {
        console.error('❌ Error in courseUnits query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch course units');
      }
    },

    // Get unit lessons
    unitLessons: async (parent, { unitId }, { db, user }) => {
      try {
        console.log('📝 Getting lessons for unit:', unitId);
        
        // Check if unit exists
        const unit = await db.units.findById(unitId);
        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }

        // Get lessons
        const filters = {};
        
        // If user is not premium, filter out premium lessons
        if (!user || user.subscriptionType !== 'premium') {
          filters.isPremium = false;
        }

        const lessons = await db.lessons.getByUnitId(unitId, filters);
        
        // TODO: Add user progress calculation
        // For now, set basic status
        lessons.forEach((lesson, index) => {
          lesson._status = index === 0 ? 'available' : 'locked';
          lesson._isCompleted = false;
          lesson._isUnlocked = index === 0;
          lesson._userScore = null;
        });

        return lessons;
      } catch (error) {
        console.error('❌ Error in unitLessons query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch unit lessons');
      }
    },

    // Get lesson exercises
    lessonExercises: async (parent, { lessonId }, { db, user }) => {
      try {
        console.log('🎮 Getting exercises for lesson:', lessonId);
        
        // Check if user is authenticated
        if (!user) {
          throw new GraphQLError('You must be logged in to access exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Check if lesson exists
        const lesson = await db.lessons.findById(lessonId);
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Check if lesson requires premium
        if (lesson.isPremium && user.subscriptionType !== 'premium') {
          throw new GraphQLError('This lesson requires premium subscription', {
            extensions: { code: 'PREMIUM_REQUIRED' }
          });
        }

        const exercises = await db.exercises.getByLessonId(lessonId);
        return exercises;
      } catch (error) {
        console.error('❌ Error in lessonExercises query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch lesson exercises');
      }
    },

    // Get single lesson
    lesson: async (parent, { id }, { db, user }) => {
      try {
        console.log('📝 Getting lesson:', id);
        
        const lesson = await db.lessons.findById(id);
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Check premium access
        if (lesson.isPremium && (!user || user.subscriptionType !== 'premium')) {
          throw new GraphQLError('This lesson requires premium subscription', {
            extensions: { code: 'PREMIUM_REQUIRED' }
          });
        }

        // Set user-specific data
        lesson._status = 'available'; // TODO: Calculate based on progress
        lesson._isCompleted = false;
        lesson._isUnlocked = true;
        lesson._userScore = null;

        return lesson;
      } catch (error) {
        console.error('❌ Error in lesson query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch lesson');
      }
    }
  }
};