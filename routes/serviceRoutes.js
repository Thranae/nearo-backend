const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getNearbyServices,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/auth');

router.post('/create', authenticateToken, createService);
router.get('/my-services', authenticateToken, getServices);
router.get('/nearby', authenticateToken, getNearbyServices);
router.put('/:id', authenticateToken, updateService);
router.delete('/:id', authenticateToken, deleteService);

module.exports = router;
