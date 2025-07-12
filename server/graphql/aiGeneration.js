// ===============================================
// AI GENERATION GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';
import path from 'path';
import AIService from '../utils/aiService.js';
import TTSService from '../utils/ttsService.js';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const aiGenerationTypeDefs = `
  type GeneratedExercise {
    type: String!
    content: String! # JSON string
    vocabulary: VocabularyInfo
    sortOrder: Int!
    audioUrl: String
  }

  type VocabularyInfo {
    word: String!
    meaning: String!
    pronunciation: String
  }

  type ExerciseGenerationResult {
    lessonId: ID!
    exercises: [GeneratedExercise!]!
    totalGenerated: Int!
    audioGenerated: Int!
    generationTime: Float!
  }

  type AudioGenerationResult {
    exerciseId: ID
    audioUrl: String!
    text: String!
    filePath: String!
  }

  input ExerciseGenerationInput {
    lessonId: ID!
    userLevel: String
    vocabularyList: [VocabularyInput!]
    exerciseTypes: [String!]
    totalExercises: Int
  }

  input VocabularyInput {
    word: String!
    meaning: String!
    pronunciation: String
  }

  input AudioGenerationInput {
    text: String!
    language: String
    voiceName: String
    speakingRate: Float
    pitch: Float
  }

  extend type Query {
    # Generate exercises for a lesson
    generateLessonExercises(input: ExerciseGenerationInput!): ExerciseGenerationResult!
    
    # Generate single exercise
    generateExercise(type: String!, context: String!): GeneratedExercise!
    
    # Get available voices for TTS
    getAvailableVoices(languageCode: String): [String!]!
  }

  extend type Mutation {
    # Generate audio for text
    generateAudio(input: AudioGenerationInput!): AudioGenerationResult!
    
    # Generate audio for exercise
    generateExerciseAudio(exerciseId: ID!, exerciseType: String!, content: String!): AudioGenerationResult!
    
    # Batch generate audio for multiple exercises
    generateBatchAudio(exerciseIds: [ID!]!): [AudioGenerationResult!]!
    
    # Clean up old audio files
    cleanupAudioFiles(daysOld: Int): Boolean!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const aiGenerationResolvers = {
  Query: {
    // Generate exercises for a lesson
    generateLessonExercises: async (parent, { input }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to generate exercises', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🤖 Generating exercises for lesson:', input.lessonId);
        const startTime = Date.now();

        // Get lesson
        const lesson = await db.lessons.findById(input.lessonId);
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Use provided vocabulary list or get from lesson
        let vocabularyList = input.vocabularyList || [];
        if (vocabularyList.length === 0 && lesson.vocabulary_pool) {
          // TODO: Populate vocabulary from vocabulary_pool
          vocabularyList = lesson.vocabulary || [];
        }

        if (vocabularyList.length === 0) {
          throw new GraphQLError('No vocabulary available for exercise generation', {
            extensions: { code: 'NO_VOCABULARY' }
          });
        }

        // Generate exercises using AI
        const userLevel = input.userLevel || user.currentLevel || 'A1';
        const generatedExercises = await AIService.generateLessonExercises(
          lesson,
          vocabularyList,
          userLevel
        );

        // Generate audio for exercises that need it
        let audioGenerated = 0;
        for (const exercise of generatedExercises) {
          if (['listening', 'listen_choose', 'speak_repeat'].includes(exercise.type)) {
            try {
              const audioResult = await TTSService.generateExerciseAudio(
                exercise.type,
                exercise.content
              );
              if (audioResult) {
                exercise.audioUrl = audioResult.audioUrl;
                audioGenerated++;
              }
            } catch (audioError) {
              console.warn('⚠️ Failed to generate audio for exercise:', audioError.message);
            }
          }
        }

        const generationTime = (Date.now() - startTime) / 1000;

        console.log(`✅ Generated ${generatedExercises.length} exercises in ${generationTime}s`);

        return {
          lessonId: input.lessonId,
          exercises: generatedExercises,
          totalGenerated: generatedExercises.length,
          audioGenerated,
          generationTime
        };

      } catch (error) {
        console.error('❌ Error generating lesson exercises:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to generate exercises');
      }
    },

    // Generate single exercise
    generateExercise: async (parent, { type, context }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to generate exercises', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🤖 Generating single exercise:', type);

        const userLevel = user.currentLevel || 'A1';
        const exerciseContent = await AIService.generateExercise(type, {
          word: context.word || '',
          meaning: context.meaning || '',
          lesson_context: context.lesson_context || '',
          situation: context.situation || 'general',
          user_level: userLevel
        });

        return {
          type,
          content: JSON.stringify(exerciseContent),
          vocabulary: context.vocabulary || null,
          sortOrder: 1,
          audioUrl: null
        };

      } catch (error) {
        console.error('❌ Error generating single exercise:', error.message);
        throw new GraphQLError('Failed to generate exercise');
      }
    },

    // Get available voices for TTS
    getAvailableVoices: async (parent, { languageCode }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to get voices', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const voices = await TTSService.getAvailableVoices(languageCode);
        return voices.map(voice => voice.name);

      } catch (error) {
        console.error('❌ Error getting available voices:', error.message);
        return [];
      }
    }
  },

  Mutation: {
    // Generate audio for text
    generateAudio: async (parent, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to generate audio', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🔊 Generating audio for text');

        // Validate text
        const validation = TTSService.validateText(input.text);
        if (!validation.valid) {
          throw new GraphQLError(validation.error, {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }

        const audioResult = await TTSService.generateAudioFile(
          input.text,
          `custom_${Date.now()}.mp3`,
          {
            language: input.language || 'en-US',
            voiceName: input.voiceName,
            speakingRate: input.speakingRate,
            pitch: input.pitch
          }
        );

        return {
          exerciseId: null,
          audioUrl: `/uploads/audio/${path.basename(audioResult)}`,
          text: input.text,
          filePath: audioResult
        };

      } catch (error) {
        console.error('❌ Error generating audio:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to generate audio');
      }
    },

    // Generate audio for exercise
    generateExerciseAudio: async (parent, { exerciseId, exerciseType, content }, { user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to generate exercise audio', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🔊 Generating audio for exercise:', exerciseId);

        const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
        const audioResult = await TTSService.generateExerciseAudio(exerciseType, contentObj);

        if (!audioResult) {
          throw new GraphQLError('Failed to generate audio for exercise', {
            extensions: { code: 'AUDIO_GENERATION_FAILED' }
          });
        }

        return {
          exerciseId,
          audioUrl: audioResult.audioUrl,
          text: audioResult.text,
          filePath: audioResult.filePath
        };

      } catch (error) {
        console.error('❌ Error generating exercise audio:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to generate exercise audio');
      }
    },

    // Batch generate audio for multiple exercises
    generateBatchAudio: async (parent, { exerciseIds }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to generate batch audio', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🔊 Generating batch audio for', exerciseIds.length, 'exercises');

        const results = [];
        
        for (const exerciseId of exerciseIds) {
          try {
            const exercise = await db.exercises.findById(exerciseId);
            if (!exercise) continue;

            const contentObj = typeof exercise.content === 'string' ? 
              JSON.parse(exercise.content) : exercise.content;

            const audioResult = await TTSService.generateExerciseAudio(
              exercise.type,
              contentObj
            );

            if (audioResult) {
              results.push({
                exerciseId,
                audioUrl: audioResult.audioUrl,
                text: audioResult.text,
                filePath: audioResult.filePath
              });
            }
          } catch (exerciseError) {
            console.warn('⚠️ Failed to generate audio for exercise:', exerciseId, exerciseError.message);
          }
        }

        console.log(`✅ Generated audio for ${results.length} exercises`);
        return results;

      } catch (error) {
        console.error('❌ Error generating batch audio:', error.message);
        throw new GraphQLError('Failed to generate batch audio');
      }
    },

    // Clean up old audio files
    cleanupAudioFiles: async (parent, { daysOld = 7 }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'UNAUTHORIZED' }
        });
      }

      try {
        console.log('🧹 Cleaning up old audio files');
        await TTSService.cleanupOldFiles(daysOld);
        return true;

      } catch (error) {
        console.error('❌ Error cleaning up audio files:', error.message);
        throw new GraphQLError('Failed to cleanup audio files');
      }
    }
  }
}; 