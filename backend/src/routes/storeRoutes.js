const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById } = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/auth');

// Both public and authenticated users can view stores; authenticated user gets userRating
router.get('/', authenticateToken, getAllStores);
router.get('/:id', authenticateToken, getStoreById);

module.exports = router;
