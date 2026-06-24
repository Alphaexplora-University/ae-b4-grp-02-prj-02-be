const service = require('./bookings.service');

async function getMyBookings(req, res, next) {
  try {
    const bookings = await service.getVendorBookings(req.vendor.id);
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await service.changeBookingStatus(id, req.vendor.id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function trackBooking(req, res, next) {
  try {
    const { uuid } = req.params;
    const booking = await service.getPublicTrackingView(uuid);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

async function createInquiry(req, res, next) {
  try {
    // For MVP, the vendor ID is passed in the body since there's no public
    // booking form auth yet. Tighten this once frontend exists.
    const { vendorId } = req.body;
    const booking = await service.createInquiry(vendorId, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyBookings, updateBookingStatus, trackBooking, createInquiry };