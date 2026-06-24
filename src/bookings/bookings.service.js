const repo = require('./bookings.repository');
const AppError = require('../shared/utils/appError');

const VALID_STATUSES = ['pending', 'accepted', 'rejected'];

async function getVendorBookings(vendorId) {
  return repo.findAllByVendor(vendorId);
}

async function changeBookingStatus(bookingId, vendorId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const existing = await repo.findByIdAndVendor(bookingId, vendorId);
  if (!existing) {
    throw new AppError('Booking not found or does not belong to this vendor', 404);
  }

  // Example business rule: prevent re-accepting an already-rejected booking
  // without an explicit override. Adjust to your actual workflow rules.
  if (existing.status === 'rejected' && newStatus === 'accepted') {
    throw new AppError('Cannot accept a booking that was already rejected', 409);
  }

  return repo.updateStatus(bookingId, vendorId, newStatus);
}

async function getPublicTrackingView(trackingToken) {
  const booking = await repo.findByTrackingToken(trackingToken);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  return booking; // already filtered to safe fields by the repository
}

async function createInquiry(vendorId, payload) {
  return repo.create({
    vendor_id: vendorId,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    customer_phone: payload.customerPhone || null,
    service_requested: payload.serviceRequested,
    notes: payload.notes || null,
  });
}

module.exports = {
  getVendorBookings,
  changeBookingStatus,
  getPublicTrackingView,
  createInquiry,
};