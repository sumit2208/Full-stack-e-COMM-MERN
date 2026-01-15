// db.js
import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log('MongoDB connected via Mongoose');
  } catch (error) {
    console.error('DB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;   