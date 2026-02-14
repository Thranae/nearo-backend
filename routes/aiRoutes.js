const express = require('express');
const router = express.Router();
const {
  getAutoReply,
  rewriteText,
  checkSafety,
  createBio,
  getRecommendations
} = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/auto-reply', authenticateToken, getAutoReply);
router.post('/rewrite', authenticateToken, rewriteText);
router.post('/safety-check', authenticateToken, checkSafety);
router.post('/generate-bio', authenticateToken, createBio);
router.get('/recommendations', authenticateToken, getRecommendations);

module.exports = router;
