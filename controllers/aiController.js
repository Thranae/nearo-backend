const {
  generateAutoReply,
  rewriteMessage,
  checkSafetyFilter,
  generateBio,
  recommendServices,
  extractIntent
} = require('../ai/nlpProcessor');
const pool = require('../config/database');

const getAutoReply = async (req, res) => {
  const { message } = req.body;

  try {
    const reply = generateAutoReply(message);
    const intent = extractIntent(message);

    res.json({ reply, intent });
  } catch (error) {
    console.error('Auto reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const rewriteText = async (req, res) => {
  const { message, tone } = req.body;

  try {
    const rewritten = rewriteMessage(message, tone);
    res.json({ original: message, rewritten });
  } catch (error) {
    console.error('Rewrite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const checkSafety = async (req, res) => {
  const { message } = req.body;

  try {
    const safetyResult = checkSafetyFilter(message);
    res.json(safetyResult);
  } catch (error) {
    console.error('Safety check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createBio = async (req, res) => {
  const { keywords, serviceType } = req.body;

  try {
    const bio = generateBio(keywords, serviceType);
    res.json({ bio });
  } catch (error) {
    console.error('Bio generation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRecommendations = async (req, res) => {
  const { latitude, longitude, serviceType } = req.query;

  try {
    let query = `
      SELECT 
        u.id, u.username, u.full_name, u.service_type, u.rating, u.is_online,
        l.latitude, l.longitude,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( l.latitude ) ) 
        * cos( radians( l.longitude ) - radians($2) ) + sin( radians($1) ) 
        * sin( radians( l.latitude ) ) ) ) AS distance
      FROM users u
      INNER JOIN locations l ON u.id = l.user_id
      WHERE u.is_service_provider = true AND u.is_active = true
    `;

    const params = [parseFloat(latitude), parseFloat(longitude)];

    if (serviceType) {
      query += ` AND u.service_type = $3`;
      params.push(serviceType);
    }

    query += ` ORDER BY distance LIMIT 20`;

    const result = await pool.query(query, params);
    
    const recommendations = recommendServices(result.rows, { latitude, longitude });

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAutoReply,
  rewriteText,
  checkSafety,
  createBio,
  getRecommendations
};
