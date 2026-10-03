const prisma = require('../config/db');
const { validateRating } = require('../utils/validators');

// POST /api/ratings - Submit rating (1 to 5) for a store
const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    if (!validateRating(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const numRating = parseInt(rating, 10);

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if user already submitted a rating for this store
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    let savedRating;
    let isModification = false;

    if (existingRating) {
      // If already exists, modify it
      savedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating: numRating },
      });
      isModification = true;
    } else {
      // Otherwise create new rating
      savedRating = await prisma.rating.create({
        data: {
          userId,
          storeId,
          rating: numRating,
        },
      });
    }

    // Compute updated overall store rating
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });
    const totalRatings = allRatings.length;
    const overallRating = Number(
      (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    );

    return res.status(isModification ? 200 : 201).json({
      message: isModification ? 'Rating updated successfully.' : 'Rating submitted successfully.',
      rating: savedRating,
      overallRating,
      totalRatings,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ message: 'Error submitting rating.' });
  }
};

// PUT /api/ratings/:storeId - Modify existing rating for a store
const modifyRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!validateRating(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const numRating = parseInt(rating, 10);

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!existingRating) {
      return res.status(404).json({
        message: 'No existing rating found for this store. Please submit a rating first.',
      });
    }

    const updatedRating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: { rating: numRating },
    });

    // Compute updated overall store rating
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });
    const totalRatings = allRatings.length;
    const overallRating = Number(
      (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    );

    return res.status(200).json({
      message: 'Rating modified successfully.',
      rating: updatedRating,
      overallRating,
      totalRatings,
    });
  } catch (error) {
    console.error('Modify rating error:', error);
    return res.status(500).json({ message: 'Error modifying rating.' });
  }
};

module.exports = {
  submitRating,
  modifyRating,
};
