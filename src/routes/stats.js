const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const totalAchievements = db.prepare('SELECT COUNT(*) AS c FROM achievements').get().c;
    const totalStudents     = db.prepare('SELECT COUNT(DISTINCT roll_number) AS c FROM achievements').get().c;

    const bySport = db.prepare(
      'SELECT sport, COUNT(*) AS count FROM achievements GROUP BY sport ORDER BY count DESC'
    ).all();

    const byLevel = db.prepare(
      'SELECT level, COUNT(*) AS count FROM achievements GROUP BY level ORDER BY count DESC'
    ).all();

    const recentWinners = db.prepare(`
      SELECT * FROM achievements
      WHERE position != '' AND position IS NOT NULL
      ORDER BY created_at DESC LIMIT 5
    `).all();

    res.json({
      success: true,
      data: { totalAchievements, totalStudents, bySport, byLevel, recentWinners },
    });
  } catch (err) { next(err); }
});

module.exports = router;
