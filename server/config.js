// ===============================================
// DATABASE CONFIGURATION
// ===============================================

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { db } from './data/mongoRepo.js';

// Load environment variables
config();

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('📂 Database Name:', conn.connection.name);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export { connectDB, db };