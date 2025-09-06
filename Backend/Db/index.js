import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  try {
    await mongoose.connect(`${uri}/${DB_NAME}`);
    console.log('Mongoose connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
