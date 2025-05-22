const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/auth');

// @route   GET api/exercises
// @desc    Get all exercises
// @access  Public
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/exercises/:id
// @desc    Get exercise by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/exercises
// @desc    Create a new exercise
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const { name, category, equipment, instructions, video_url, image_url } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }
    
    const newExercise = new Exercise({
      name,
      category,
      equipment,
      instructions,
      video_url,
      image_url
    });
    
    const exercise = await newExercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/exercises/:id
// @desc    Update an exercise
// @access  Private (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const { name, category, equipment, instructions, video_url, image_url } = req.body;
    const exerciseFields = {};
    
    if (name) exerciseFields.name = name;
    if (category !== undefined) exerciseFields.category = category;
    if (equipment !== undefined) exerciseFields.equipment = equipment;
    if (instructions !== undefined) exerciseFields.instructions = instructions;
    if (video_url !== undefined) exerciseFields.video_url = video_url;
    if (image_url !== undefined) exerciseFields.image_url = image_url;
    
    let exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { $set: exerciseFields },
      { new: true }
    );
    
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/exercises/:id
// @desc    Delete an exercise
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    await Exercise.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Exercise removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
