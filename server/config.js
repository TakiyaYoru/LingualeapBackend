// ===============================================
// DATABASE CONFIG - LINGUALEAP
// ===============================================

import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// ===============================================
// DATABASE CONNECTION
// ===============================================

export const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Log specific connection issues
    if (error.message.includes('authentication')) {
      console.error('🔑 Check your MongoDB username/password');
    } else if (error.message.includes('network')) {
      console.error('🌐 Check your network connection and MongoDB URI');
    } else if (error.message.includes('timeout')) {
      console.error('⏰ Connection timeout - check if MongoDB is running');
    }
    
    process.exit(1);
  }
};

// ===============================================
// CONNECTION EVENT HANDLERS
// ===============================================

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

// ===============================================
// DATABASE UTILITIES
// ===============================================

export const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[state] || 'unknown',
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    collections: Object.keys(mongoose.connection.collections)
  };
};

export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// ===============================================
// EXPORT DEFAULT
// ===============================================

export default {
  connectDB,
  getDBStatus,
  isConnected,
  mongoose
};