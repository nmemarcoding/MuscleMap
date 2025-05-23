const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const authMiddleware = require('../middleware/auth');

// @route   GET api/workouts
// @desc    Get all workouts for the logged in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/workouts/:id
// @desc    Get workout by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if the workout belongs to the user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    res.json(workout);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/workouts
// @desc    Create a new workout
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { planName, goal, level, durationWeeks } = req.body;
    
    // Basic validation
    if (!planName) {
      return res.status(400).json({ message: 'Plan name is required' });
    }
    
    const newWorkout = new Workout({
      user: req.user.id,
      planName,
      goal,
      level,
      durationWeeks
    });
    
    const workout = await newWorkout.save();
    res.status(201).json(workout);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/workouts/:id
// @desc    Update a workout
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { planName, goal, level, durationWeeks } = req.body;
    
    // Build workout object
    const workoutFields = {};
    if (planName) workoutFields.planName = planName;
    if (goal !== undefined) workoutFields.goal = goal;
    if (level !== undefined) workoutFields.level = level;
    if (durationWeeks !== undefined) workoutFields.durationWeeks = durationWeeks;
    
    let workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if the workout belongs to the user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { $set: workoutFields },
      { new: true }
    );
    
    res.json(workout);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/workouts/:id
// @desc    Delete a workout
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if the workout belongs to the user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    await Workout.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Workout removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
