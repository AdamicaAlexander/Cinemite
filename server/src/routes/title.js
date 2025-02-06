const express = require('express');
const router = express.Router();

const Movie = require('../models/movies');
const TVShow = require('../models/tv_shows');

router.get('/:type/:titleName', async (req, res) => {
    try {
        const { type, titleName } = req.params;

        let doc = null;
        if (type === 'movie') {
            doc = await Movie.findOne({ title: titleName }).lean();
        } else if (type === 'tvshow') {
            doc = await TVShow.findOne({ title: titleName }).lean();
        } else {
            return res.status(400).json({ message: 'Invalid type parameter. Must be "movie" or "tvshow".' });
        }

        if (!doc) {
            return res.status(404).json({ message: 'Title not found' });
        }

        return res.json({
            _id: doc._id,
            title: doc.title,
            description: doc.description,
            rating: doc.rating,
            genres: doc.genres || [],
            poster_url: doc.poster_url,
            release_date: doc.release_date,
            duration_minutes: doc.duration_minutes,
            start_date: doc.start_date,
            finish_date: doc.finish_date,
        });

    } catch (error) {
        console.error('Error fetching title data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
