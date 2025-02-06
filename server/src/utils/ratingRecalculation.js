const Movie = require('../models/movies');
const MovieWatchlist = require('../models/movie_watchlist');
const TVShow = require('../models/tv_shows');
const TVShowWatchlist = require('../models/tv_show_watchlist');

async function recalcMovieRating(movieId) {
    const result = await MovieWatchlist.aggregate([
        { $match: { movie: movieId, rating: { $ne: null } } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    let newAvgRating = null;
    if (result.length > 0) {
        newAvgRating = result[0].avgRating;
        newAvgRating = parseFloat(newAvgRating.toFixed(1));
    }

    await Movie.findByIdAndUpdate(movieId, {
        rating: newAvgRating,
    });
}

async function recalcTVShowRating(tvShowId) {
    const result = await TVShowWatchlist.aggregate([
        { $match: { tv_show: tvShowId, rating: { $ne: null } } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    let newAvgRating = null;
    if (result.length > 0) {
        newAvgRating = result[0].avgRating;
        newAvgRating = parseFloat(newAvgRating.toFixed(1));
    }

    await TVShow.findByIdAndUpdate(tvShowId, { rating: newAvgRating });
}

module.exports = {
    recalcMovieRating,
    recalcTVShowRating,
};
