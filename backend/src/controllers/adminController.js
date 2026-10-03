const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

// GET /api/admin/dashboard - System metrics
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
    ]);

    const roleCounts = {
      ADMIN: 0,
      NORMAL_USER: 0,
      STORE_OWNER: 0,
    };
    usersByRole.forEach((item) => {
      roleCounts[item.role] = item._count._all;
    });

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
      roleCounts,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ message: 'Error retrieving admin dashboard stats.' });
  }
};

// GET /api/admin/users - List users with search, role filter, and sorting
const getUsers = async (req, res) => {
  try {
    const { search = '', role = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    // Role filter
    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }

    // Search filter across Name, Email, Address
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { address: { contains: term } },
      ];
    }

    // Determine sorting
    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: order },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Format output and calculate Store Owner rating if applicable
    const formattedUsers = users.map((user) => {
      let storeRating = null;
      let storeDetails = null;

      if (user.role === 'STORE_OWNER' && user.stores && user.stores.length > 0) {
        const store = user.stores[0];
        const ratings = store.ratings || [];
        const avg =
          ratings.length > 0
            ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
            : null;
        storeRating = avg;
        storeDetails = {
          id: store.id,
          name: store.name,
          totalRatings: ratings.length,
        };
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeRating,
        storeDetails,
      };
    });

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Error retrieving users.' });
  }
};

// GET /api/admin/users/:id - View single user details
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stores: {
          include: {
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let storeRating = null;
    let storeInfo = null;

    if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
      const store = user.stores[0];
      const ratings = store.ratings || [];
      storeRating =
        ratings.length > 0
          ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
          : 0;
      storeInfo = {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings: ratings.length,
        averageRating: storeRating,
      };
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeRating,
        storeInfo,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return res.status(500).json({ message: 'Error retrieving user details.' });
  }
};

// POST /api/admin/users - Admin adds new user (admin, normal user, or store owner)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const errors = [];
    if (!validateName(name)) {
      errors.push('Name must be between 20 and 60 characters.');
    }
    if (!validateEmail(email)) {
      errors.push('Please provide a valid email address.');
    }
    if (!validatePassword(password)) {
      errors.push('Password must be 8-16 characters and include at least one uppercase letter and one special character.');
    }
    if (!validateAddress(address)) {
      errors.push('Address is required and must not exceed 400 characters.');
    }

    const validRoles = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
    const userRole = role ? role.toUpperCase() : 'NORMAL_USER';
    if (!validRoles.includes(userRole)) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        address: address.trim(),
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Error creating user.' });
  }
};

// GET /api/admin/stores - List stores with overall rating, search & sort
const getStores = async (req, res) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where = {};
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { address: { contains: term } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    // Compute ratings and prepare for sorting
    const formattedStores = stores.map((store) => {
      const ratings = store.ratings || [];
      const ratingCount = ratings.length;
      const averageRating =
        ratingCount > 0
          ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1))
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        owner: store.owner,
        rating: averageRating,
        ratingCount,
      };
    });

    // In-memory sort supporting rating and all fields
    const orderFactor = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating') {
        return (a.rating - b.rating) * orderFactor;
      }
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email) * orderFactor;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * orderFactor;
      }
      return a.name.localeCompare(b.name) * orderFactor;
    });

    return res.status(200).json({ stores: formattedStores });
  } catch (error) {
    console.error('Admin get stores error:', error);
    return res.status(500).json({ message: 'Error retrieving stores.' });
  }
};

// POST /api/admin/stores - Admin creates a new store
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = [];
    if (!name || name.trim().length < 3 || name.trim().length > 60) {
      errors.push('Store Name must be between 3 and 60 characters.');
    }
    if (!validateEmail(email)) {
      errors.push('Please provide a valid store email address.');
    }
    if (!validateAddress(address)) {
      errors.push('Store address is required and must not exceed 400 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const existingStore = await prisma.store.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingStore) {
      return res.status(400).json({ message: 'A store with this email already exists.' });
    }

    // If ownerId provided, check if valid user with STORE_OWNER role
    let validOwnerId = null;
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) {
        return res.status(400).json({ message: 'Selected store owner was not found.' });
      }
      if (owner.role !== 'STORE_OWNER') {
        // Automatically promote user or return validation error
        await prisma.user.update({
          where: { id: ownerId },
          data: { role: 'STORE_OWNER' },
        });
      }
      validOwnerId = ownerId;
    }

    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        ownerId: validOwnerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      message: 'Store created successfully',
      store: {
        ...newStore,
        rating: 0,
        ratingCount: 0,
      },
    });
  } catch (error) {
    console.error('Create store error:', error);
    return res.status(500).json({ message: 'Error creating store.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  createUser,
  getStores,
  createStore,
};
