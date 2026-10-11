const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

// Production must always provide JWT_SECRET. Local development receives an
// ephemeral value instead of relying on a password-like secret in source code.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required when NODE_ENV=production.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }
}

// Optional auth: attaches req.user if token is present, but doesn't block if not
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  JWT_SECRET,
};
