// ===============================================
// COURSES RESOLVER - SKILL-BASED ARCHITECTURE
// ===============================================

import {
  Course,
  Unit,
  Lesson,
  ExerciseTemplate,
  Vocabulary,
  UserVocabularyProgress,
  PersonalExerciseBank,
  User
} from '../data/models/index.js';

export const coursesTypeDefs = `
  # ===============================================
  # SKILL-BASED COURSE SYSTEM
  # ===============================================
  
  type Course {
    id: ID!
    title: String!
    description: String!
    category: CourseCategory!
    skill_focus: [SkillType!]!
    thumbnail: String
    color: String!
    estimated_duration: Int!
    total_units: Int!
    
    # Challenge Test System
    challenge_test: ChallengeTest!
    
    # Prerequisites
    prerequisites: [Course!]!
    
    # Access & Status
    is_premium: Boolean!
    is_published: Boolean!
    sort_order: Int!
    
    # User-specific fields (computed)
    user_progress: CourseProgress
    is_unlocked: Boolean!
    can_start_challenge: Boolean!
    
    # Relations
    units: [Unit!]!
    
    # Metadata
    created_at: String!
    slug: String!
  }
  
  type Unit {
    id: ID!
    title: String!
    description: String
    course_id: ID!
    theme: UnitTheme!
    icon: String
    color: String!
    illustration: String
    
    # Structure
    total_lessons: Int!
    estimated_duration: Int!
    
    # Prerequisites & Challenge
    prerequisites: UnitPrerequisites!
    challenge_test: ChallengeTest!
    
    # Access
    is_premium: Boolean!
    is_published: Boolean!
    sort_order: Int!
    
    # User-specific (computed)
    progress_percentage: Int!
    is_unlocked: Boolean!
    
    # Relations
    course: Course!
    lessons: [Lesson!]!
    
    created_at: String!
  }
  
  type Lesson {
    id: ID!
    title: String!
    description: String
    course_id: ID!
    unit_id: ID!
    lesson_type: LessonType!
    objective: String!
    
    # Vocabulary & AI Config
    vocabulary_pool: [LessonVocabulary!]!
    lesson_context: LessonContext!
    grammar_point: GrammarPoint
    exercise_generation: ExerciseGenerationConfig!
    
    # Lesson Info
    estimated_duration: Int!
    xp_reward: Int!
    
    # Access
    is_premium: Boolean!
    is_published: Boolean!
    sort_order: Int!
    
    # User-specific (computed)
    status: LessonStatus!
    is_completed: Boolean!
    is_unlocked: Boolean!
    user_score: Int
    
    # Relations
    course: Course!
    unit: Unit!
    vocabulary: [Vocabulary!]!
    
    created_at: String!
  }
  
  # ===============================================
  # VOCABULARY & AI SYSTEM
  # ===============================================
  
  type LessonVocabulary {
    vocabulary_id: ID!
    context_in_lesson: String!
    is_main_focus: Boolean!
    introduction_order: Int!
    difficulty_weight: Int!
    vocabulary: Vocabulary!
  }
  
  type Vocabulary {
    id: ID!
    word: String!
    meaning: String!
    pronunciation: String
    audio_url: String
    image_url: String
    difficulty: DifficultyLevel!
    part_of_speech: PartOfSpeech!
    frequency_score: Int!
    tags: [String!]!
    theme_categories: [UnitTheme!]!
    
    # Definitions & Examples
    definitions: [VocabularyDefinition!]!
    primary_definition: VocabularyDefinition
    
    # Relations
    synonyms: [VocabularyRelation!]!
    antonyms: [VocabularyRelation!]!
    
    # User Progress (computed)
    user_progress: UserVocabularyProgress
    
    created_at: String!
  }
  
  type VocabularyDefinition {
    context: String!
    meaning: String!
    example: VocabularyExample
  }
  
  type VocabularyExample {
    sentence: String!
    translation: String!
  }
  
  type VocabularyRelation {
    word: String!
    meaning: String!
  }
  
  # ===============================================
  # USER PROGRESS SYSTEM
  # ===============================================
  
  type CourseProgress {
    course_id: ID!
    status: ProgressStatus!
    progress_percentage: Int!
    started_at: String
    completed_at: String
    current_unit_id: ID
    current_lesson_id: ID
  }
  
  type UserVocabularyProgress {
    id: ID!
    user_id: ID!
    vocabulary_id: ID!
    mastery_level: MasteryLevel!
    correct_answers: Int!
    total_attempts: Int!
    success_rate: Int!
    
    # Spaced Repetition
    spaced_repetition: SpacedRepetition!
    is_due_for_review: Boolean!
    
    # Performance
    exercise_performance: ExercisePerformanceMap!
    
    # Context
    first_learned_lesson: Lesson!
    lesson_encounters: [LessonEncounter!]!
    
    created_at: String!
    last_practiced_at: String!
  }
  
  type SpacedRepetition {
    interval: Int!
    ease_factor: Float!
    repetitions: Int!
    last_reviewed: String
    next_review_date: String!
    review_history: [ReviewHistoryItem!]!
  }
  
  # ===============================================
  # EXERCISE GENERATION SYSTEM
  # ===============================================
  
  type ExerciseTemplate {
    id: ID!
    exercise_type: ExerciseType!
    type_display_name: String!
    description: String!
    
    # AI Configuration
    prompt_template: PromptTemplate!
    generation_rules: GenerationRules!
    
    # Exercise Info
    skill_focus: [SkillType!]!
    estimated_time: Int!
    requires_audio: Boolean!
    requires_microphone: Boolean!
    difficulty_levels: [DifficultyLevel!]!
    
    is_active: Boolean!
    created_at: String!
  }
  
  type PromptTemplate {
    system_context: String!
    main_prompt: String!
    variables: [String!]!
    expected_output_format: JSON!
    fallback_template: JSON!
  }
  
  type GenerationRules {
    max_attempts: Int!
    validation_rules: [String!]!
    difficulty_adaptation: Boolean!
    content_filters: [String!]!
  }
  
  # ===============================================
  # SUPPORTING TYPES
  # ===============================================
  
  type LessonContext {
    situation: String!
    cultural_context: String!
    use_cases: [String!]!
    avoid_topics: [String!]!
  }
  
  type GrammarPoint {
    title: String!
    explanation: String!
    pattern: String!
    examples: [String!]!
  }
  
  type ExerciseGenerationConfig {
    total_exercises: Int!
    exercise_distribution: ExerciseDistribution!
    difficulty_progression: Boolean!
    vocabulary_coverage: VocabularyCoverage!
  }
  
  type ExerciseDistribution {
    multiple_choice: Int!
    fill_blank: Int!
    listening: Int!
    translation: Int!
    word_matching: Int!
    sentence_building: Int!
    true_false: Int!
    listen_choose: Int!
    speak_repeat: Int!
  }
  
  type ChallengeTest {
    total_questions: Int!
    pass_percentage: Int!
    must_correct_questions: [Int!]!
    time_limit: Int!
  }
  
  type UnitPrerequisites {
    previous_unit_id: ID
    minimum_score: Int!
    required_hearts: Int!
  }
  
  type ExercisePerformanceMap {
    multiple_choice: ExercisePerformance!
    fill_blank: ExercisePerformance!
    listening: ExercisePerformance!
    translation: ExercisePerformance!
    word_matching: ExercisePerformance!
    sentence_building: ExercisePerformance!
    true_false: ExercisePerformance!
    listen_choose: ExercisePerformance!
    speak_repeat: ExercisePerformance!
  }
  
  type ExercisePerformance {
    correct: Int!
    total: Int!
    success_rate: Int!
  }
  
  type LessonEncounter {
    lesson_id: ID!
    date: String!
    context: String!
    performance: ExercisePerformance!
  }
  
  type ReviewHistoryItem {
    date: String!
    quality: Int!
    interval_before: Int!
    interval_after: Int!
    ease_factor_before: Float!
    ease_factor_after: Float!
  }
  
  # ===============================================
  # ENUMS
  # ===============================================
  
  enum CourseCategory {
    basic_communication
    daily_life
    food_dining
    work_career
    travel_transport
    family_friends
    health_fitness
    business
  }
  
  enum UnitTheme {
    greetings_intro
    numbers_time
    family_relationships
    food_drinks
    shopping_money
    transport_directions
    weather_seasons
    hobbies_interests
    work_occupations
    health_body
    home_furniture
    clothes_fashion
    technology_media
    education_learning
    emotions_feelings
  }
  
  enum SkillType {
    vocabulary
    grammar
    listening
    speaking
    reading
    writing
    pronunciation
    translation
  }
  
  enum LessonType {
    vocabulary
    grammar
    mixed
  }
  
  enum LessonStatus {
    locked
    available
    in_progress
    completed
  }
  
  enum ExerciseType {
    multiple_choice
    fill_blank
    listening
    translation
    word_matching
    sentence_building
    true_false
    listen_choose
    speak_repeat
  }
  
  enum DifficultyLevel {
    beginner
    intermediate
    advanced
  }
  
  enum PartOfSpeech {
    noun
    verb
    adjective
    adverb
    preposition
    conjunction
    interjection
    pronoun
  }
  
  enum MasteryLevel {
    new
    learning
    learned
    mastered
  }
  
  enum ProgressStatus {
    not_started
    in_progress
    completed
  }
  
  enum VocabularyCoverage {
    all
    random_subset
    main_focus_only
  }
  
  # ===============================================
  # QUERIES
  # ===============================================
  
  extend type Query {
    # Course System
    courses(category: CourseCategory, skill_focus: SkillType): [Course!]!
    course(id: ID!): Course
    
    # Unit System  
    courseUnits(courseId: ID!): [Unit!]!
    unit(id: ID!): Unit
    
    # Lesson System
    unitLessons(unitId: ID!): [Lesson!]!
    lesson(id: ID!): Lesson
    
    # Vocabulary System
    vocabulary(
      search: String
      theme: UnitTheme
      difficulty: DifficultyLevel
      tags: [String!]
      limit: Int = 20
      skip: Int = 0
    ): [Vocabulary!]!
    vocabularyWord(id: ID!): Vocabulary
    
    # User Progress
    myProgress: [CourseProgress!]!
    myCourseProgress(courseId: ID!): CourseProgress
    myVocabularyProgress(
      masteryLevel: MasteryLevel
      dueForReview: Boolean
      limit: Int = 20
    ): [UserVocabularyProgress!]!
    myVocabularyStats: VocabularyStats!
    
    # Exercise Templates
    exerciseTemplates(exerciseType: ExerciseType): [ExerciseTemplate!]!
    exerciseTemplate(id: ID!): ExerciseTemplate
  }
  
  # ===============================================
  # MUTATIONS
  # ===============================================
  
  extend type Mutation {
    # Course Progress
    startCourse(courseId: ID!): CourseProgress!
    completeCourse(courseId: ID!): CourseProgress!
    
    # Lesson Progress
    startLesson(lessonId: ID!): Boolean!
    completeLesson(lessonId: ID!, score: Int!): LessonCompletionResult!
    
    # Vocabulary Progress
    updateVocabularyProgress(
      vocabularyId: ID!
      exerciseType: ExerciseType!
      isCorrect: Boolean!
      quality: Int
    ): UserVocabularyProgress!
    
    # Spaced Repetition
    recordReview(
      vocabularyId: ID!
      quality: Int!
    ): UserVocabularyProgress!
  }
  
  # ===============================================
  # ADDITIONAL TYPES
  # ===============================================
  
  type LessonCompletionResult {
    lesson: Lesson!
    xp_earned: Int!
    hearts_used: Int!
    new_vocabulary_learned: [Vocabulary!]!
    level_up: Boolean!
    unit_completed: Boolean!
    course_completed: Boolean!
  }
  
  type VocabularyStats {
    total_words_learned: Int!
    words_by_mastery: MasteryBreakdown!
    words_due_for_review: Int!
    daily_review_target: Int!
    weekly_learning_streak: Int!
  }
  
  type MasteryBreakdown {
    new: Int!
    learning: Int!
    learned: Int!
    mastered: Int!
  }
  
  # JSON scalar type
  scalar JSON
`;

export const coursesResolvers = {
  Query: {
    // ===============================================
    // COURSE QUERIES
    // ===============================================
    courses: async (_, { category, skill_focus }, { user }) => {
      try {
        let query = { is_published: true };
        
        if (category) query.category = category;
        if (skill_focus) query.skill_focus = skill_focus;
        
        const courses = await Course.find(query)
          .sort({ sort_order: 1, created_at: 1 })
          .populate('prerequisites');
        
        // Add user-specific data if authenticated
        if (user) {
          for (let course of courses) {
            course._user_progress = user.getCourseProgress(course._id);
            course._is_unlocked = await checkCourseUnlocked(course, user);
          }
        }
        
        return courses;
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw new Error('Failed to fetch courses');
      }
    },
    
    course: async (_, { id }, { user }) => {
      try {
        const course = await Course.findById(id)
          .populate('prerequisites');
        
        if (!course) throw new Error('Course not found');
        
        if (user) {
          course._user_progress = user.getCourseProgress(course._id);
          course._is_unlocked = await checkCourseUnlocked(course, user);
        }
        
        return course;
      } catch (error) {
        console.error('Error fetching course:', error);
        throw new Error('Failed to fetch course');
      }
    },
    
    // ===============================================
    // UNIT QUERIES
    // ===============================================
    courseUnits: async (_, { courseId }, { user }) => {
      try {
        const units = await Unit.find({ 
          course_id: courseId, 
          is_published: true 
        })
        .sort({ sort_order: 1 })
        .populate('course_id');
        
        if (user) {
          for (let unit of units) {
            unit._is_unlocked = await checkUnitUnlocked(unit, user);
            unit._progress_percentage = await calculateUnitProgress(unit._id, user._id);
          }
        }
        
        return units;
      } catch (error) {
        console.error('Error fetching course units:', error);
        throw new Error('Failed to fetch course units');
      }
    },
    
    unit: async (_, { id }, { user }) => {
      try {
        const unit = await Unit.findById(id)
          .populate('course_id');
        
        if (!unit) throw new Error('Unit not found');
        
        if (user) {
          unit._is_unlocked = await checkUnitUnlocked(unit, user);
          unit._progress_percentage = await calculateUnitProgress(unit._id, user._id);
        }
        
        return unit;
      } catch (error) {
        console.error('Error fetching unit:', error);
        throw new Error('Failed to fetch unit');
      }
    },
    
    // ===============================================
    // LESSON QUERIES
    // ===============================================
    unitLessons: async (_, { unitId }, { user }) => {
      try {
        const lessons = await Lesson.find({ 
          unit_id: unitId, 
          is_published: true 
        })
        .sort({ sort_order: 1 })
        .populate('vocabulary_pool.vocabulary_id')
        .populate('course_id')
        .populate('unit_id');
        
        if (user) {
          for (let lesson of lessons) {
            lesson._is_unlocked = await checkLessonUnlocked(lesson, user);
            lesson._status = await getLessonStatus(lesson._id, user._id);
            lesson._is_completed = lesson._status === 'completed';
            lesson._user_score = await getLessonScore(lesson._id, user._id);
          }
        }
        
        return lessons;
      } catch (error) {
        console.error('Error fetching unit lessons:', error);
        throw new Error('Failed to fetch unit lessons');
      }
    },
    
    lesson: async (_, { id }, { user }) => {
      try {
        const lesson = await Lesson.findById(id)
          .populate('vocabulary_pool.vocabulary_id')
          .populate('course_id')
          .populate('unit_id');
        
        if (!lesson) throw new Error('Lesson not found');
        
        if (user) {
          lesson._is_unlocked = await checkLessonUnlocked(lesson, user);
          lesson._status = await getLessonStatus(lesson._id, user._id);
          lesson._is_completed = lesson._status === 'completed';
          lesson._user_score = await getLessonScore(lesson._id, user._id);
        }
        
        return lesson;
      } catch (error) {
        console.error('Error fetching lesson:', error);
        throw new Error('Failed to fetch lesson');
      }
    },
    
    // ===============================================
    // VOCABULARY QUERIES
    // ===============================================
    vocabulary: async (_, { search, theme, difficulty, tags, limit, skip }) => {
      try {
        let query = { is_active: true };
        
        if (search) {
          query.$text = { $search: search };
        }
        if (theme) {
          query.theme_categories = theme;
        }
        if (difficulty) {
          query.difficulty = difficulty;
        }
        if (tags && tags.length > 0) {
          query.tags = { $in: tags };
        }
        
        let vocabularyQuery = Vocabulary.find(query)
          .limit(limit)
          .skip(skip);
        
        if (search) {
          vocabularyQuery = vocabularyQuery.sort({ score: { $meta: 'textScore' } });
        } else {
          vocabularyQuery = vocabularyQuery.sort({ frequency_score: -1 });
        }
        
        return await vocabularyQuery;
      } catch (error) {
        console.error('Error searching vocabulary:', error);
        throw new Error('Failed to search vocabulary');
      }
    },
    
    vocabularyWord: async (_, { id }) => {
      try {
        const vocabulary = await Vocabulary.findById(id);
        if (!vocabulary) throw new Error('Vocabulary not found');
        return vocabulary;
      } catch (error) {
        console.error('Error fetching vocabulary word:', error);
        throw new Error('Failed to fetch vocabulary word');
      }
    },
    
    // ===============================================
    // USER PROGRESS QUERIES
    // ===============================================
    myProgress: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        return user.learning_progress.courses.map(courseProgress => ({
          ...courseProgress,
          course_id: courseProgress.course_id.toString()
        }));
      } catch (error) {
        console.error('Error fetching user progress:', error);
        throw new Error('Failed to fetch progress');
      }
    },
    
    myCourseProgress: async (_, { courseId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const progress = user.getCourseProgress(courseId);
        return progress ? {
          ...progress,
          course_id: progress.course_id.toString()
        } : null;
      } catch (error) {
        console.error('Error fetching course progress:', error);
        throw new Error('Failed to fetch course progress');
      }
    },
    
    myVocabularyProgress: async (_, { masteryLevel, dueForReview, limit }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        let query = { user_id: user._id, is_active: true };
        
        if (masteryLevel) {
          query.mastery_level = masteryLevel;
        }
        
        if (dueForReview) {
          query['spaced_repetition.next_review_date'] = { $lte: new Date() };
        }
        
        return await UserVocabularyProgress.find(query)
          .populate('vocabulary_id')
          .populate('first_learned_lesson')
          .sort({ 'spaced_repetition.next_review_date': 1 })
          .limit(limit);
      } catch (error) {
        console.error('Error fetching vocabulary progress:', error);
        throw new Error('Failed to fetch vocabulary progress');
      }
    },
    
    myVocabularyStats: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const stats = await UserVocabularyProgress.getUserStats(user._id);
        
        // Transform aggregation result to expected format
        const masteryBreakdown = { new: 0, learning: 0, learned: 0, mastered: 0 };
        let totalWords = 0;
        
        stats.forEach(stat => {
          masteryBreakdown[stat._id] = stat.count;
          totalWords += stat.count;
        });
        
        const wordsForReview = await UserVocabularyProgress.countDocuments({
          user_id: user._id,
          'spaced_repetition.next_review_date': { $lte: new Date() },
          is_active: true
        });
        
        return {
          total_words_learned: totalWords,
          words_by_mastery: masteryBreakdown,
          words_due_for_review: wordsForReview,
          daily_review_target: 20, // Could be user preference
          weekly_learning_streak: user.gamification.streak.current || 0
        };
      } catch (error) {
        console.error('Error fetching vocabulary stats:', error);
        throw new Error('Failed to fetch vocabulary stats');
      }
    },
    
    // ===============================================
    // EXERCISE TEMPLATE QUERIES
    // ===============================================
    exerciseTemplates: async (_, { exerciseType }) => {
      try {
        let query = { is_active: true };
        if (exerciseType) query.exercise_type = exerciseType;
        
        return await ExerciseTemplate.find(query)
          .sort({ exercise_type: 1 });
      } catch (error) {
        console.error('Error fetching exercise templates:', error);
        throw new Error('Failed to fetch exercise templates');
      }
    },
    
    exerciseTemplate: async (_, { id }) => {
      try {
        const template = await ExerciseTemplate.findById(id);
        if (!template) throw new Error('Exercise template not found');
        return template;
      } catch (error) {
        console.error('Error fetching exercise template:', error);
        throw new Error('Failed to fetch exercise template');
      }
    }
  },
  
  Mutation: {
    // ===============================================
    // COURSE PROGRESS MUTATIONS
    // ===============================================
    startCourse: async (_, { courseId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        
        // Check if course is unlocked
        const isUnlocked = await checkCourseUnlocked(course, user);
        if (!isUnlocked) throw new Error('Course is locked');
        
        user.updateCourseProgress(courseId, {
          status: 'in_progress',
          started_at: new Date(),
          progress_percentage: 0
        });
        
        await user.save();
        
        return user.getCourseProgress(courseId);
      } catch (error) {
        console.error('Error starting course:', error);
        throw new Error('Failed to start course');
      }
    },
    
    // ===============================================
    // LESSON PROGRESS MUTATIONS  
    // ===============================================
    completeLesson: async (_, { lessonId, score }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const lesson = await Lesson.findById(lessonId)
          .populate('vocabulary_pool.vocabulary_id')
          .populate('course_id')
          .populate('unit_id');
        
        if (!lesson) throw new Error('Lesson not found');
        
        // Check if lesson is unlocked
        const isUnlocked = await checkLessonUnlocked(lesson, user);
        if (!isUnlocked) throw new Error('Lesson is locked');
        
        // Award XP
        const xpEarned = lesson.xp_reward;
        user.addXP(xpEarned);
        
        // Update streak
        user.updateStreak();
        
        // Check for level up
        const oldLevel = user.gamification.current_level;
        const newLevel = Math.floor(user.gamification.total_xp / 100) + 1;
        const levelUp = newLevel > oldLevel;
        
        // Update course progress
        const courseProgress = user.getCourseProgress(lesson.course_id);
        if (courseProgress) {
          courseProgress.current_lesson_id = lesson._id;
          // Calculate new progress percentage
          const totalLessons = await Lesson.countDocuments({ 
            course_id: lesson.course_id, 
            is_published: true 
          });
          const completedLessons = await getCompletedLessonsCount(lesson.course_id, user._id);
          courseProgress.progress_percentage = Math.round((completedLessons / totalLessons) * 100);
        }
        
        await user.save();
        
        // Get new vocabulary learned
        const newVocabulary = lesson.vocabulary_pool
          .filter(vp => vp.is_main_focus)
          .map(vp => vp.vocabulary_id);
        
        // Check if unit/course completed
        const unitCompleted = await checkUnitCompleted(lesson.unit_id, user._id);
        const courseCompleted = unitCompleted && await checkCourseCompleted(lesson.course_id, user._id);
        
        return {
          lesson,
          xp_earned: xpEarned,
          hearts_used: 1, // Could be calculated based on mistakes
          new_vocabulary_learned: newVocabulary,
          level_up: levelUp,
          unit_completed: unitCompleted,
          course_completed: courseCompleted
        };
      } catch (error) {
        console.error('Error completing lesson:', error);
        throw new Error('Failed to complete lesson');
      }
    },
    
    // ===============================================
    // VOCABULARY PROGRESS MUTATIONS
    // ===============================================
    updateVocabularyProgress: async (_, { vocabularyId, exerciseType, isCorrect, quality }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        let progress = await UserVocabularyProgress.findOne({
          user_id: user._id,
          vocabulary_id: vocabularyId
        });
        
        if (!progress) {
          // Create new progress record
          progress = new UserVocabularyProgress({
            user_id: user._id,
            vocabulary_id: vocabularyId,
            first_learned_lesson: new mongoose.Types.ObjectId() // Should be current lesson
          });
        }
        
        // Update progress
        progress.updateProgress(exerciseType, isCorrect, quality);
        await progress.save();
        
        return await UserVocabularyProgress.findById(progress._id)
          .populate('vocabulary_id')
          .populate('first_learned_lesson');
      } catch (error) {
        console.error('Error updating vocabulary progress:', error);
        throw new Error('Failed to update vocabulary progress');
      }
    },
    
    recordReview: async (_, { vocabularyId, quality }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const progress = await UserVocabularyProgress.findOne({
          user_id: user._id,
          vocabulary_id: vocabularyId
        });
        
        if (!progress) throw new Error('Vocabulary progress not found');
        
        progress.updateSpacedRepetition(quality);
        await progress.save();
        
        return await UserVocabularyProgress.findById(progress._id)
          .populate('vocabulary_id')
          .populate('first_learned_lesson');
      } catch (error) {
        console.error('Error recording review:', error);
        throw new Error('Failed to record review');
      }
    }
  },
  
  // ===============================================
  // FIELD RESOLVERS
  // ===============================================
  // ===============================================
  // FIELD RESOLVERS
  // ===============================================
  Course: {
    units: async (course) => {
      return await Unit.find({ 
        course_id: course._id, 
        is_published: true 
      }).sort({ sort_order: 1 });
    },
    
    prerequisites: async (course) => {
      if (!course.prerequisites || course.prerequisites.length === 0) return [];
      return await Course.find({ _id: { $in: course.prerequisites } });
    },
    
    user_progress: (course) => course._user_progress || null,
    is_unlocked: (course) => course._is_unlocked !== undefined ? course._is_unlocked : true,
    can_start_challenge: (course) => course._can_start_challenge || false,
    slug: (course) => course.slug,
    created_at: (course) => course.createdAt?.toISOString()
  },
  
  Unit: {
    course: async (unit) => {
      return await Course.findById(unit.course_id);
    },
    
    lessons: async (unit) => {
      return await Lesson.find({ 
        unit_id: unit._id, 
        is_published: true 
      }).sort({ sort_order: 1 });
    },
    
    progress_percentage: (unit) => unit._progress_percentage || 0,
    is_unlocked: (unit) => unit._is_unlocked !== undefined ? unit._is_unlocked : false,
    created_at: (unit) => unit.createdAt?.toISOString()
  },
  
  Lesson: {
    course: async (lesson) => {
      return await Course.findById(lesson.course_id);
    },
    
    unit: async (lesson) => {
      return await Unit.findById(lesson.unit_id);
    },
    
    vocabulary: async (lesson) => {
      const vocabularyIds = lesson.vocabulary_pool.map(vp => vp.vocabulary_id);
      return await Vocabulary.find({ _id: { $in: vocabularyIds } });
    },
    
    status: (lesson) => lesson._status || 'locked',
    is_completed: (lesson) => lesson._is_completed || false,
    is_unlocked: (lesson) => lesson._is_unlocked !== undefined ? lesson._is_unlocked : false,
    user_score: (lesson) => lesson._user_score || 0,
    created_at: (lesson) => lesson.createdAt?.toISOString()
  },
  
  LessonVocabulary: {
    vocabulary: async (lessonVocab) => {
      return await Vocabulary.findById(lessonVocab.vocabulary_id);
    }
  },
  
  Vocabulary: {
    primary_definition: (vocabulary) => vocabulary.primary_definition,
    user_progress: async (vocabulary, _, { user }) => {
      if (!user) return null;
      return await UserVocabularyProgress.findOne({
        user_id: user._id,
        vocabulary_id: vocabulary._id
      });
    },
    created_at: (vocabulary) => vocabulary.createdAt?.toISOString()
  },
  
  UserVocabularyProgress: {
    success_rate: (progress) => progress.success_rate,
    is_due_for_review: (progress) => progress.is_due_for_review,
    
    vocabulary_id: (progress) => progress.vocabulary_id,
    first_learned_lesson: async (progress) => {
      return await Lesson.findById(progress.first_learned_lesson);
    },
    
    created_at: (progress) => progress.createdAt?.toISOString(),
    last_practiced_at: (progress) => progress.last_practiced_at?.toISOString(),
    
    exercise_performance: (progress) => {
      const perf = progress.exercise_performance;
      return {
        multiple_choice: {
          correct: perf.multiple_choice.correct,
          total: perf.multiple_choice.total,
          success_rate: perf.multiple_choice.total > 0 ? 
            Math.round((perf.multiple_choice.correct / perf.multiple_choice.total) * 100) : 0
        },
        fill_blank: {
          correct: perf.fill_blank.correct,
          total: perf.fill_blank.total,
          success_rate: perf.fill_blank.total > 0 ? 
            Math.round((perf.fill_blank.correct / perf.fill_blank.total) * 100) : 0
        },
        listening: {
          correct: perf.listening.correct,
          total: perf.listening.total,
          success_rate: perf.listening.total > 0 ? 
            Math.round((perf.listening.correct / perf.listening.total) * 100) : 0
        },
        translation: {
          correct: perf.translation.correct,
          total: perf.translation.total,
          success_rate: perf.translation.total > 0 ? 
            Math.round((perf.translation.correct / perf.translation.total) * 100) : 0
        },
        word_matching: {
          correct: perf.word_matching.correct,
          total: perf.word_matching.total,
          success_rate: perf.word_matching.total > 0 ? 
            Math.round((perf.word_matching.correct / perf.word_matching.total) * 100) : 0
        },
        sentence_building: {
          correct: perf.sentence_building.correct,
          total: perf.sentence_building.total,
          success_rate: perf.sentence_building.total > 0 ? 
            Math.round((perf.sentence_building.correct / perf.sentence_building.total) * 100) : 0
        },
        true_false: {
          correct: perf.true_false.correct,
          total: perf.true_false.total,
          success_rate: perf.true_false.total > 0 ? 
            Math.round((perf.true_false.correct / perf.true_false.total) * 100) : 0
        },
        listen_choose: {
          correct: perf.listen_choose.correct,
          total: perf.listen_choose.total,
          success_rate: perf.listen_choose.total > 0 ? 
            Math.round((perf.listen_choose.correct / perf.listen_choose.total) * 100) : 0
        },
        speak_repeat: {
          correct: perf.speak_repeat.correct,
          total: perf.speak_repeat.total,
          success_rate: perf.speak_repeat.total > 0 ? 
            Math.round((perf.speak_repeat.correct / perf.speak_repeat.total) * 100) : 0
        }
      };
    },
    
    spaced_repetition: (progress) => ({
      interval: progress.spaced_repetition.interval,
      ease_factor: progress.spaced_repetition.ease_factor,
      repetitions: progress.spaced_repetition.repetitions,
      last_reviewed: progress.spaced_repetition.last_reviewed?.toISOString(),
      next_review_date: progress.spaced_repetition.next_review_date?.toISOString(),
      review_history: progress.spaced_repetition.review_history.map(review => ({
        date: review.date.toISOString(),
        quality: review.quality,
        interval_before: review.interval_before,
        interval_after: review.interval_after,
        ease_factor_before: review.ease_factor_before,
        ease_factor_after: review.ease_factor_after
      }))
    })
  },
  
  ExerciseTemplate: {
    created_at: (template) => template.createdAt?.toISOString()
  }
};

// ===============================================
// HELPER FUNCTIONS
// ===============================================

async function checkCourseUnlocked(course, user) {
  // Course is unlocked if all prerequisites are completed
  if (!course.prerequisites || course.prerequisites.length === 0) return true;
  
  for (const prereqId of course.prerequisites) {
    const prereqProgress = user.getCourseProgress(prereqId);
    if (!prereqProgress || prereqProgress.status !== 'completed') {
      return false;
    }
  }
  return true;
}

async function checkUnitUnlocked(unit, user) {
  // Check if previous unit is completed (if exists)
  if (unit.prerequisites.previous_unit_id) {
    const progress = await calculateUnitProgress(unit.prerequisites.previous_unit_id, user._id);
    if (progress < unit.prerequisites.minimum_score) return false;
  }
  
  // Check hearts requirement
  if (user.gamification.hearts.current < unit.prerequisites.required_hearts) {
    return false;
  }
  
  return true;
}

async function checkLessonUnlocked(lesson, user) {
  // Check if unit is unlocked
  const unit = await Unit.findById(lesson.unit_id);
  const unitUnlocked = await checkUnitUnlocked(unit, user);
  if (!unitUnlocked) return false;
  
  // Check if previous lesson in unit is completed
  const previousLesson = await Lesson.findOne({
    unit_id: lesson.unit_id,
    sort_order: { $lt: lesson.sort_order },
    is_published: true
  }).sort({ sort_order: -1 });
  
  if (previousLesson) {
    const previousCompleted = await checkLessonCompleted(previousLesson._id, user._id);
    if (!previousCompleted) return false;
  }
  
  return true;
}

async function calculateUnitProgress(unitId, userId) {
  const totalLessons = await Lesson.countDocuments({ 
    unit_id: unitId, 
    is_published: true 
  });
  
  if (totalLessons === 0) return 0;
  
  const completedLessons = await getCompletedLessonsCount(unitId, userId, 'unit');
  return Math.round((completedLessons / totalLessons) * 100);
}

async function getLessonStatus(lessonId, userId) {
  // This would check user's lesson completion records
  // For now, return 'available' as placeholder
  return 'available';
}

async function getLessonScore(lessonId, userId) {
  // This would get user's best score for the lesson
  // For now, return 0 as placeholder
  return 0;
}

async function getCompletedLessonsCount(parentId, userId, type = 'course') {
  // This would count completed lessons for course or unit
  // For now, return 0 as placeholder
  return 0;
}

async function checkLessonCompleted(lessonId, userId) {
  // This would check if lesson is completed
  // For now, return false as placeholder
  return false;
}

async function checkUnitCompleted(unitId, userId) {
  const progress = await calculateUnitProgress(unitId, userId);
  return progress >= 100;
}

async function checkCourseCompleted(courseId, userId) {
  const totalUnits = await Unit.countDocuments({ 
    course_id: courseId, 
    is_published: true 
  });
  
  if (totalUnits === 0) return false;
  
  let completedUnits = 0;
  const units = await Unit.find({ course_id: courseId, is_published: true });
  
  for (const unit of units) {
    const unitProgress = await calculateUnitProgress(unit._id, userId);
    if (unitProgress >= 100) completedUnits++;
  }
  
  return completedUnits >= totalUnits;
}