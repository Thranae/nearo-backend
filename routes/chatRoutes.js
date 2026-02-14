const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getChatList,
  markAsRead
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.post('/send', authenticateToken, sendMessage);
router.get('/messages/:user_id', authenticateToken, getMessages);
router.get('/list', authenticateToken, getChatList);
router.post('/mark-read', authenticateToken, markAsRead);

module.exports = router;
