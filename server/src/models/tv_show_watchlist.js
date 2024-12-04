const mongoose = require('mongoose');

const TVShowWatchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    tv_show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TVShows',
        required: true,
    },
    status: {
        type: String,
        enum: ['Planning', 'Completed', 'Dropped', 'Watching', 'Paused'],
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

module.exports = mongoose.model('TVShowWatchlist', TVShowWatchlistSchema);
