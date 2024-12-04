const mongoose = require('mongoose');

const MovieGenreSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movies',
        required: true,
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genres',
        required: true,
    },
});

module.exports = mongoose.model('MovieGenres', MovieGenreSchema);
