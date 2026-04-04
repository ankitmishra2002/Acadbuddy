import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import rateLimit from "express-rate-limit";

// Import Routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/users.route.js';
import subjectRoutes from './routes/subjects.route.js';
import contextRoutes from './routes/context.route.js';
import styleRoutes from './routes/styles.route.js';
import contentRoutes from './routes/content.route.js';
import examRoutes from './routes/exam.route.js';
import quizRoutes from './routes/quiz.route.js';
import sessionRoutes from './routes/sessions.route.js';
import communityRoutes from './routes/community.route.js';
import cloudinaryRoutes from './routes/cloudinary.route.js';
import adminRoutes from './routes/admin.route.js';

// Import Database Connection
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Origin whitelist for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean).map(url => url.replace(/\/$/, '')); // Remove trailing slashes

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin) || /\.vercel\.app$/.test(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for origin: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Middleware
//app.use(express.json());

// Default Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the backend server!" });
}); 

// Home Route
app.get("/home", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});