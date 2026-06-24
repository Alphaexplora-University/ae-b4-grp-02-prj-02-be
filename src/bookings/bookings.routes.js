const express = require('express');
const router = express.Router();

const controller = require('./bookings.controller');
const vendorAuth = require('../shared/middleware/auth.middleware');
const { validateCreateInquiry, validateStatusUpdate } = require('./bookings.validator');

// --- PUBLIC route — no auth, customer tracking view ---
router.get('/track/:uuid', controller.trackBooking);

// --- PUBLIC route — creating an inquiry (no customer login required) ---
router.post('/', validateCreateInquiry, controller.createInquiry);

// --- VENDOR-PROTECTED routes ---
router.get('/', vendorAuth, controller.getMyBookings);
router.patch('/:id/status', vendorAuth, validateStatusUpdate, controller.updateBookingStatus);

module.exports = router;