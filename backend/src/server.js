import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import axios from 'axios';
import multer from 'multer';
import rateLimit from "express-rate-limit";

// Import Routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
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
import smartStudiesRoutes from './routes/smartStudies.route.js';

// Import Database Connection
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Trust the first hop (Render / Vercel / any reverse proxy) for correct client IPs and rate limiting
app.set('trust proxy', 1);

// Origin whitelist for CORS (FRONTEND_URL, CLIENT_URL, or comma-separated FRONTEND_URLS)
const rawOriginEnv = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URLS,
]
    .filter(Boolean)
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean);

const allowedOrigins = [
    ...new Set([
        ...rawOriginEnv.map((url) => url.replace(/\/$/, '')),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]),
];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Normalize origin by removing trailing slash
        const normalizedOrigin = origin.replace(/\/$/, '');

        if (allowedOrigins.includes(normalizedOrigin) || /\.vercel\.app$/i.test(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(' Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file in the backend directory.');
    process.exit(1);
}

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 70,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later." },
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smart-studies', smartStudiesRoutes);

// Default Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the backend server!" });
});

// Home Route
app.get("/home", (req, res) => {
    res.status(200).json({ message: "Welcome to the home route!" });
});

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: 'Acad Buddy backend is healthy!' });
});

// AI API key test endpoint with detailed diagnostics
app.get('/api/test-ai-key', async (req, res) => {
    try {
        const { testAPIKey } = await import('./services/aiOrchestrator.js');
        const result = await testAPIKey();

        // Log diagnostics for debugging
        if (!result.valid && result.diagnostics) {
            console.log('\n API Key Diagnostics:');
            console.log(`   Length: ${result.diagnostics.keyLength} characters`);
            console.log(`   Starts with: ${result.diagnostics.keyPrefix}...`);
            console.log(`   Ends with: ...${result.diagnostics.keySuffix}`);
            console.log(`   Has spaces: ${result.diagnostics.hasSpaces}`);
            console.log(`   Has quotes: ${result.diagnostics.hasQuotes}`);
            console.log(`   Valid prefix: ${result.diagnostics.startsWithCorrectPrefix}`);
            if (result.statusCode) {
                console.log(`   HTTP Status: ${result.statusCode}`);
            }
            if (result.detailedError) {
                console.log(`   API Error: ${result.detailedError}`);
            }
            console.log('');
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            valid: false,
            error: error.message,
            diagnostics: { error: 'Failed to test API key' }
        });
    }
});


// Multer error handling (file type / size rejections)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({
            error: 'File upload error',
            message: err.message || err.code,
        });
    }
    next(err);
});

// Generic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});