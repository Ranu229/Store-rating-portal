const prisma = require('../config/db');

// GET /api/owner/dashboard - Store owner dashboard data
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Find the store owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(200).json({
        hasStore: false,
        message: 'No store currently assigned to your account. Please contact an administrator.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        userRatings: [],
      });
    }

    const ratings = store.ratings || [];
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

    // Rating distribution for star breakdown chart/visualization
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      if (starCounts[r.rating] !== undefined) {
        starCounts[r.rating]++;
      }
    });

    // List of users who submitted ratings
    const formattedRatings = ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    // Sorting
    const orderFactor = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    formattedRatings.sort((a, b) => {
      if (sortBy === 'rating') {
        return (a.rating - b.rating) * orderFactor;
      }
      if (sortBy === 'userName') {
        return a.user.name.localeCompare(b.user.name) * orderFactor;
      }
      if (sortBy === 'userEmail') {
        return a.user.email.localeCompare(b.user.email) * orderFactor;
      }
      // default: createdAt
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderFactor;
    });

    return res.status(200).json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      totalRatings,
      starCounts,
      userRatings: formattedRatings,
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    return res.status(500).json({ message: 'Error retrieving store owner dashboard.' });
  }
};

module.exports = {
  getOwnerDashboard,
};
