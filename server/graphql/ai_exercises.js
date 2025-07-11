// ===============================================
// AI EXERCISES RESOLVER - EXERCISE GENERATION & MANAGEMENT
// ===============================================

import {
  ExerciseTemplate,
  Vocabulary,
  Lesson,
  PersonalExerciseBank,
  UserVocabularyProgress
} from '../data/models/index.js';

import Anthropic from '@anthropic-ai/sdk';
import textToSpeech from '@google-cloud/text-to-speech';

// Initialize services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ttsClient = new textToSpeech.TextToSpeechClient();

// In-memory audio storage
const audioStorage = new Map();

// Export for server access
export { audioStorage };

export const aiExercisesTypeDefs = `
  # ===============================================
  # AI EXERCISE GENERATION SYSTEM
  # ===============================================
  
  type GeneratedExercise {
    id: ID!
    exercise_type: ExerciseType!
    content: JSON!
    audio_url: String
    source_lesson_id: ID!
    vocabulary_focus: [ID!]!
    
    # Generation metadata
    ai_generation_info: AIGenerationInfo!
    
    # Context
    lesson_context: ExerciseContext!
    
    created_at: String!
  }
  
  type AIGenerationInfo {
    model_used: String!
    generation_time: Float!
    prompt_version: String!
    fallback_used: Boolean!
    attempts_made: Int!
  }
  
  type ExerciseContext {
    situation: String!
    theme: String!
    difficulty: String!
    user_level: String!
  }
  
  type ExerciseGenerationResult {
    exercises: [GeneratedExercise!]!
    total_generated: Int!
    success_count: Int!
    failure_count: Int!
    total_generation_time: Float!
    lesson_ready: Boolean!
  }
  
  type PersonalExerciseRecord {
    id: ID!
    exercise_content: JSON!
    exercise_type: ExerciseType!
    source_lesson_id: ID!
    vocabulary_focus: [Vocabulary!]!
    
    # Performance
    performance: ExercisePerformanceType!
    time_taken: Int!
    user_response: JSON
    
    # Review data
    review_priority: ReviewPriority!
    practice_sessions: [PracticeSession!]!
    total_practices: Int!
    practice_success_rate: Int!
    
    # Context
    lesson_context: ExerciseContext!
    ai_generation_info: AIGenerationInfo!
    
    completed_at: String!
    created_at: String!
  }
  
  type PracticeSession {
    practiced_at: String!
    performance: ExercisePerformanceType!
    time_taken: Int!
    context: PracticeContext!
  }
  
  # ===============================================
  # INPUT TYPES
  # ===============================================
  
  input GenerateExercisesInput {
    lesson_id: ID!
    exercise_types: [ExerciseType!]
    vocabulary_subset: [ID!]
    user_level: String
    force_regenerate: Boolean = false
  }
  
  input CompleteExerciseInput {
    lesson_id: ID!
    exercise_type: ExerciseType!
    vocabulary_focus: [ID!]!
    user_response: JSON!
    time_taken: Int!
    is_correct: Boolean!
    score: Int
  }
  
  input PracticeExerciseInput {
    exercise_id: ID!
    user_response: JSON!
    time_taken: Int!
    performance: ExercisePerformanceType!
    context: PracticeContext!
  }
  
  # ===============================================
  # ENUMS
  # ===============================================
  
  enum ExercisePerformanceType {
    correct
    incorrect
    partially_correct
  }
  
  enum ReviewPriority {
    high
    medium
    low
  }
  
  enum PracticeContext {
    lesson_practice
    review_session
    challenge_mode
    spaced_repetition
  }
  
  # ===============================================
  # QUERIES
  # ===============================================
  
  extend type Query {
    # Exercise Generation
    generateLessonExercises(input: GenerateExercisesInput!): ExerciseGenerationResult!
    
    # Personal Exercise Bank
    myExerciseBank(
      exercise_type: ExerciseType
      vocabulary_id: ID
      review_priority: ReviewPriority
      limit: Int = 20
      skip: Int = 0
    ): [PersonalExerciseRecord!]!
    
    myExercise(id: ID!): PersonalExerciseRecord
    
    # Review System
    exercisesForReview(
      exercise_type: ExerciseType
      limit: Int = 10
    ): [PersonalExerciseRecord!]!
    
    # Exercise Stats
    myExerciseStats: ExerciseStats!
  }
  
  extend type Mutation {
    # Complete exercises from lesson
    completeExercise(input: CompleteExerciseInput!): PersonalExerciseRecord!
    
    # Practice existing exercises
    practiceExercise(input: PracticeExerciseInput!): PersonalExerciseRecord!
    
    # Batch complete lesson exercises
    completeLessonExercises(
      lesson_id: ID!
      exercises: [CompleteExerciseInput!]!
    ): LessonExerciseCompletion!
    
    # Exercise management
    flagExercise(exercise_id: ID!, reason: String!): Boolean!
    deleteExercise(exercise_id: ID!): Boolean!
  }
  
  # ===============================================
  # ADDITIONAL TYPES
  # ===============================================
  
  type LessonExerciseCompletion {
    lesson: Lesson!
    completed_exercises: [PersonalExerciseRecord!]!
    total_exercises: Int!
    success_rate: Float!
    total_time_taken: Int!
    xp_earned: Int!
    new_vocabulary_progress: [UserVocabularyProgress!]!
  }
  
  type ExerciseStats {
    total_exercises_completed: Int!
    exercises_by_type: ExerciseTypeStats!
    exercises_by_performance: ExercisePerformanceStats!
    average_completion_time: Float!
    favorite_exercise_type: ExerciseType
    improvement_areas: [ExerciseType!]!
    daily_practice_streak: Int!
  }
  
  type ExerciseTypeStats {
    multiple_choice: ExerciseTypeStat!
    fill_blank: ExerciseTypeStat!
    listening: ExerciseTypeStat!
    translation: ExerciseTypeStat!
    word_matching: ExerciseTypeStat!
    sentence_building: ExerciseTypeStat!
    true_false: ExerciseTypeStat!
    listen_choose: ExerciseTypeStat!
    speak_repeat: ExerciseTypeStat!
  }
  
  type ExerciseTypeStat {
    completed: Int!
    success_rate: Float!
    average_time: Float!
    total_practices: Int!
  }
  
  type ExercisePerformanceStats {
    correct: Int!
    incorrect: Int!
    partially_correct: Int!
    overall_success_rate: Float!
  }
`;

export const aiExercisesResolvers = {
  Query: {
    // ===============================================
    // EXERCISE GENERATION
    // ===============================================
    generateLessonExercises: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const { lesson_id, exercise_types, vocabulary_subset, user_level, force_regenerate } = input;
        
        console.log(`🤖 Generating exercises for lesson: ${lesson_id}`);
        
        // Get lesson with vocabulary pool
        const lesson = await Lesson.findById(lesson_id)
          .populate('vocabulary_pool.vocabulary_id');
        
        if (!lesson) throw new Error('Lesson not found');
        
        // Determine which exercises to generate
        const exercisesToGenerate = exercise_types || 
          Object.keys(lesson.exercise_generation.exercise_distribution)
            .filter(type => lesson.exercise_generation.exercise_distribution[type] > 0);
        
        // Get vocabulary to use
        let vocabularyToUse = lesson.vocabulary_pool.map(vp => vp.vocabulary_id);
        if (vocabulary_subset && vocabulary_subset.length > 0) {
          vocabularyToUse = vocabularyToUse.filter(v => vocabulary_subset.includes(v._id.toString()));
        }
        
        const startTime = Date.now();
        const generatedExercises = [];
        let successCount = 0;
        let failureCount = 0;
        
        // Generate exercises
        for (const exerciseType of exercisesToGenerate) {
          const count = lesson.exercise_generation.exercise_distribution[exerciseType] || 1;
          
          for (let i = 0; i < count; i++) {
            try {
              // Select vocabulary for this exercise
              const vocabIndex = (i + generatedExercises.length) % vocabularyToUse.length;
              const vocabulary = vocabularyToUse[vocabIndex];
              
              const exercise = await generateSingleExercise(
                exerciseType,
                vocabulary,
                lesson,
                user_level || user.language_profile.current_level || 'beginner'
              );
              
              if (exercise) {
                generatedExercises.push(exercise);
                successCount++;
              } else {
                failureCount++;
              }
            } catch (error) {
              console.error(`Failed to generate ${exerciseType}:`, error);
              failureCount++;
            }
          }
        }
        
        const totalGenerationTime = (Date.now() - startTime) / 1000;
        
        console.log(`✅ Generated ${successCount} exercises, ${failureCount} failed in ${totalGenerationTime}s`);
        
        return {
          exercises: generatedExercises,
          total_generated: generatedExercises.length,
          success_count: successCount,
          failure_count: failureCount,
          total_generation_time: totalGenerationTime,
          lesson_ready: successCount >= lesson.exercise_generation.total_exercises * 0.7 // 70% success rate
        };
      } catch (error) {
        console.error('Error generating lesson exercises:', error);
        throw new Error('Failed to generate exercises');
      }
    },
    
    // ===============================================
    // PERSONAL EXERCISE BANK
    // ===============================================
    myExerciseBank: async (_, { exercise_type, vocabulary_id, review_priority, limit, skip }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        let query = { user_id: user._id, is_active: true };
        
        if (exercise_type) query.exercise_type = exercise_type;
        if (vocabulary_id) query.vocabulary_focus = vocabulary_id;
        if (review_priority) query.review_priority = review_priority;
        
        return await PersonalExerciseBank.find(query)
          .populate('vocabulary_focus')
          .populate('source_lesson_id')
          .sort({ completed_at: -1 })
          .limit(limit)
          .skip(skip);
      } catch (error) {
        console.error('Error fetching exercise bank:', error);
        throw new Error('Failed to fetch exercise bank');
      }
    },
    
    myExercise: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const exercise = await PersonalExerciseBank.findOne({
          _id: id,
          user_id: user._id
        })
        .populate('vocabulary_focus')
        .populate('source_lesson_id');
        
        if (!exercise) throw new Error('Exercise not found');
        return exercise;
      } catch (error) {
        console.error('Error fetching exercise:', error);
        throw new Error('Failed to fetch exercise');
      }
    },
    
    exercisesForReview: async (_, { exercise_type, limit }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const options = {
          exercise_type,
          review_priority: 'high',
          limit,
          exclude_recent_hours: 4 // Don't review exercises completed in last 4 hours
        };
        
        return await PersonalExerciseBank.getExercisesForReview(user._id, options);
      } catch (error) {
        console.error('Error fetching exercises for review:', error);
        throw new Error('Failed to fetch exercises for review');
      }
    },
    
    myExerciseStats: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const stats = await PersonalExerciseBank.getUserExerciseStats(user._id);
        
        // Transform aggregation result
        const typeStats = {};
        const exerciseTypes = ['multiple_choice', 'fill_blank', 'listening', 'translation', 
                             'word_matching', 'sentence_building', 'true_false', 'listen_choose', 'speak_repeat'];
        
        exerciseTypes.forEach(type => {
          typeStats[type] = {
            completed: 0,
            success_rate: 0,
            average_time: 0,
            total_practices: 0
          };
        });
        
        stats.forEach(stat => {
          const type = stat._id;
          const successRate = stat.performance_breakdown.find(p => p.performance === 'correct');
          const totalExercises = stat.total_exercises;
          
          typeStats[type] = {
            completed: totalExercises,
            success_rate: successRate ? (successRate.count / totalExercises) * 100 : 0,
            average_time: stat.performance_breakdown.reduce((sum, p) => sum + p.avg_time, 0) / stat.performance_breakdown.length,
            total_practices: totalExercises // Could include practice sessions
          };
        });
        
        // Calculate overall stats
        const totalExercises = await PersonalExerciseBank.countDocuments({ 
          user_id: user._id, 
          is_active: true 
        });
        
        const correctExercises = await PersonalExerciseBank.countDocuments({ 
          user_id: user._id, 
          performance: 'correct',
          is_active: true 
        });
        
        const incorrectExercises = await PersonalExerciseBank.countDocuments({ 
          user_id: user._id, 
          performance: 'incorrect',
          is_active: true 
        });
        
        const partiallyCorrect = totalExercises - correctExercises - incorrectExercises;
        
        // Find favorite exercise type (highest success rate with minimum exercises)
        let favoriteType = 'multiple_choice';
        let highestSuccessRate = 0;
        
        Object.entries(typeStats).forEach(([type, stat]) => {
          if (stat.completed >= 3 && stat.success_rate > highestSuccessRate) {
            favoriteType = type;
            highestSuccessRate = stat.success_rate;
          }
        });
        
        // Find improvement areas (lowest success rates)
        const improvementAreas = Object.entries(typeStats)
          .filter(([_, stat]) => stat.completed >= 3)
          .sort((a, b) => a[1].success_rate - b[1].success_rate)
          .slice(0, 3)
          .map(([type, _]) => type);
        
        return {
          total_exercises_completed: totalExercises,
          exercises_by_type: typeStats,
          exercises_by_performance: {
            correct: correctExercises,
            incorrect: incorrectExercises,
            partially_correct: partiallyCorrect,
            overall_success_rate: totalExercises > 0 ? (correctExercises / totalExercises) * 100 : 0
          },
          average_completion_time: 45.0, // Could be calculated from actual data
          favorite_exercise_type: favoriteType,
          improvement_areas: improvementAreas,
          daily_practice_streak: user.gamification.streak.current || 0
        };
      } catch (error) {
        console.error('Error fetching exercise stats:', error);
        throw new Error('Failed to fetch exercise stats');
      }
    }
  },
  
  Mutation: {
    // ===============================================
    // EXERCISE COMPLETION
    // ===============================================
    completeExercise: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const { lesson_id, exercise_type, vocabulary_focus, user_response, time_taken, is_correct, score } = input;
        
        const lesson = await Lesson.findById(lesson_id);
        if (!lesson) throw new Error('Lesson not found');
        
        // Create exercise record in personal bank
        const exerciseRecord = new PersonalExerciseBank({
          user_id: user._id,
          exercise_content: {}, // Will be filled by actual exercise content
          exercise_type,
          source_lesson_id: lesson_id,
          vocabulary_focus,
          lesson_context: {
            situation: lesson.lesson_context.situation,
            theme: lesson.unit_id.toString(), // Could be theme from unit
            difficulty: user.language_profile.current_level || 'beginner',
            user_level: user.language_profile.current_level || 'beginner'
          },
          performance: is_correct ? 'correct' : 'incorrect',
          time_taken,
          user_response,
          ai_generation_info: {
            model_used: 'claude-3-5-sonnet-20241022',
            generation_time: 0, // Was generated earlier
            prompt_version: '1.0',
            fallback_used: false
          }
        });
        
        await exerciseRecord.save();
        
        // Update vocabulary progress
        for (const vocabId of vocabulary_focus) {
          const quality = is_correct ? 4 : 2; // Simple quality mapping
          await updateVocabularyProgress(user._id, vocabId, exercise_type, is_correct, quality);
        }
        
        return await PersonalExerciseBank.findById(exerciseRecord._id)
          .populate('vocabulary_focus')
          .populate('source_lesson_id');
      } catch (error) {
        console.error('Error completing exercise:', error);
        throw new Error('Failed to complete exercise');
      }
    },
    
    practiceExercise: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const { exercise_id, user_response, time_taken, performance, context } = input;
        
        const exercise = await PersonalExerciseBank.findOne({
          _id: exercise_id,
          user_id: user._id
        });
        
        if (!exercise) throw new Error('Exercise not found');
        
        // Add practice session
        exercise.addPracticeSession(performance, time_taken, context);
        await exercise.save();
        
        return await PersonalExerciseBank.findById(exercise._id)
          .populate('vocabulary_focus')
          .populate('source_lesson_id');
      } catch (error) {
        console.error('Error practicing exercise:', error);
        throw new Error('Failed to practice exercise');
      }
    },
    
    completeLessonExercises: async (_, { lesson_id, exercises }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const lesson = await Lesson.findById(lesson_id)
          .populate('vocabulary_pool.vocabulary_id');
        
        if (!lesson) throw new Error('Lesson not found');
        
        const completedExercises = [];
        let totalTime = 0;
        let correctCount = 0;
        const vocabularyProgress = [];
        
        // Process each exercise
        for (const exerciseInput of exercises) {
          const result = await aiExercisesResolvers.Mutation.completeExercise(
            null, 
            { input: exerciseInput }, 
            { user }
          );
          
          completedExercises.push(result);
          totalTime += exerciseInput.time_taken;
          if (exerciseInput.is_correct) correctCount++;
        }
        
        const successRate = exercises.length > 0 ? (correctCount / exercises.length) * 100 : 0;
        const xpEarned = Math.round(lesson.xp_reward * (successRate / 100));
        
        // Award XP
        user.addXP(xpEarned);
        await user.save();
        
        // Get updated vocabulary progress
        const vocabularyIds = [...new Set(exercises.flatMap(e => e.vocabulary_focus))];
        for (const vocabId of vocabularyIds) {
          const progress = await UserVocabularyProgress.findOne({
            user_id: user._id,
            vocabulary_id: vocabId
          }).populate('vocabulary_id');
          
          if (progress) vocabularyProgress.push(progress);
        }
        
        return {
          lesson,
          completed_exercises: completedExercises,
          total_exercises: exercises.length,
          success_rate: successRate,
          total_time_taken: totalTime,
          xp_earned: xpEarned,
          new_vocabulary_progress: vocabularyProgress
        };
      } catch (error) {
        console.error('Error completing lesson exercises:', error);
        throw new Error('Failed to complete lesson exercises');
      }
    },
    
    flagExercise: async (_, { exercise_id, reason }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const exercise = await PersonalExerciseBank.findOne({
          _id: exercise_id,
          user_id: user._id
        });
        
        if (!exercise) throw new Error('Exercise not found');
        
        exercise.is_flagged = true;
        exercise.flag_reason = reason;
        await exercise.save();
        
        return true;
      } catch (error) {
        console.error('Error flagging exercise:', error);
        return false;
      }
    },
    
    deleteExercise: async (_, { exercise_id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const result = await PersonalExerciseBank.deleteOne({
          _id: exercise_id,
          user_id: user._id
        });
        
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Error deleting exercise:', error);
        return false;
      }
    }
  },
  
  // ===============================================
  // FIELD RESOLVERS
  // ===============================================
  GeneratedExercise: {
    created_at: (exercise) => exercise.created_at?.toISOString() || new Date().toISOString()
  },
  
  PersonalExerciseRecord: {
    vocabulary_focus: async (record) => {
      return await Vocabulary.find({ _id: { $in: record.vocabulary_focus } });
    },
    
    total_practices: (record) => record.total_practices,
    practice_success_rate: (record) => record.practice_success_rate,
    
    completed_at: (record) => record.completed_at?.toISOString(),
    created_at: (record) => record.createdAt?.toISOString(),
    
    practice_sessions: (record) => record.practice_sessions.map(session => ({
      practiced_at: session.practiced_at.toISOString(),
      performance: session.performance,
      time_taken: session.time_taken,
      context: session.context
    }))
  },
  
  ExerciseStats: {
    exercises_by_type: (stats) => stats.exercises_by_type
  }
};

// ===============================================
// AI EXERCISE GENERATION FUNCTIONS
// ===============================================

async function generateSingleExercise(exerciseType, vocabulary, lesson, userLevel) {
  try {
    // Get exercise template
    const template = await ExerciseTemplate.findOne({ 
      exercise_type: exerciseType,
      is_active: true 
    });
    
    if (!template) {
      console.log(`No template found for ${exerciseType}`);
      return null;
    }
    
    // Prepare variables for prompt
    const variables = {
      word: vocabulary.word,
      meaning: vocabulary.meaning,
      lesson_context: lesson.lesson_context.situation,
      user_level: userLevel,
      situation: lesson.lesson_context.situation,
      json_structure: JSON.stringify(template.prompt_template.expected_output_format)
    };
    
    const startTime = Date.now();
    
    // Generate with AI
    const exerciseContent = await generateWithAI(template, variables);
    
    const generationTime = (Date.now() - startTime) / 1000;
    
    // Handle audio generation for listening exercises
    let audioUrl = null;
    if (exerciseType === 'listening' && exerciseContent.audio_text) {
      audioUrl = await generateAudioUrl(exerciseContent.audio_text);
      console.log(`Generated audio URL: ${audioUrl}`);
    }
    
    return {
      id: new Date().getTime().toString(), // Temporary ID
      exercise_type: exerciseType,
      content: exerciseContent,
      audio_url: audioUrl,
      source_lesson_id: lesson._id,
      vocabulary_focus: [vocabulary._id],
      ai_generation_info: {
        model_used: 'claude-3-5-sonnet-20241022',
        generation_time: generationTime,
        prompt_version: '1.0',
        fallback_used: false,
        attempts_made: 1
      },
      lesson_context: {
        situation: lesson.lesson_context.situation,
        theme: lesson.unit_id.toString(),
        difficulty: userLevel,
        user_level: userLevel
      },
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error generating ${exerciseType}:`, error);
    return null;
  }
}

async function generateWithAI(template, variables) {
  try {
    const promptWithVars = template.getPromptWithVariables(variables);
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('No Anthropic API key, using fallback');
      return generateFallbackExercise(template, variables);
    }
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${promptWithVars.system_context}\n\n${promptWithVars.main_prompt}`
        }
      ]
    });
    
    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate response
      const validation = template.validateResponse(parsed);
      if (validation.isValid) {
        return parsed;
      } else {
        console.log('AI response validation failed:', validation.errors);
        return generateFallbackExercise(template, variables);
      }
    } else {
      console.log('No JSON found in AI response');
      return generateFallbackExercise(template, variables);
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return generateFallbackExercise(template, variables);
  }
}

function generateFallbackExercise(template, variables) {
  let fallback = JSON.parse(JSON.stringify(template.prompt_template.fallback_template));
  
  // Replace variables in fallback
  const replaceVariables = (obj) => {
    if (typeof obj === 'string') {
      let result = obj;
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      return result;
    } else if (Array.isArray(obj)) {
      return obj.map(replaceVariables);
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      Object.entries(obj).forEach(([key, value]) => {
        newObj[key] = replaceVariables(value);
      });
      return newObj;
    }
    return obj;
  };
  
  return replaceVariables(fallback);
}

// ===============================================
// GOOGLE TEXT-TO-SPEECH INTEGRATION
// ===============================================

async function generateAudioUrl(text, languageCode = 'en-US', speakingRate = 0.9) {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Google TTS not configured, skipping audio generation');
      return null;
    }

    console.log(`🎵 Generating audio for: "${text}"`);

    // Configure TTS request
    const request = {
      input: { text },
      voice: {
        languageCode,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    // Generate audio
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Create unique audio ID
    const audioId = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store audio in memory
    audioStorage.set(audioId, {
      buffer: response.audioContent,
      contentType: 'audio/mpeg',
      filename: `${audioId}.mp3`,
      createdAt: Date.now(),
      text: text
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:4001';
    const audioUrl = `${baseUrl}/audio/play/${audioId}`;
    
    console.log(`✅ Audio generated: ${audioUrl}`);
    return audioUrl;
  } catch (error) {
    console.error('TTS Error:', error.message);
    return null;
  }
}

// ===============================================
// AUDIO CLEANUP (Run every 30 minutes)
// ===============================================

setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [id, data] of audioStorage.entries()) {
    // Clean up audio older than 2 hours
    if (now - data.createdAt > 2 * 60 * 60 * 1000) {
      audioStorage.delete(id);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old audio files`);
  }
}, 30 * 60 * 1000); // Every 30 minutes

async function updateVocabularyProgress(userId, vocabularyId, exerciseType, isCorrect, quality) {
  try {
    let progress = await UserVocabularyProgress.findOne({
      user_id: userId,
      vocabulary_id: vocabularyId
    });
    
    if (!progress) {
      progress = new UserVocabularyProgress({
        user_id: userId,
        vocabulary_id: vocabularyId,
        first_learned_lesson: new Date() // Should be actual lesson ID
      });
    }
    
    progress.updateProgress(exerciseType, isCorrect, quality);
    await progress.save();
    
    return progress;
  } catch (error) {
    console.error('Error updating vocabulary progress:', error);
    throw error;
  }
}