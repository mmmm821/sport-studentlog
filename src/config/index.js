require('dotenv').config();

module.exports = {
  port:          parseInt(process.env.PORT, 10) || 3000,
  nodeEnv:       process.env.NODE_ENV || 'development',
  isProd:        process.env.NODE_ENV === 'production',

  jwt: {
    secret:    process.env.JWT_SECRET || 'dev_fallback_secret_do_not_use_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  db: {
    path: process.env.DB_PATH || './data/sportlog.db',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : [],
};
