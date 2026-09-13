const express = require('express');
const db = require('../db');

const router = express.Router();
const MEDAL_POSITIONS = ['1st Place / Gold', '2nd Place / Silver', '3rd Place / Bronze'];

router.get('/', (req, res, next) => {
  try {
    const totalAchievements = Number(db.prepare('SELECT COUNT(*) AS c FROM achievements').get().c) || 0;
    const totalStudents = Number(db.prepare('SELECT COUNT(DISTINCT roll_number) AS c FROM achievements').get().c) || 0;

    const bySport = db.prepare(
      'SELECT sport, COUNT(*) AS count FROM achievements GROUP BY sport ORDER BY count DESC, sport ASC'
    ).all().map(row => ({ sport: String(row.sport || ''), count: Number(row.count) || 0 }));

    const byLevel = db.prepare(
      'SELECT level, COUNT(*) AS count FROM achievements GROUP BY level ORDER BY count DESC, level ASC'
    ).all().map(row => ({ level: String(row.level || ''), count: Number(row.count) || 0 }));

    const recentWinners = db.prepare(`
      SELECT id, student_name, roll_number, sport, position, score, event_name, event_date, created_at
      FROM achievements
      WHERE position IN (?, ?, ?)
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT 5
    `).all(...MEDAL_POSITIONS);

    res.json({
      success: true,
      data: { totalAchievements, totalStudents, bySport, byLevel, recentWinners },
    });
  } catch (err) { next(err); }
});

module.exports = router;
