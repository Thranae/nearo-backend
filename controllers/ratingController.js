const pool = require('../config/database');

const addRating = async (req, res) => {
  const { rated_user_id, rating, review } = req.body;

  try {
    // Check if already rated
    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND rated_user_id = $2',
      [req.user.id, rated_user_id]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      const result = await pool.query(
        `UPDATE ratings 
         SET rating = $1, review = $2, created_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND rated_user_id = $4
         RETURNING *`,
        [rating, review, req.user.id, rated_user_id]
      );

      await updateUserRating(rated_user_id);
      return res.json(result.rows[0]);
    }

    // Insert new rating
    const result = await pool.query(
      `INSERT INTO ratings (user_id, rated_user_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, rated_user_id, rating, review]
    );

    await updateUserRating(rated_user_id);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserRating = async (userId) => {
  const result = await pool.query(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM ratings WHERE rated_user_id = $1',
    [userId]
  );

  const avgRating = parseFloat(result.rows[0].avg_rating) || 0;
  const totalRatings = parseInt(result.rows[0].total) || 0;

  await pool.query(
    'UPDATE users SET rating = $1, total_ratings = $2 WHERE id = $3',
    [avgRating.toFixed(2), totalRatings, userId]
  );
};

const getUserRatings = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.username, u.full_name 
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.rated_user_id = $1
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addRating, getUserRatings };
