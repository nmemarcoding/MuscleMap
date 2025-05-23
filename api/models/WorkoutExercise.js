const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
    workout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true
    },
    dayNumber: {
        type: Number,
        required: true
    },
    workoutName: {
        type: String,
        maxlength: 100
    },
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    sets: {
        type: Number,
        default: 3
    },
    reps: {
        type: Number,
        default: 10
    },
    restSeconds: {
        type: Number,
        default: 60
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const WorkoutExercise = mongoose.model('WorkoutExercise', workoutExerciseSchema);

module.exports = WorkoutExercise;
