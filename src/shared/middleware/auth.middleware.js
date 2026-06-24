const AppError = require('../utils/appError');
const supabase = require('../../config/database');

// MVP approach: vendor sends their vendor UUID + a shared secret header.
// Swap this for proper Supabase Auth JWT verification post-MVP.
async function vendorAuthMiddleware(req, res, next) {
  try {
    const vendorId = req.headers['x-vendor-id'];
    const apiKey = req.headers['x-api-key'];

    if (!vendorId || !apiKey) {
      throw new AppError('Missing vendor credentials', 401);
    }

    if (apiKey !== process.env.VENDOR_API_KEY) {
      throw new AppError('Invalid API key', 401);
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, business_name')
      .eq('id', vendorId)
      .single();

    if (error || !vendor) {
      throw new AppError('Vendor not found', 401);
    }

    req.vendor = vendor; // attach for downstream use
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = vendorAuthMiddleware;