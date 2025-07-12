// ===============================================
// VOCABULARY GRAPHQL RESOLVERS - LINGUALEAP
// Following same pattern as authentication.js and courses.js
// ===============================================

import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS (following authentication.js pattern)
// ===============================================

export const vocabularyTypeDefs = `
  # Vocabulary Word Type
  type VocabularyWord {
    id: ID!
    userId: ID!
    word: String!
    meaning: String!
    pronunciation: String
    example: String
    difficulty: String!
    frequency_score: Int!
    definitions: [VocabularyDefinition!]!
    isLearned: Boolean!
    createdAt: String!
    learnedAt: String
    category: String!
    tags: [String!]!
    reviewCount: Int!
    correctAnswers: Int!
    totalAttempts: Int!
    lastReviewed: String
    nextReviewDate: String
    source: String!
    sourceReference: String
    lessonId: ID
    unitId: ID
    courseId: ID
    audioUrl: String
    imageUrl: String
    isActive: Boolean!
    daysSinceCreated: Int
    daysSinceLearned: Int
    successRate: Int
    isDueForReview: Boolean
  }

  type VocabularyDefinition {
    context: String!
    meaning: String!
    example: String
  }

  # Vocabulary Statistics
  type VocabularyStats {
    totalWords: Int!
    learnedWords: Int!
    totalAttempts: Int!
    correctAnswers: Int!
    averageFrequency: Float!
  }

  # Input Types (following RegisterInput pattern)
  input VocabularyInput {
    word: String!
    meaning: String!
    pronunciation: String
    example: String
    difficulty: String
    frequency_score: Int
    definitions: [VocabularyDefinitionInput!]
    category: String
    tags: [String!]
    source: String
    sourceReference: String
    lessonId: ID
    unitId: ID
    courseId: ID
    audioUrl: String
    imageUrl: String
  }

  input VocabularyDefinitionInput {
    context: String!
    meaning: String!
    example: String
  }

  input VocabularyUpdateInput {
    word: String
    meaning: String
    pronunciation: String
    example: String
    difficulty: String
    frequency_score: Int
    definitions: [VocabularyDefinitionInput!]
    category: String
    tags: [String!]
    isLearned: Boolean
    audioUrl: String
    imageUrl: String
  }

  input VocabularyFilterInput {
    isLearned: Boolean
    category: String
    difficulty: String
    search: String
    sortBy: String
    limit: Int
  }

  # Bulk Operations Results
  type BulkVocabularyResult {
    succeeded: Int!
    failed: Int!
    words: [VocabularyWord!]!
  }

  type VocabularyClearResult {
    deletedCount: Int!
  }

  extend type Query {
    # Get user's vocabulary words with filters
    myVocabulary(filters: VocabularyFilterInput): [VocabularyWord!]!
    
    # Get single vocabulary word
    vocabularyWord(id: ID!): VocabularyWord
    
    # Get user's vocabulary statistics
    myVocabularyStats: VocabularyStats!
    
    # Get user's vocabulary categories
    myVocabularyCategories: [String!]!
    
    # Get words due for review (spaced repetition)
    wordsForReview(limit: Int): [VocabularyWord!]!
  }

  extend type Mutation {
    # Add new vocabulary word
    addVocabularyWord(input: VocabularyInput!): VocabularyWord!
    
    # Update vocabulary word
    updateVocabularyWord(id: ID!, input: VocabularyUpdateInput!): VocabularyWord!
    
    # Toggle learned status
    toggleVocabularyLearned(id: ID!): VocabularyWord!
    
    # Delete vocabulary word
    deleteVocabularyWord(id: ID!): Boolean!
    
    # Clear all vocabulary
    clearAllVocabulary: VocabularyClearResult!
    
    # Record vocabulary review (for spaced repetition)
    recordVocabularyReview(id: ID!, isCorrect: Boolean!): VocabularyWord!
  }
`;

// ===============================================
// RESOLVERS (following authentication.js pattern)
// ===============================================

export const vocabularyResolvers = {
  Query: {

    myVocabulary: async (parent, { filters = {} }, { db, user }) => {
        if (!user) {
            throw new GraphQLError('You must be logged in to access vocabulary', {
            extensions: { code: 'UNAUTHENTICATED' }
            });
        }

        try {
            console.log('📚 Fetching vocabulary for user:', user.userId, 'with filters:', filters);
            const words = await db.vocabulary.findByUser(user.userId, filters);
            
            // Fix ID mapping
            return words.map(word => ({
            ...word,
            id: word._id.toString() // ← ADD THIS LINE
            }));
        } catch (error) {
            console.error('❌ Error fetching vocabulary:', error.message);
            throw new GraphQLError('Failed to fetch vocabulary words');
        }
        },
    vocabularyWord: async (parent, { id }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const word = await db.vocabulary.findById(id, user.userId);
        if (!word) {
          throw new GraphQLError('Vocabulary word not found', {
            extensions: { code: 'VOCABULARY_NOT_FOUND' }
          });
        }
        return word;
      } catch (error) {
        console.error('❌ Error fetching vocabulary word:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch vocabulary word');
      }
    },

    myVocabularyStats: async (parent, args, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access vocabulary stats', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('📊 Fetching vocabulary stats for user:', user.userId);
        return await db.vocabulary.getUserStats(user.userId);
      } catch (error) {
        console.error('❌ Error fetching vocabulary stats:', error.message);
        throw new GraphQLError('Failed to fetch vocabulary statistics');
      }
    },

    myVocabularyCategories: async (parent, args, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access vocabulary categories', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        return await db.vocabulary.getUserCategories(user.userId);
      } catch (error) {
        console.error('❌ Error fetching vocabulary categories:', error.message);
        throw new GraphQLError('Failed to fetch vocabulary categories');
      }
    },

    wordsForReview: async (parent, { limit = 10 }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access review words', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🔄 Fetching words for review for user:', user.userId);
        return await db.vocabulary.getWordsForReview(user.userId, limit);
      } catch (error) {
        console.error('❌ Error fetching review words:', error.message);
        throw new GraphQLError('Failed to fetch words for review');
      }
    },
  },

  Mutation: {
    addVocabularyWord: async (parent, { input }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to add vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('📝 Adding vocabulary word:', input.word, 'for user:', user.userId);
        
        // Validate input (following authentication.js pattern)
        if (!input.word || input.word.trim().length < 1) {
          throw new GraphQLError('Word is required', {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }
        
        if (!input.meaning || input.meaning.trim().length < 1) {
          throw new GraphQLError('Meaning is required', {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }
        
        const vocabularyData = {
          ...input,
          userId: user.userId,
          category: input.category || 'general',
          difficulty: input.difficulty || "easy",
          tags: input.tags || [],
          source: input.source || 'manual',
          createdBy: user.userId
        };

        const newWord = await db.vocabulary.create(vocabularyData);
        
        console.log('✅ Vocabulary word added successfully:', newWord.word);
        return newWord;
      } catch (error) {
        console.error('❌ Error adding vocabulary word:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        if (error.message.includes('already exists')) {
          throw new GraphQLError('This word already exists in your vocabulary', {
            extensions: { code: 'DUPLICATE_WORD' }
          });
        }
        
        throw new GraphQLError('Failed to add vocabulary word');
      }
    },

    updateVocabularyWord: async (parent, { id, input }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to update vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('✏️ Updating vocabulary word:', id, 'for user:', user.userId);
        
        const updatedWord = await db.vocabulary.update(id, user.userId, input);
        
        console.log('✅ Vocabulary word updated successfully:', updatedWord.word);
        return updatedWord;
      } catch (error) {
        console.error('❌ Error updating vocabulary word:', error.message);
        
        if (error.message.includes('not found')) {
          throw new GraphQLError('Vocabulary word not found', {
            extensions: { code: 'VOCABULARY_NOT_FOUND' }
          });
        }
        
        throw new GraphQLError('Failed to update vocabulary word');
      }
    },

    toggleVocabularyLearned: async (parent, { id }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to update vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🔄 Toggling learned status for vocabulary:', id, 'user:', user.userId);
        
        const updatedWord = await db.vocabulary.toggleLearned(id, user.userId);
        
        console.log('✅ Vocabulary learned status toggled:', updatedWord.word, '→', updatedWord.isLearned);
        return updatedWord;
      } catch (error) {
        console.error('❌ Error toggling vocabulary learned status:', error.message);
        
        if (error.message.includes('not found')) {
          throw new GraphQLError('Vocabulary word not found', {
            extensions: { code: 'VOCABULARY_NOT_FOUND' }
          });
        }
        
        throw new GraphQLError('Failed to update vocabulary word');
      }
    },

    deleteVocabularyWord: async (parent, { id }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to delete vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🗑️ Deleting vocabulary word:', id, 'for user:', user.userId);
        
        const deletedWord = await db.vocabulary.delete(id, user.userId);
        
        console.log('✅ Vocabulary word deleted successfully:', deletedWord.word);
        return true;
      } catch (error) {
        console.error('❌ Error deleting vocabulary word:', error.message);
        
        if (error.message.includes('not found')) {
          throw new GraphQLError('Vocabulary word not found', {
            extensions: { code: 'VOCABULARY_NOT_FOUND' }
          });
        }
        
        throw new GraphQLError('Failed to delete vocabulary word');
      }
    },

    clearAllVocabulary: async (parent, args, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to clear vocabulary', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('🧹 Clearing all vocabulary for user:', user.userId);
        
        const result = await db.vocabulary.clearAll(user.userId);
        
        console.log('✅ All vocabulary cleared:', result.deletedCount, 'words');
        return result;
      } catch (error) {
        console.error('❌ Error clearing vocabulary:', error.message);
        throw new GraphQLError('Failed to clear vocabulary');
      }
    },

    recordVocabularyReview: async (parent, { id, isCorrect }, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to record vocabulary review', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('📝 Recording vocabulary review:', id, 'correct:', isCorrect, 'for user:', user.userId);
        
        // Find the vocabulary word
        const vocabulary = await db.vocabulary.findById(id, user.userId);
        if (!vocabulary) {
          throw new GraphQLError('Vocabulary word not found', {
            extensions: { code: 'VOCABULARY_NOT_FOUND' }
          });
        }

        // Update review data
        const updateData = {
          totalAttempts: vocabulary.totalAttempts + 1,
          correctAnswers: vocabulary.correctAnswers + (isCorrect ? 1 : 0),
          lastReviewed: new Date().toISOString(),
          reviewCount: vocabulary.reviewCount + 1
        };

        // Simple spaced repetition logic
        if (isCorrect) {
          const intervals = [1, 3, 7, 14, 30]; // days
          const intervalIndex = Math.min(vocabulary.reviewCount, intervals.length - 1);
          const nextInterval = intervals[intervalIndex];
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
          updateData.nextReviewDate = nextReviewDate.toISOString();
        }

        const updatedWord = await db.vocabulary.update(id, user.userId, updateData);
        
        console.log('✅ Vocabulary review recorded:', updatedWord.word);
        return updatedWord;
      } catch (error) {
        console.error('❌ Error recording vocabulary review:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Failed to record vocabulary review');
      }
    },
  },
};