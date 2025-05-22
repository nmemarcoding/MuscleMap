const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true
    },
    passwordHash: { 
        type: String, 
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    birthDate: {
        type: Date,
        default: null
    },
    heightCm: {
        type: Number,
        default: null
    },
    weightKg: {
        type: Number,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Method to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;