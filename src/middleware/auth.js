const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/** Express middleware — attaches req.user or returns 401 */
function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const decoded = verifyToken(header.slice(7));
    const user = db.prepare(
      'SELECT id, name, reg_number, email FROM users WHERE reg_number = ?'
    ).get(decoded.reg_number);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, verifyToken, authRequired };
