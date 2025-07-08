// ===============================================
// AUTHENTICATION GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const authTypeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String!
    avatar: String
    currentLevel: String!
    totalXP: Int!
    hearts: Int!
    currentStreak: Int!
    longestStreak: Int!
    subscriptionType: String!
    isPremium: Boolean!
    dailyGoal: Int!
    isEmailVerified: Boolean!
    isActive: Boolean!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    displayName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    # Get current user profile
    me: User
  }

  extend type Mutation {
    # Register new user
    register(input: RegisterInput!): AuthPayload!
    
    # Login user
    login(input: LoginInput!): AuthPayload!
  }
`;

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const validateRegisterInput = (input) => {
  const errors = [];
  
  // Username validation
  if (!input.username || input.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (input.username && input.username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Password validation
  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Display name validation
  if (!input.displayName || input.displayName.trim().length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }
  
  return errors;
};

// ===============================================
// RESOLVERS
// ===============================================

export const authResolvers = {
  Query: {
    me: async (parent, args, { db, user }) => {
      // Check if user is authenticated
      if (!user) {
        throw new GraphQLError('You must be logged in to access this resource', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      try {
        const currentUser = await db.users.findById(user.userId);
        
        if (!currentUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }
        
        return currentUser;
      } catch (error) {
        console.error('❌ Error in me query:', error.message);
        throw new GraphQLError('Failed to fetch user profile');
      }
    }
  },

  Mutation: {
    register: async (parent, { input }, { db }) => {
      try {
        console.log('📝 Register attempt for:', input.email);
        
        // Validate input
        const validationErrors = validateRegisterInput(input);
        if (validationErrors.length > 0) {
          throw new GraphQLError(`Validation failed: ${validationErrors.join(', ')}`, {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }

        // Check if user already exists
        const existingUserByEmail = await db.users.findByEmail(input.email);
        if (existingUserByEmail) {
          throw new GraphQLError('User with this email already exists', {
            extensions: { code: 'EMAIL_ALREADY_EXISTS' }
          });
        }

        const existingUserByUsername = await db.users.findByUsername(input.username);
        if (existingUserByUsername) {
          throw new GraphQLError('Username is already taken', {
            extensions: { code: 'USERNAME_ALREADY_EXISTS' }
          });
        }

        // Create new user
        const newUser = await db.users.create({
          username: input.username.trim(),
          email: input.email.toLowerCase().trim(),
          password: input.password,
          displayName: input.displayName.trim()
        });

        // Generate JWT token
        const token = generateToken(newUser.id);

        console.log('✅ User registered successfully:', newUser.id);

        return {
          token,
          user: newUser
        };
      } catch (error) {
        console.error('❌ Registration error:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          throw new GraphQLError(`${field} is already taken`, {
            extensions: { code: 'DUPLICATE_KEY' }
          });
        }
        
        throw new GraphQLError('Registration failed. Please try again.');
      }
    },

    login: async (parent, { input }, { db }) => {
      try {
        console.log('📝 Login attempt for:', input.email);
        
        // Find user by email
        const user = await db.users.findByEmail(input.email);
        if (!user) {
          throw new GraphQLError('Invalid email or password', {
            extensions: { code: 'INVALID_CREDENTIALS' }
          });
        }

        // Check if account is active
        if (!user.isActive) {
          throw new GraphQLError('Your account has been deactivated', {
            extensions: { code: 'ACCOUNT_DEACTIVATED' }
          });
        }

        // Verify password
        const isValidPassword = await db.users.verifyPassword(input.password, user.password);
        if (!isValidPassword) {
          throw new GraphQLError('Invalid email or password', {
            extensions: { code: 'INVALID_CREDENTIALS' }
          });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Remove password from response
        const { password, ...userWithoutPassword } = user.toObject();

        console.log('✅ User logged in successfully:', user._id);

        return {
          token,
          user: userWithoutPassword
        };
      } catch (error) {
        console.error('❌ Login error:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Login failed. Please try again.');
      }
    }
  }
};