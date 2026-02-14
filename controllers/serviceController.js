const pool = require('../config/database');

const createService = async (req, res) => {
  const { service_name, description, price_range, availability } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO services (user_id, service_name, description, price_range, availability)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, service_name, description, price_range, availability]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.username, u.full_name, u.rating, u.total_ratings
       FROM services s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNearbyServices = async (req, res) => {
  const { latitude, longitude, radius = 5, service_type } = req.query;

  try {
    let query = `
      SELECT 
        u.id, u.username, u.full_name, u.bio, u.service_type, 
        u.rating, u.total_ratings, u.is_online,
        l.latitude, l.longitude, l.address,
        s.service_name, s.description, s.price_range, s.availability,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( l.latitude ) ) 
        * cos( radians( l.longitude ) - radians($2) ) + sin( radians($1) ) 
        * sin( radians( l.latitude ) ) ) ) AS distance
      FROM users u
      INNER JOIN locations l ON u.id = l.user_id
      LEFT JOIN services s ON u.id = s.user_id
      WHERE l.is_sharing = true 
        AND u.is_service_provider = true
        AND u.is_active = true
    `;

    const params = [parseFloat(latitude), parseFloat(longitude)];

    if (service_type) {
      query += ` AND u.service_type = $${params.length + 1}`;
      params.push(service_type);
    }

    query += `
      HAVING distance < $${params.length + 1}
      ORDER BY distance, u.rating DESC
      LIMIT 50
    `;
    params.push(parseFloat(radius));

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get nearby services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { service_name, description, price_range, availability } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services 
       SET service_name = COALESCE($1, service_name),
           description = COALESCE($2, description),
           price_range = COALESCE($3, price_range),
           availability = COALESCE($4, availability),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [service_name, description, price_range, availability, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createService,
  getServices,
  getNearbyServices,
  updateService,
  deleteService
};
