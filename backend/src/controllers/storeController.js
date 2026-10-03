const prisma = require('../config/db');

// GET /api/stores - List all registered stores with overall rating and current user's submitted rating
const getAllStores = async (req, res) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {};
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { address: { contains: term } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
            updatedAt: true,
          },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings || [];
      const totalRatings = ratings.length;
      const overallRating =
        totalRatings > 0
          ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
          : 0;

      // Find current user's rating if any
      const userRatingObj = currentUserId
        ? ratings.find((r) => r.userId === currentUserId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userRating: userRatingObj
          ? {
              id: userRatingObj.id,
              rating: userRatingObj.rating,
              updatedAt: userRatingObj.updatedAt,
            }
          : null,
      };
    });

    // Handle sorting
    const orderFactor = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating' || sortBy === 'overallRating') {
        return (a.overallRating - b.overallRating) * orderFactor;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * orderFactor;
      }
      return a.name.localeCompare(b.name) * orderFactor;
    });

    return res.status(200).json({ stores: formattedStores });
  } catch (error) {
    console.error('Get stores error:', error);
    return res.status(500).json({ message: 'Error retrieving store listings.' });
  }
};

// GET /api/stores/:id - Single store details
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const ratings = store.ratings || [];
    const totalRatings = ratings.length;
    const overallRating =
      totalRatings > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

    const userRatingObj = currentUserId
      ? ratings.find((r) => r.userId === currentUserId)
      : null;

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userRating: userRatingObj
          ? {
              id: userRatingObj.id,
              rating: userRatingObj.rating,
              updatedAt: userRatingObj.updatedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get store by id error:', error);
    return res.status(500).json({ message: 'Error retrieving store.' });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
};
