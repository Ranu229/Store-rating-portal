const express = require('express');
const router = express.Router();
const { submitRating, modifyRating } = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Ratings can only be submitted or modified by NORMAL_USER
router.use(authenticateToken, authorizeRoles('NORMAL_USER'));

router.post('/', submitRating);
router.put('/:storeId', modifyRating);

module.exports = router;
