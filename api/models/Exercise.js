const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String,
        default: null
    },
    equipment: { 
        type: String,
        default: null
    },
    instructions: {
        type: String,
        default: null
    },
    video_url: {
        type: String,
        default: null
    },
    image_url: {
        type: String,
        default: null
    }
}, {
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
