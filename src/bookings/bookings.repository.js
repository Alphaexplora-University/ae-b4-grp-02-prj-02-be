const supabase = require('../config/database');
const AppError = require('../shared/utils/appError');

// Fields safe to expose to the PUBLIC customer view
const PUBLIC_SAFE_FIELDS = 'tracking_token, status, service_requested, created_at, updated_at';

async function findAllByVendor(vendorId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function findByIdAndVendor(bookingId, vendorId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('vendor_id', vendorId)
    .single();

  if (error) return null; // not found or not owned by this vendor
  return data;
}

async function updateStatus(bookingId, vendorId, newStatus) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .eq('vendor_id', vendorId) // ensures vendors can't update others' bookings
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

async function findByTrackingToken(trackingToken) {
  const { data, error } = await supabase
    .from('bookings')
    .select(PUBLIC_SAFE_FIELDS)
    .eq('tracking_token', trackingToken)
    .single();

  if (error) return null;
  return data;
}

async function create(bookingData) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

module.exports = {
  findAllByVendor,
  findByIdAndVendor,
  updateStatus,
  findByTrackingToken,
  create,
};