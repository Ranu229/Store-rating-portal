const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  createUser,
  getStores,
  createStore,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require ADMIN role
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);

module.exports = router;
