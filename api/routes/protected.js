const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// @route   GET api/protected/me
// @desc    Get current user's data
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // User data is already attached by the auth middleware
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        gender: req.user.gender,
        birthDate: req.user.birthDate,
        height: req.user.height,
        weight: req.user.weight,
        isAdmin: req.user.isAdmin,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      },
      message: 'Protected content retrieved successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a route to update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, gender, birthDate, height, weight } = req.body;
    const user = req.user;
    
    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = birthDate;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    
    await user.save();
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        birthDate: user.birthDate,
        height: user.height,
        weight: user.weight,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
