const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        maxlength: 50,
    },
});

module.exports = mongoose.model('Genres', GenreSchema);
