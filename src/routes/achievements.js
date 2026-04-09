const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const VALID_SPORTS = [
  'Cricket','Football','100m Dash','500m Dash','Shot Put',
  'Long Jump','Chess','Carrom','Volleyball','Hockey',
];
const VALID_LEVELS = [
  'School Level','College Level','Inter-College','District Level',
  'State Level','National Level','International Level',
];
const VALID_CATEGORIES = ['Individual','Team','Mixed'];

// ── GET /achievements ──
router.get('/', (req, res, next) => {
  try {
    const { student_name, sport, level, class: cls } = req.query;
    let sql = 'SELECT * FROM achievements WHERE 1=1';
    const params = [];

    if (student_name) {
      sql += ' AND (student_name LIKE ? OR roll_number LIKE ?)';
      const q = `%${student_name}%`;
      params.push(q, q);
    }
    if (sport)  { sql += ' AND sport = ?'; params.push(sport); }
    if (level)  { sql += ' AND level = ?'; params.push(level); }
    if (cls)    { sql += ' AND class LIKE ?'; params.push(`%${cls}%`); }

    sql += ' ORDER BY id DESC';
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
});

// ── GET /achievements/:id ──
router.get('/:id', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM achievements WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

// ── POST /achievements ──
router.post('/', authRequired, (req, res, next) => {
  try {
    const b = req.body;
    const required = ['student_name','roll_number','class','sport','category','achievement','level'];
    for (const f of required) {
      if (!b?.[f]) return res.status(400).json({ success: false, error: `${f.replace(/_/g,' ')} is required` });
    }
    if (!VALID_SPORTS.includes(b.sport))
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    if (!VALID_LEVELS.includes(b.level))
      return res.status(400).json({ success: false, error: 'Invalid level' });
    if (!VALID_CATEGORIES.includes(b.category))
      return res.status(400).json({ success: false, error: 'Invalid category' });

    const result = db.prepare(`
      INSERT INTO achievements
        (student_name, roll_number, batch_year, class, sport, category,
         achievement, position, score, event_name, event_date, level, description, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      b.student_name, b.roll_number, b.batch_year||'', b.class, b.sport, b.category,
      b.achievement, b.position||'', b.score||'', b.event_name||'', b.event_date||'',
      b.level, b.description||'', req.user.reg_number
    );

    const row = db.prepare('SELECT * FROM achievements WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Achievement recorded!', data: row });
  } catch (err) { next(err); }
});

// ── PUT /achievements/:id ──
router.put('/:id', authRequired, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!db.prepare('SELECT id FROM achievements WHERE id = ?').get(id))
      return res.status(404).json({ success: false, error: 'Not found' });

    const b = req.body;
    const required = ['student_name','roll_number','class','sport','category','achievement','level'];
    for (const f of required) {
      if (!b?.[f]) return res.status(400).json({ success: false, error: `${f.replace(/_/g,' ')} is required` });
    }

    db.prepare(`
      UPDATE achievements SET
        student_name=?, roll_number=?, batch_year=?, class=?, sport=?, category=?,
        achievement=?, position=?, score=?, event_name=?, event_date=?, level=?,
        description=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      b.student_name, b.roll_number, b.batch_year||'', b.class, b.sport, b.category,
      b.achievement, b.position||'', b.score||'', b.event_name||'', b.event_date||'',
      b.level, b.description||'', id
    );

    const row = db.prepare('SELECT * FROM achievements WHERE id = ?').get(id);
    res.json({ success: true, message: 'Updated', data: row });
  } catch (err) { next(err); }
});

// ── DELETE /achievements/:id ──
router.delete('/:id', authRequired, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!db.prepare('SELECT id FROM achievements WHERE id = ?').get(id))
      return res.status(404).json({ success: false, error: 'Not found' });

    db.prepare('DELETE FROM achievements WHERE id = ?').run(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
