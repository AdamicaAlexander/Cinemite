const mongoose = require('mongoose');

const MovieWatchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movies',
        required: true,
    },
    status: {
        type: String,
        enum: ['Planning', 'Completed', 'Dropped'],
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
    },
    added_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MovieWatchlist', MovieWatchlistSchema);
