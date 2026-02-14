const pool = require('../config/database');

const updateLocation = async (req, res) => {
  const { latitude, longitude, address, is_sharing } = req.body;

  try {
    // Check if location exists
    const checkLocation = await pool.query(
      'SELECT id FROM locations WHERE user_id = $1',
      [req.user.id]
    );

    if (checkLocation.rows.length > 0) {
      // Update existing location
      const result = await pool.query(
        `UPDATE locations 
         SET latitude = $1, longitude = $2, address = $3, is_sharing = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING *`,
        [latitude, longitude, address, is_sharing, req.user.id]
      );
      res.json(result.rows[0]);
    } else {
      // Insert new location
      const result = await pool.query(
        `INSERT INTO locations (user_id, latitude, longitude, address, is_sharing)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, latitude, longitude, address, is_sharing]
      );
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNearbyUsers = async (req, res) => {
  const { latitude, longitude, radius = 5 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  try {
    // Haversine formula to calculate distance
    const query = `
      SELECT 
        u.id, u.username, u.full_name, u.bio, u.is_service_provider, 
        u.service_type, u.rating, u.is_online,
        l.latitude, l.longitude, l.address,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( l.latitude ) ) 
        * cos( radians( l.longitude ) - radians($2) ) + sin( radians($1) ) 
        * sin( radians( l.latitude ) ) ) ) AS distance
      FROM users u
      INNER JOIN locations l ON u.id = l.user_id
      WHERE l.is_sharing = true 
        AND u.id != $3
        AND u.is_active = true
      HAVING distance < $4
      ORDER BY distance
      LIMIT 50
    `;

    const result = await pool.query(query, [
      parseFloat(latitude),
      parseFloat(longitude),
      req.user.id,
      parseFloat(radius)
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const toggleLocationSharing = async (req, res) => {
  const { is_sharing } = req.body;

  try {
    const result = await pool.query(
      `UPDATE locations 
       SET is_sharing = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [is_sharing, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found. Please update your location first.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { updateLocation, getNearbyUsers, toggleLocationSharing };
