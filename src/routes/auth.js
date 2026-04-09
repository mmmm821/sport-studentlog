const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 12;

// ── POST /auth/signup ──
router.post('/signup', async (req, res, next) => {
  try {
    const { name, reg_number, email, password, confirm_password } = req.body;

    if (!name || !reg_number || !email || !password || !confirm_password)
      return res.status(400).json({ success: false, error: 'All fields are required' });
    if (reg_number.length !== 15)
      return res.status(400).json({ success: false, error: 'Registration number must be 15 characters' });
    if (!email.toLowerCase().endsWith('@srmist.edu.in'))
      return res.status(400).json({ success: false, error: 'Use a valid @srmist.edu.in email' });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    if (password !== confirm_password)
      return res.status(400).json({ success: false, error: 'Passwords do not match' });

    const existing = db.prepare(
      'SELECT id FROM users WHERE reg_number = ? OR email = ?'
    ).get(reg_number, email.toLowerCase());
    if (existing)
      return res.status(409).json({ success: false, error: 'Registration number or email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    db.prepare(
      'INSERT INTO users (name, reg_number, email, password_hash) VALUES (?, ?, ?, ?)'
    ).run(name, reg_number, email.toLowerCase(), hash);

    const token = signToken({ reg_number });
    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: { name, reg_number, email: email.toLowerCase() },
    });
  } catch (err) { next(err); }
});

// ── POST /auth/login ──
router.post('/login', async (req, res, next) => {
  try {
    const { reg_number, password } = req.body;
    if (!reg_number || !password)
      return res.status(400).json({ success: false, error: 'Both fields required' });

    const user = db.prepare('SELECT * FROM users WHERE reg_number = ?').get(reg_number);
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ success: false, error: 'Invalid registration number or password' });

    const token = signToken({ reg_number: user.reg_number });
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { name: user.name, reg_number: user.reg_number, email: user.email },
    });
  } catch (err) { next(err); }
});

// ── GET /auth/me ──
router.get('/me', authRequired, (req, res) => {
  res.json({
    success: true,
    user: { name: req.user.name, reg_number: req.user.reg_number, email: req.user.email },
  });
});

module.exports = router;
