const mongoose = require('mongoose');

const TVShowSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 255,
    },
    start_date: {
        type: Date,
    },
    finish_date: {
        type: Date,
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

module.exports = mongoose.model('TVShows', TVShowSchema);
