const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Owner dashboard routes require STORE_OWNER role
router.use(authenticateToken, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
