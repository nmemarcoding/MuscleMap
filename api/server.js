require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const exerciseRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workouts');
const workoutExerciseRoutes = require('./routes/workoutExercises');
const cors = require('cors');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// CORS configuration - allowing specific origins
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['x-auth-token']
}));

// Add a route to check API status and get connection info
app.get('/api/status', (req, res) => {
    res.json({
        status: 'API is running',
        apiUrl: `${req.protocol}://${req.get('host')}/api`
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/workout-exercises', workoutExerciseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Start server
const PORT = process.env.PORT || 8240;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
