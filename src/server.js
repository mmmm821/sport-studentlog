const config = require('./config');

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

// Initialise DB (creates tables on first run)
require('./db');

// Routes
const authRoutes        = require('./routes/auth');
const achievementRoutes = require('./routes/achievements');
const statsRoutes       = require('./routes/stats');
const healthRoutes      = require('./routes/health');

// Middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security ──
app.use(helmet({
  contentSecurityPolicy: false,   // allow inline styles/scripts from the SPA
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ──
const corsOpts = config.corsOrigins.length
  ? { origin: config.corsOrigins, credentials: true }
  : { origin: true };
app.use(cors(corsOpts));

// ── Rate limiting ──
app.use('/auth', rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — try again later' },
}));

// ── Body parsing & compression ──
app.use(express.json({ limit: '1mb' }));
app.use(compression());

// ── Logging ──
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// ── Static frontend ──
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: config.isProd ? '1d' : 0,
}));

// ── API routes ──
app.use('/health',       healthRoutes);
app.use('/auth',         authRoutes);
app.use('/achievements', achievementRoutes);
app.use('/stats',        statsRoutes);

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

// ── SPA fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ──
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🏆  SportLog Server                       ║
  ║   Environment : ${config.nodeEnv.padEnd(27)}║
  ║   Port        : ${String(config.port).padEnd(27)}║
  ║   Database    : ${config.db.path.padEnd(27)}║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
