// ===============================================
// CHALLENGE SYSTEM GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const challengeTypeDefs = `
  type ChallengeTest {
    id: ID!
    title: String!
    description: String
    type: String!
    target_id: ID!
    target_model: String!
    questions: [ChallengeQuestion!]!
    settings: ChallengeSettings!
    difficulty: String!
    xp_reward: Int!
    badge_reward: String
    is_active: Boolean!
    is_published: Boolean!
    total_attempts: Int!
    total_passes: Int!
    average_score: Float!
    pass_rate: Int!
    created_by: User!
    created_at: String!
    updated_at: String!
  }

  type ChallengeTarget {
    id: ID!
    title: String!
    level: String
  }

  type ChallengeQuestion {
    question_text: String!
    options: [String!]!
    correct_answer: Int!
    explanation: String
    difficulty: String!
    vocabulary_focus: [VocabularyWord!]
    skill_focus: [String!]!
  }

  type ChallengeSettings {
    total_questions: Int!
    pass_percentage: Int!
    must_correct_questions: [Int!]!
    time_limit: Int!
    allow_retry: Boolean!
    retry_delay_hours: Int!
    max_attempts: Int!
  }

  type ChallengeSession {
    id: ID!
    session_id: String!
    challenge_id: ID!
    user_id: ID!
    attempt_number: Int!
    time_limit: Int!
    time_remaining: Int!
    is_timeout: Boolean!
    status: String!
    started_at: String!
    user_level_at_attempt: String!
    user_xp_at_attempt: Int!
    total_questions: Int!
    questions: [ChallengeQuestion!]!
  }

  type ChallengeResult {
    id: ID!
    session_id: String!
    challenge_id: ID!
    user_id: ID!
    answers: [ChallengeAnswer!]!
    score: Int!
    percentage: Int!
    passed: Boolean!
    total_questions: Int!
    correct_answers: Int!
    incorrect_answers: Int!
    time_taken: Int!
    attempt_number: Int!
    can_retry_after: String
    xp_gained: Int!
    badge_earned: String
    status: String!
    started_at: String!
    completed_at: String
    difficulty_breakdown: DifficultyBreakdown!
    skill_breakdown: SkillBreakdown!
  }

  type ChallengeAnswer {
    question_index: Int!
    selected_answer: Int!
    is_correct: Boolean!
    time_taken: Int!
    answered_at: String!
  }

  type DifficultyBreakdown {
    beginner_correct: Int!
    beginner_total: Int!
    intermediate_correct: Int!
    intermediate_total: Int!
    advanced_correct: Int!
    advanced_total: Int!
  }

  type SkillBreakdown {
    vocabulary_correct: Int!
    vocabulary_total: Int!
    grammar_correct: Int!
    grammar_total: Int!
    listening_correct: Int!
    listening_total: Int!
    speaking_correct: Int!
    speaking_total: Int!
    reading_correct: Int!
    reading_total: Int!
    writing_correct: Int!
    writing_total: Int!
  }

  type ChallengeStats {
    total_attempts: Int!
    passed_attempts: Int!
    average_score: Float!
    best_score: Int!
    total_xp_gained: Int!
    badges_earned: [String!]!
  }

  # Input Types
  input CreateChallengeInput {
    title: String!
    description: String
    type: String!
    target_id: ID!
    target_model: String!
    questions: [ChallengeQuestionInput!]!
    settings: ChallengeSettingsInput!
    difficulty: String!
    xp_reward: Int
    badge_reward: String
  }

  input ChallengeQuestionInput {
    question_text: String!
    options: [String!]!
    correct_answer: Int!
    explanation: String
    difficulty: String
    vocabulary_focus: [ID!]
    skill_focus: [String!]
  }

  input ChallengeSettingsInput {
    total_questions: Int!
    pass_percentage: Int!
    must_correct_questions: [Int!]
    time_limit: Int!
    allow_retry: Boolean
    retry_delay_hours: Int
    max_attempts: Int
  }

  input ChallengeAnswerInput {
    question_index: Int!
    selected_answer: Int!
    time_taken: Int
  }

  input ChallengeFilters {
    type: String
    difficulty: String
    target_id: ID
  }

  extend type Query {
    # Get all challenge tests
    challengeTests(filters: ChallengeFilters): [ChallengeTest!]!
    
    # Get single challenge test
    challengeTest(id: ID!): ChallengeTest
    
    # Get challenge test by target
    challengeTestByTarget(targetId: ID!, type: String!): ChallengeTest
    
    # Get user's challenge attempts
    myChallengeAttempts(filters: ChallengeFilters): [ChallengeResult!]!
    
    # Get challenge results
    challengeResults(challengeId: ID!): [ChallengeResult!]!
    
    # Get best attempt for a challenge
    bestChallengeAttempt(challengeId: ID!): ChallengeResult
    
    # Get challenge statistics
    myChallengeStats: ChallengeStats!
    
    # Get active challenge session
    activeChallengeSession(challengeId: ID!): ChallengeSession
  }

  extend type Mutation {
    # Create challenge test (admin only)
    createChallengeTest(input: CreateChallengeInput!): ChallengeTest!
    
    # Update challenge test (admin only)
    updateChallengeTest(id: ID!, input: CreateChallengeInput!): ChallengeTest!
    
    # Delete challenge test (admin only)
    deleteChallengeTest(id: ID!): Boolean!
    
    # Publish challenge test (admin only)
    publishChallengeTest(id: ID!): ChallengeTest!
    
    # Start challenge attempt
    startChallengeAttempt(challengeId: ID!): ChallengeSession!
    
    # Submit challenge answers
    submitChallengeAnswers(
      sessionId: String!
      answers: [ChallengeAnswerInput!]!
      timeTaken: Int!
    ): ChallengeResult!
    
    # Abandon challenge attempt
    abandonChallengeAttempt(sessionId: String!): Boolean!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const challengeResolvers = {
  Query: {
    // Get all challenge tests
    challengeTests: async (parent, { filters = {} }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenges', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting challenge tests with filters:', filters);
        const challenges = await db.challengeTests.getAll(filters);
        return challenges;
      } catch (error) {
        console.error('❌ Error getting challenge tests:', error.message);
        throw new GraphQLError('Failed to fetch challenge tests');
      }
    },

    // Get single challenge test
    challengeTest: async (parent, { id }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenges', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting challenge test:', id);
        const challenge = await db.challengeTests.findById(id);
        if (!challenge) {
          throw new GraphQLError('Challenge test not found', {
            extensions: { code: 'CHALLENGE_NOT_FOUND' }
          });
        }
        return challenge;
      } catch (error) {
        console.error('❌ Error getting challenge test:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch challenge test');
      }
    },

    // Get challenge test by target
    challengeTestByTarget: async (parent, { targetId, type }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenges', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting challenge test by target:', targetId, type);
        const challenge = await db.challengeTests.getByTarget(targetId, type);
        return challenge;
      } catch (error) {
        console.error('❌ Error getting challenge test by target:', error.message);
        throw new GraphQLError('Failed to fetch challenge test');
      }
    },

    // Get user's challenge attempts
    myChallengeAttempts: async (parent, { filters = {} }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenge attempts', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting user challenge attempts for:', user.userId);
        const attempts = await db.userChallengeAttempts.getByUser(user.userId, filters);
        return attempts;
      } catch (error) {
        console.error('❌ Error getting user challenge attempts:', error.message);
        throw new GraphQLError('Failed to fetch challenge attempts');
      }
    },

    // Get challenge results
    challengeResults: async (parent, { challengeId }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenge results', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting challenge results for:', challengeId);
        const results = await db.userChallengeAttempts.getResults(user.userId, challengeId);
        return results;
      } catch (error) {
        console.error('❌ Error getting challenge results:', error.message);
        throw new GraphQLError('Failed to fetch challenge results');
      }
    },

    // Get best attempt for a challenge
    bestChallengeAttempt: async (parent, { challengeId }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenge attempts', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting best challenge attempt for:', challengeId);
        const bestAttempt = await db.userChallengeAttempts.getBestAttempt(user.userId, challengeId);
        return bestAttempt;
      } catch (error) {
        console.error('❌ Error getting best challenge attempt:', error.message);
        throw new GraphQLError('Failed to fetch best challenge attempt');
      }
    },

    // Get challenge statistics
    myChallengeStats: async (parent, args, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenge stats', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting challenge stats for user:', user.userId);
        const attempts = await db.userChallengeAttempts.getByUser(user.userId);
        
        const stats = {
          total_attempts: attempts.length,
          passed_attempts: attempts.filter(a => a.passed).length,
          average_score: attempts.length > 0 ? 
            Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length * 100) / 100 : 0,
          best_score: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
          total_xp_gained: attempts.reduce((sum, a) => sum + (a.xp_gained || 0), 0),
          badges_earned: [...new Set(attempts.filter(a => a.badge_earned).map(a => a.badge_earned))]
        };
        
        return stats;
      } catch (error) {
        console.error('❌ Error getting challenge stats:', error.message);
        throw new GraphQLError('Failed to fetch challenge stats');
      }
    },

    // Get active challenge session
    activeChallengeSession: async (parent, { challengeId }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access challenge sessions', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Getting active challenge session for:', challengeId);
        const session = await db.userChallengeAttempts.getActiveSession(user.userId, challengeId);
        return session;
      } catch (error) {
        console.error('❌ Error getting active challenge session:', error.message);
        throw new GraphQLError('Failed to fetch active challenge session');
      }
    }
  },

  Mutation: {
    // Create challenge test (admin only)
    createChallengeTest: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create challenge tests', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🏆 Creating new challenge test:', input.title);
        const challenge = await db.challengeTests.create(input, user.userId);
        return challenge;
      } catch (error) {
        console.error('❌ Error creating challenge test:', error.message);
        throw new GraphQLError('Failed to create challenge test');
      }
    },

    // Update challenge test (admin only)
    updateChallengeTest: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update challenge tests', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🏆 Updating challenge test:', id);
        const challenge = await db.challengeTests.update(id, input, user.userId);
        if (!challenge) {
          throw new GraphQLError('Challenge test not found', {
            extensions: { code: 'CHALLENGE_NOT_FOUND' }
          });
        }
        return challenge;
      } catch (error) {
        console.error('❌ Error updating challenge test:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update challenge test');
      }
    },

    // Delete challenge test (admin only)
    deleteChallengeTest: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete challenge tests', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting challenge test:', id);
        const deleted = await db.challengeTests.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting challenge test:', error.message);
        throw new GraphQLError('Failed to delete challenge test');
      }
    },

    // Publish challenge test (admin only)
    publishChallengeTest: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish challenge tests', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🏆 Publishing challenge test:', id);
        const challenge = await db.challengeTests.publish(id);
        if (!challenge) {
          throw new GraphQLError('Challenge test not found', {
            extensions: { code: 'CHALLENGE_NOT_FOUND' }
          });
        }
        return challenge;
      } catch (error) {
        console.error('❌ Error publishing challenge test:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish challenge test');
      }
    },

    // Start challenge attempt
    startChallengeAttempt: async (parent, { challengeId }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to start challenge attempts', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Starting challenge attempt for user:', user.userId);
        const session = await db.userChallengeAttempts.startAttempt(
          user.userId,
          challengeId,
          user.currentLevel,
          user.totalXP
        );
        return session;
      } catch (error) {
        console.error('❌ Error starting challenge attempt:', error.message);
        throw new GraphQLError(error.message);
      }
    },

    // Submit challenge answers
    submitChallengeAnswers: async (parent, { sessionId, answers, timeTaken }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to submit challenge answers', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Submitting challenge answers for session:', sessionId);
        const result = await db.userChallengeAttempts.submitAnswers(sessionId, answers, timeTaken);
        
        // Update user XP if passed
        if (result.passed && result.xp_gained > 0) {
          await db.users.updateProgress(user.userId, result.xp_gained);
        }
        
        return result;
      } catch (error) {
        console.error('❌ Error submitting challenge answers:', error.message);
        throw new GraphQLError(error.message);
      }
    },

    // Abandon challenge attempt
    abandonChallengeAttempt: async (parent, { sessionId }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to abandon challenge attempts', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🏆 Abandoning challenge attempt for session:', sessionId);
        // TODO: Implement abandon logic
        return true;
      } catch (error) {
        console.error('❌ Error abandoning challenge attempt:', error.message);
        throw new GraphQLError('Failed to abandon challenge attempt');
      }
    }
  }
}; 