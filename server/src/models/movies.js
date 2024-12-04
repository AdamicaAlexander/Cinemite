const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 255,
    },
    release_date: {
        type: Date,
    },
    duration_minutes: {
        type: Number,
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
});

module.exports = mongoose.model('Movies', MovieSchema);
