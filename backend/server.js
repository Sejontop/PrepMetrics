/**
 * PrepMetrics – Express Server Entry Point
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/subjects',    require('./routes/subjectRoutes'));
app.use('/api/topics',      require('./routes/topicRoutes'));
app.use('/api/questions',   require('./routes/questionRoutes'));
app.use('/api/quizzes',     require('./routes/quizRoutes'));
app.use('/api/attempts',    require('./routes/attemptRoutes'));
app.use('/api/analytics',   require('./routes/analyticsRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/certificates',require('./routes/certificateRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));

//Health check
// app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// const listEndpoints = require('express-list-endpoints');

// console.log(listEndpoints(app));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PrepMetrics API running on port ${PORT}`));
