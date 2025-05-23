const express = require('express');
const router = express.Router();
const WorkoutExercise = require('../models/WorkoutExercise');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/auth');

// @route   GET api/workout-exercises/workout/:workoutId
// @desc    Get all exercises for a specific workout
// @access  Private
router.get('/workout/:workoutId', authMiddleware, async (req, res) => {
  try {
    // First check if the workout belongs to the user
    const workout = await Workout.findById(req.params.workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Get all workout exercises
    const workoutExercises = await WorkoutExercise.find({ workout: req.params.workoutId })
      .populate('exercise', 'name category equipment instructions video_url image_url');
    
    res.json(workoutExercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/workout-exercises/workout/:workoutId/day/:dayNumber
// @desc    Get exercises for a specific workout and day
// @access  Private
router.get('/workout/:workoutId/day/:dayNumber', authMiddleware, async (req, res) => {
  try {
    // First check if the workout belongs to the user
    const workout = await Workout.findById(req.params.workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Get workout exercises for the specific day
    const workoutExercises = await WorkoutExercise.find({ 
      workout: req.params.workoutId,
      dayNumber: req.params.dayNumber
    }).populate('exercise', 'name category equipment instructions video_url image_url');
    
    res.json(workoutExercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/workout-exercises
// @desc    Add an exercise to a workout
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { workoutId, dayNumber, workoutName, exerciseId, sets, reps, restSeconds } = req.body;
    
    // Validate required fields
    if (!workoutId || !dayNumber || !exerciseId) {
      return res.status(400).json({ message: 'Workout ID, day number, and exercise ID are required' });
    }
    
    // Check if workout exists and belongs to user
    const workout = await Workout.findById(workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Create new workout exercise
    const workoutExercise = new WorkoutExercise({
      workout: workoutId,
      dayNumber,
      workoutName,
      exercise: exerciseId,
      sets: sets || 3,
      reps: reps || 10,
      restSeconds: restSeconds || 60
    });
    
    await workoutExercise.save();
    
    // Populate exercise details before returning
    const populatedWorkoutExercise = await WorkoutExercise.findById(workoutExercise._id)
      .populate('exercise', 'name category equipment instructions video_url image_url');
    
    res.status(201).json(populatedWorkoutExercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/workout-exercises/:id
// @desc    Update a workout exercise
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { workoutName, sets, reps, restSeconds } = req.body;
    
    // Find workout exercise
    const workoutExercise = await WorkoutExercise.findById(req.params.id);
    
    if (!workoutExercise) {
      return res.status(404).json({ message: 'Workout exercise not found' });
    }
    
    // Check if the associated workout belongs to the user
    const workout = await Workout.findById(workoutExercise.workout);
    
    if (!workout) {
      return res.status(404).json({ message: 'Associated workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Update fields
    const fields = {};
    if (workoutName !== undefined) fields.workoutName = workoutName;
    if (sets !== undefined) fields.sets = sets;
    if (reps !== undefined) fields.reps = reps;
    if (restSeconds !== undefined) fields.restSeconds = restSeconds;
    
    // Update and return the workout exercise
    const updatedWorkoutExercise = await WorkoutExercise.findByIdAndUpdate(
      req.params.id,
      { $set: fields },
      { new: true }
    ).populate('exercise', 'name category equipment instructions video_url image_url');
    
    res.json(updatedWorkoutExercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/workout-exercises/:id
// @desc    Delete a workout exercise
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Find workout exercise
    const workoutExercise = await WorkoutExercise.findById(req.params.id);
    
    if (!workoutExercise) {
      return res.status(404).json({ message: 'Workout exercise not found' });
    }
    
    // Check if the associated workout belongs to the user
    const workout = await Workout.findById(workoutExercise.workout);
    
    if (!workout) {
      return res.status(404).json({ message: 'Associated workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Delete the workout exercise
    await WorkoutExercise.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Workout exercise removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/workout-exercises/workout/:workoutId
// @desc    Delete all exercises for a workout
// @access  Private
router.delete('/workout/:workoutId', authMiddleware, async (req, res) => {
  try {
    // Check if the workout belongs to the user
    const workout = await Workout.findById(req.params.workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Delete all workout exercises for this workout
    await WorkoutExercise.deleteMany({ workout: req.params.workoutId });
    
    res.json({ message: 'All workout exercises removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
