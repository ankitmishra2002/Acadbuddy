import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
// Direct connection string (no .env). Database name included.
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;