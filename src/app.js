const express = require('express');
const bookingsRoutes = require('./bookings/bookings.routes');
const errorMiddleware = require('./shared/middleware/error.middleware');
const AppError = require('./shared/utils/appError');

const cors = require('cors');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));


app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Feature routes
app.use('/bookings', bookingsRoutes);

// Catch unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Centralized error handler — must be last
app.use(errorMiddleware);

module.exports = app;