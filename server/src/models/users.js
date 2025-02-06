const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        maxlength: 100,
    },
    password_hash: {
        type: String,
        required: true,
    },
    profilePictureUrl: {
        type: String,
        default: '/assets/profile-icon.png',
    },
    description: {
        type: String,
        default: '',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.isValidPassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('Users', UserSchema);
