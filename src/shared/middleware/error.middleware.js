const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong on our end';

  if (!err.isOperational) {
    logger.error('Unexpected error:', err);
  } else {
    logger.warn(`Operational error [${statusCode}]:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorMiddleware;