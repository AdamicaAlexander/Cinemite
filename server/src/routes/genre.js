const express = require('express');
const router = express.Router();

const Genre = require('../models/genres');

router.get('/', async (req, res) => {
    try {
        const genres = await Genre.find({}).lean();
        res.json(genres);
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:type/:titleName', async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const decodedTitle = decodeURIComponent(titleName);

        if (type === 'movie') {
            const Movie = require('../models/movies');
            const MovieGenre = require('../models/movie_genres');

            const movieDoc = await Movie.findOne({ title: decodedTitle });
            if (!movieDoc) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            const associations = await MovieGenre.find({ movie: movieDoc._id }).populate('genre');
            const genreNames = associations.map((assoc) => assoc.genre.name);
            return res.json(genreNames);

        } else if (type === 'tvshow') {
            const TVShow = require('../models/tv_shows');
            const TVShowGenre = require('../models/tv_show_genres');

            const tvDoc = await TVShow.findOne({ title: decodedTitle });
            if (!tvDoc) {
                return res.status(404).json({ message: 'TV Show not found' });
            }

            const associations = await TVShowGenre.find({ tv_show: tvDoc._id }).populate('genre');
            const genreNames = associations.map((assoc) => assoc.genre.name);
            return res.json(genreNames);

        } else {
            return res.status(400).json({ message: 'Invalid type parameter' });
        }
    } catch (err) {
        console.error('Error fetching associated genres:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
