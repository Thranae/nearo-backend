const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getNearbyUsers,
  toggleLocationSharing
} = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

router.post('/update', authenticateToken, updateLocation);
router.get('/nearby', authenticateToken, getNearbyUsers);
router.post('/toggle-sharing', authenticateToken, toggleLocationSharing);

module.exports = router;
