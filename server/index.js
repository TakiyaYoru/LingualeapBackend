// ===============================================
// LINGUALEAP BACKEND - MAIN SERVER ENTRY POINT
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
  `,
  resolvers: {
    Query: {
      hello: () => '🚀 LinguaLeap Backend is running!',
      health: () => '✅ Server is healthy and ready to learn English!',
      ...authResolvers.Query,
      ...courseResolvers.Query
    },
    Mutation: {
      _empty: () => 'This field is not used',
      ...authResolvers.Mutation
    }
  }
});

// Create GraphQL Yoga instance
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    console.log('📝 Request to:', request.url);

    // Get user from JWT token
    const user = await authUtils.getUserFromRequest(request, db);

    return {
      db: db,
      user: user,
      secret: request.headers.get("secret"),
    };
  },
  formatError: (error) => {
    console.error('❌ GraphQL Error:', error.message);

    if (process.env.NODE_ENV !== 'production') {
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: {
          code: error.extensions?.code,
          exception: {
            stacktrace: error.stack?.split('\n') || []
          }
        }
      };
    }

    return {
      message: error.message,
      locations: error.locations,
      path: error.path
    };
  }
});

// Create Express app
const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: '✅ LinguaLeap Backend is healthy!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Static files endpoint (for future file uploads)
app.get("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const pathDir = path.join(__dirname, "/uploads/" + filename);

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to database
connectDB().catch((error) => {
  console.error('❌ Failed to connect to database:', error.message);
  process.exit(1);
});

// Export the Express app as a handler
export default app;