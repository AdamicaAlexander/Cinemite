const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true,
        maxlength: 255,
    },
    description: {
        type: String,
    },
    rating: {
        type: Number,
    },
    poster_url: {
        type: String,
    },
    release_date: {
        type: Date,
    },
    duration_minutes: {
        type: Number,
    },
});

module.exports = mongoose.model('Movies', MovieSchema);
