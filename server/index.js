// ===============================================
// LINGUALEAP SERVER - SKILL-BASED ARCHITECTURE
// ===============================================

import { createYoga } from 'graphql-yoga';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { connectDB } from './config.js';
import { User } from './data/models/index.js';

// Import GraphQL modules
import { authTypeDefs, authResolvers } from './graphql/authentication.js';
import { coursesTypeDefs, coursesResolvers } from './graphql/courses.js';
import { aiExercisesTypeDefs, aiExercisesResolvers } from './graphql/ai_exercises.js';

// Import audio storage from ai_exercises
import { audioStorage } from './graphql/ai_exercises.js';

// ===============================================
// SERVER CONFIGURATION
// ===============================================

const PORT = process.env.PORT || 4001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================================
// AUTHENTICATION MIDDLEWARE
// ===============================================

const getUser = async (request) => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return null;
  }
};

// ===============================================
// GRAPHQL SCHEMA COMPOSITION
// ===============================================

const baseTypeDefs = `
  scalar JSON
  
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions
const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  coursesTypeDefs,
  aiExercisesTypeDefs
];

// Combine all resolvers
const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...coursesResolvers.Query,
    ...aiExercisesResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...coursesResolvers.Mutation,
    ...aiExercisesResolvers.Mutation
  },
  
  // Field resolvers
  ...coursesResolvers.Course && { Course: coursesResolvers.Course },
  ...coursesResolvers.Unit && { Unit: coursesResolvers.Unit },
  ...coursesResolvers.Lesson && { Lesson: coursesResolvers.Lesson },
  ...coursesResolvers.Vocabulary && { Vocabulary: coursesResolvers.Vocabulary },
  ...coursesResolvers.UserVocabularyProgress && { UserVocabularyProgress: coursesResolvers.UserVocabularyProgress },
  ...aiExercisesResolvers.GeneratedExercise && { GeneratedExercise: aiExercisesResolvers.GeneratedExercise },
  ...aiExercisesResolvers.PersonalExerciseRecord && { PersonalExerciseRecord: aiExercisesResolvers.PersonalExerciseRecord },
  ...aiExercisesResolvers.ExerciseStats && { ExerciseStats: aiExercisesResolvers.ExerciseStats }
};

// ===============================================
// GRAPHQL YOGA SETUP
// ===============================================

const yoga = createYoga({
  typeDefs,
  resolvers,
  context: async ({ request }) => {
    const user = await getUser(request);
    return {
      user,
      request
    };
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://lingualeap.vercel.app'],
    credentials: true
  },
  graphiql: {
    title: 'LinguaLeap GraphQL API',
    defaultQuery: `
# Welcome to LinguaLeap GraphQL API!
# Try these sample queries:

# 1. Get all courses
query GetCourses {
  courses {
    id
    title
    category
    skill_focus
    total_units
    is_premium
  }
}

# 2. Get vocabulary words
query GetVocabulary {
  vocabulary(limit: 10) {
    id
    word
    meaning
    difficulty
    theme_categories
    frequency_score
  }
}

# 3. Generate exercises for a lesson (requires auth)
# mutation GenerateExercises {
#   generateLessonExercises(input: {
#     lesson_id: "YOUR_LESSON_ID"
#   }) {
#     exercises {
#       exercise_type
#       content
#     }
#     total_generated
#     success_count
#   }
# }
    `
  }
});

// ===============================================
// ROUTES
// ===============================================

// Audio endpoints for TTS
app.get('/audio/play/:audioId', (req, res) => {
  const { audioId } = req.params;
  const audioData = audioStorage.get(audioId);
  
  if (!audioData) {
    return res.status(404).json({ error: 'Audio not found' });
  }
  
  res.set({
    'Content-Type': audioData.contentType,
    'Content-Length': audioData.buffer.length,
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.send(audioData.buffer);
});

app.get('/audio/download/:audioId', (req, res) => {
  const { audioId } = req.params;
  const audioData = audioStorage.get(audioId);
  
  if (!audioData) {
    return res.status(404).json({ error: 'Audio not found' });
  }
  
  res.set({
    'Content-Type': audioData.contentType,
    'Content-Disposition': `attachment; filename="${audioData.filename}"`,
    'Content-Length': audioData.buffer.length,
    'Access-Control-Allow-Origin': '*'
  });
  
  res.send(audioData.buffer);
});

app.get('/audio/list', (req, res) => {
  const audioList = Array.from(audioStorage.keys()).map(id => {
    const data = audioStorage.get(id);
    return {
      id,
      filename: data.filename,
      contentType: data.contentType,
      size: data.buffer.length,
      text: data.text,
      createdAt: new Date(data.createdAt).toISOString(),
      playUrl: `${req.protocol}://${req.get('host')}/audio/play/${id}`,
      downloadUrl: `${req.protocol}://${req.get('host')}/audio/download/${id}`
    };
  });
  
  res.json({ 
    total: audioList.length,
    audios: audioList 
  });
});

// Health check
app.get('/health', (req, res) => {
  const audioCount = audioStorage.size;
  const hasGoogleTTS = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasAnthropicAI = !!process.env.ANTHROPIC_API_KEY;
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-skill-based',
    services: {
      google_tts: hasGoogleTTS ? 'configured' : 'missing',
      anthropic_ai: hasAnthropicAI ? 'configured' : 'missing',
      audio_storage: `${audioCount} files in memory`
    },
    features: [
      'Skill-based courses',
      'AI exercise generation', 
      'Text-to-speech audio',
      'Spaced repetition',
      'Personal exercise bank',
      'Vocabulary progress tracking'
    ]
  });
});

// GraphQL endpoint
app.use('/graphql', yoga);

// API info
app.get('/', (req, res) => {
  res.json({
    message: 'LinguaLeap API - Skill-Based Architecture',
    version: '2.0.0',
    graphql: '/graphql',
    health: '/health',
    features: {
      courses: 'Skill-based course management',
      vocabulary: 'Centralized vocabulary system',
      ai_exercises: 'AI-powered exercise generation',
      progress: 'Spaced repetition & progress tracking',
      authentication: 'JWT-based user management'
    },
    documentation: 'Visit /graphql for GraphQL Playground'
  });
});

// ===============================================
// ERROR HANDLING
// ===============================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_routes: {
      'GraphQL API': '/graphql',
      'Health Check': '/health',
      'API Info': '/'
    }
  });
});

// ===============================================
// START SERVER
// ===============================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n🎉 =====================================');
      console.log('   LINGUALEAP SERVER V2.0 STARTED');
      console.log('🎉 =====================================');
      console.log(`🚀 Server ready at: http://localhost:${PORT}/`);
      console.log(`🩺 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 GraphQL API: http://localhost:${PORT}/graphql`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================\n');
      
      console.log('📝 New Features Available:');
      console.log('   ✅ Skill-based Course System');
      console.log('   ✅ AI Exercise Generation (Claude)');
      console.log('   ✅ Personal Exercise Bank');
      console.log('   ✅ Spaced Repetition Tracking');
      console.log('   ✅ Vocabulary Progress System');
      console.log('   ✅ Challenge Test System');
      console.log('=====================================\n');
      
      console.log('🔗 GraphQL Endpoints:');
      console.log('   📚 Courses: courses, courseUnits, unitLessons');
      console.log('   📖 Lessons: lesson, vocabulary, vocabularyWord');
      console.log('   🤖 AI Exercises: generateLessonExercises');
      console.log('   📊 Progress: myProgress, myVocabularyProgress');
      console.log('   🎮 Exercise Bank: myExerciseBank, exercisesForReview');
      console.log('   📈 Stats: myVocabularyStats, myExerciseStats');
      console.log('=====================================\n');

    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();