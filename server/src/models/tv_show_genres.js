const mongoose = require('mongoose');

const TVShowGenreSchema = new mongoose.Schema({
    tv_show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TVShows',
        required: true,
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genres',
        required: true,
    },
});

module.exports = mongoose.model('TVShowGenres', TVShowGenreSchema);
