const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let meals;
    if (category && category !== 'all') {
      meals = db.prepare('SELECT * FROM meals WHERE category = ? ORDER BY isNew DESC, rating DESC').all(category);
    } else {
      meals = db.prepare('SELECT * FROM meals ORDER BY isNew DESC, rating DESC').all();
    }
    res.json({ meals });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/categories', (req, res) => {
  try {
    const cats = db.prepare('SELECT DISTINCT category FROM meals ORDER BY category').all();
    const count = db.prepare('SELECT category, COUNT(*) as count FROM meals GROUP BY category').all();
    res.json({ categories: cats.map(c => ({ name: c.category, count: count.find(x => x.category === c.category)?.count || 0 })) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    if (!meal) { res.status(404).json({ error: 'Meal not found' }); return; }
    const related = db.prepare('SELECT * FROM meals WHERE category = ? AND id != ? ORDER BY rating DESC LIMIT 4').all(meal.category, meal.id);
    res.json({ meal, related });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
