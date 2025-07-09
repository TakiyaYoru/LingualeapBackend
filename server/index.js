// ===============================================
// LINGUALEAP BACKEND - MAIN SERVER ENTRY POINT
// Updated to include Vocabulary System
// ===============================================

import express from 'express';
import { createYoga, createSchema } from 'graphql-yoga';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configurations
import { connectDB, db } from './config.js';
import { authTypeDefs, authResolvers } from './graphql/authentication.js';
import { courseTypeDefs, courseResolvers } from './graphql/courses.js';
import { vocabularyTypeDefs, vocabularyResolvers } from './graphql/vocabulary.js'; // ← NEW
import { authUtils } from './utils/auth.js';

// Create GraphQL schema
const schema = createSchema({
  typeDefs: `
    type Query {
      hello: String!
      health: String!
    }
    
    type Mutation {
      _empty: String
    }
    
    ${authTypeDefs}
    ${courseTypeDefs}
    ${vocabularyTypeDefs}
  `,
  resolvers: {
    Query: {
      hello: () => '🚀 LinguaLeap Backend is running!',
      health: () => '✅ Server is healthy and ready to learn English!',
      ...authResolvers.Query,
      ...courseResolvers.Query,
      ...vocabularyResolvers.Query, // ← NEW
    },
    Mutation: {
      ...authResolvers.Mutation,
      ...courseResolvers.Mutation,
      ...vocabularyResolvers.Mutation, // ← NEW
    },
  },
});

// Create Yoga GraphQL server
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    try {
      // Extract user from JWT token - FIXED with db parameter
      const user = await authUtils.getUserFromRequest(request, db); // ← FIXED
      
      return {
        db,
        user,
        request,
      };
    } catch (error) {
      console.error('❌ Context creation error:', error.message);
      return {
        db,
        user: null,
        request,
      };
    }
  },
});

// Create Express app
const app = express();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: '✅ LinguaLeap Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: [
      'Authentication System',
      'Course Management', 
      'Vocabulary System', // ← NEW
      'GraphQL API'
    ]
  });
});

// Static files endpoint (for future file uploads)
app.get("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const pathDir = path.join(__dirname, "/uploads/" + filename);
  
  // Check if file exists
  if (!fs.existsSync(pathDir)) {
    return res.status(404).json({
      error: 'File not found',
      filename: filename
    });
  }
  
  res.sendFile(pathDir);
});

// GraphQL endpoint
app.use(yoga.graphqlEndpoint, yoga);

// Port configuration
const PORT = process.env.PORT || 4000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n🎉 =====================================');
      console.log('   LINGUALEAP BACKEND SERVER STARTED');
      console.log('🎉 =====================================');
      console.log(`🚀 Server ready at: http://localhost:${PORT}/`);
      console.log(`🩺 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================\n');
      
      console.log('📝 Available Features:');
      console.log('   ✅ Authentication (login, register, me)');
      console.log('   ✅ Course Management (courses, units, lessons)');
      console.log('   ✅ Vocabulary System (CRUD, filters, stats)'); // ← NEW
      console.log('   ✅ GraphQL API with JWT authentication');
      console.log('=====================================\n');
      
      console.log('🔗 GraphQL Endpoints:');
      console.log('   📚 Vocabulary: myVocabulary, addVocabularyWord, toggleVocabularyLearned');
      console.log('   📊 Stats: myVocabularyStats, myVocabularyCategories');
      console.log('   🔄 Review: wordsForReview, recordVocabularyReview');
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();