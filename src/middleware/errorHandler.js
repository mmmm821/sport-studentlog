const config = require('../config');

/** 404 handler — catches unmatched API routes */
function notFound(req, res, next) {
  if (req.path.startsWith('/auth') || req.path.startsWith('/achievements') || req.path.startsWith('/stats')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  next();
}

/** Global error handler */
function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: config.isProd ? 'Internal server error' : (err.message || 'Unknown error'),
  });
}

module.exports = { notFound, errorHandler };
