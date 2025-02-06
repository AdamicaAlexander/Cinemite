const express = require('express');
const router = express.Router();

const User = require('../models/users');
const MovieWatchlist = require('../models/movie_watchlist');
const TVShowWatchlist = require('../models/tv_show_watchlist');

router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const movieWatchlist = await MovieWatchlist.find({ user: user._id }).lean();

        const totalMovies = movieWatchlist.length;
        let avgMovieRating = null;
        const ratedMovies = movieWatchlist.filter((m) => m.rating !== null);
        if (ratedMovies.length > 0) {
            const sumMovieRatings = ratedMovies.reduce((acc, curr) => acc + curr.rating, 0);
            avgMovieRating = sumMovieRatings / ratedMovies.length;
        }

        const tvShowWatchlist = await TVShowWatchlist.find({ user: user._id }).lean();

        const totalTVShows = tvShowWatchlist.length;
        let avgTVShowRating = null;
        const ratedTVShows = tvShowWatchlist.filter((t) => t.rating !== null);
        if (ratedTVShows.length > 0) {
            const sumTVShowRatings = ratedTVShows.reduce((acc, curr) => acc + curr.rating, 0);
            avgTVShowRating = sumTVShowRatings / ratedTVShows.length;
        }

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePictureUrl: user.profilePictureUrl,
                description: user.description,
                created_at: user.created_at,
            },
            movieStats: {
                total: totalMovies,
                avgRating: avgMovieRating,
            },
            tvShowStats: {
                total: totalTVShows,
                avgRating: avgTVShowRating,
            },
        });

    } catch (error) {
        console.error('Error fetching profile by username:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
