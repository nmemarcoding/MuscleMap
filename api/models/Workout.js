const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planName: {
        type: String,
        required: true,
        maxlength: 100
    },
    goal: {
        type: String,
        maxlength: 50
    },
    level: {
        type: String,
        maxlength: 20
    },
    durationWeeks: {
        type: Number
    },
    workoutsPerWeek: {
        type: Number,
        default: 3,
        min: 1,
        max: 7
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
