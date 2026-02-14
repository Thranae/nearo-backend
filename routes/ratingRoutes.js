const express = require('express');
const router = express.Router();
const { addRating, getUserRatings } = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/add', authenticateToken, addRating);
router.get('/user/:user_id', authenticateToken, getUserRatings);

module.exports = router;
