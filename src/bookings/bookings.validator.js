const AppError = require('../shared/utils/appError');

function validateCreateInquiry(req, res, next) {
  const { customerName, customerEmail, serviceRequested } = req.body;

  if (!customerName || !customerEmail || !serviceRequested) {
    return next(new AppError('customerName, customerEmail, and serviceRequested are required', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return next(new AppError('Invalid customer email format', 400));
  }

  next();
}

function validateStatusUpdate(req, res, next) {
  const { status } = req.body;
  if (!status) {
    return next(new AppError('status is required in the request body', 400));
  }
  next();
}

module.exports = { validateCreateInquiry, validateStatusUpdate };