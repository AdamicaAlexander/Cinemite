const mongoose = require('mongoose');

const TVShowSchema = new mongoose.Schema({
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
    start_date: {
        type: Date,
    },
    finish_date: {
        type: Date,
    },
});

module.exports = mongoose.model('TVShows', TVShowSchema);
