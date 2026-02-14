const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
  deleteUser
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.put('/users/:id/toggle-status', authenticateToken, isAdmin, toggleUserStatus);
router.get('/stats', authenticateToken, isAdmin, getDashboardStats);
router.delete('/users/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;
