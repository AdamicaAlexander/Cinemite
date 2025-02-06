const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { authMiddleware } = require('./auth');
const { recalcMovieRating, recalcTVShowRating } = require('../utils/ratingRecalculation');

const Movie = require('../models/movies');
const TVShow = require('../models/tv_shows');
const MovieWatchlist = require('../models/movie_watchlist');
const TVShowWatchlist = require('../models/tv_show_watchlist');
const MovieGenre = require('../models/movie_genres');
const TVShowGenre = require('../models/tv_show_genres');
const Genre = require('../models/genres');

function getModels(type) {
    if (type === 'movie') {
        return {
            mainModel: Movie,
            watchlistModel: MovieWatchlist,
            queryKey: 'movie',
        };
    } else if (type === 'tvshow') {
        return {
            mainModel: TVShow,
            watchlistModel: TVShowWatchlist,
            queryKey: 'tv_show',
        };
    }
    return null;
}

router.post('/:type/:titleName', authMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const userId = req.user._id;

        const models = getModels(type);
        if (!models) {
            return res.status(400).json({ message: 'Invalid type. Must be "movie" or "tvshow".' });
        }

        const { mainModel, watchlistModel, queryKey } = models;

        const doc = await mainModel.findOne({ title: decodeURIComponent(titleName) });
        if (!doc) {
            return res.status(404).json({ message: 'Title not found' });
        }

        let watchlistItem = await watchlistModel.findOne({ user: userId, [queryKey]: doc._id });
        if (watchlistItem) {
            return res.json({
                message: 'Title already in watchlist',
                status: watchlistItem.status,
            });
        }

        watchlistItem = new watchlistModel({
            user: userId,
            [queryKey]: doc._id,
            status: 'Planning',
            added_at: new Date(),
        });
        await watchlistItem.save();

        return res.status(201).json({
            message: 'Title added to watchlist',
            status: watchlistItem.status,
        });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:type/:titleName', authMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const userId = req.user._id;

        const models = getModels(type);
        if (!models) {
            return res.status(400).json({ message: 'Invalid type. Must be "movie" or "tvshow".' });
        }

        const { mainModel, watchlistModel, queryKey } = models;
        const { status, rating } = req.body;

        const doc = await mainModel.findOne({ title: decodeURIComponent(titleName) });
        if (!doc) {
            return res.status(404).json({ message: 'Title not found' });
        }

        const watchlistItem = await watchlistModel.findOne({ user: userId, [queryKey]: doc._id });
        if (!watchlistItem) {
            return res.status(404).json({ message: 'Watchlist item not found' });
        }

        if (status !== undefined) {
            watchlistItem.status = status;
        }
        if (rating !== undefined) {
            watchlistItem.rating = rating;
        }
        await watchlistItem.save();

        if (rating !== undefined) {
            if (type === 'movie') {
                await recalcMovieRating(doc._id);
            } else if (type === 'tvshow') {
                await recalcTVShowRating(doc._id);
            }
        }

        return res.json({
            message: 'Watchlist item updated',
            status: watchlistItem.status,
            rating: watchlistItem.rating,
        });
    } catch (error) {
        console.error('Error updating watchlist item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:type/:titleName', authMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const userId = req.user._id;

        const models = getModels(type);
        if (!models) {
            return res.status(400).json({ message: 'Invalid type. Must be "movie" or "tvshow".' });
        }

        const { mainModel, watchlistModel, queryKey } = models;

        const doc = await mainModel.findOne({ title: decodeURIComponent(titleName) });
        if (!doc) {
            return res.status(404).json({ message: 'Title not found' });
        }

        const watchlistItem = await watchlistModel.findOne({ user: userId, [queryKey]: doc._id }).lean();
        if (!watchlistItem) {
            return res.json({ status: null });
        }

        return res.json({ status: watchlistItem.status });
    } catch (error) {
        console.error('Error fetching watchlist item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:type/:titleName', authMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const userId = req.user._id;

        const models = getModels(type);
        if (!models) {
            return res.status(400).json({ message: 'Invalid type. Must be "movie" or "tvshow".' });
        }

        const { mainModel, watchlistModel, queryKey } = models;

        const doc = await mainModel.findOne({ title: decodeURIComponent(titleName) });
        if (!doc) {
            return res.status(404).json({ message: 'Title not found' });
        }

        const result = await watchlistModel.deleteOne({ user: userId, [queryKey]: doc._id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Watchlist item not found or already removed' });
        }

        return res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Error deleting watchlist item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/movies', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { search, genre, year, status, sort } = req.query;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const pipeline = [
            { $match: { user: new mongoose.Types.ObjectId(userId) } },

            {
                $lookup: {
                    from: 'movies',
                    localField: 'movie',
                    foreignField: '_id',
                    as: 'movieData'
                }
            },

            { $unwind: '$movieData' },

            {
                $lookup: {
                    from: 'moviegenres',
                    localField: 'movieData._id',
                    foreignField: 'movie',
                    as: 'movieGenreAssoc'
                }
            },

            {
                $lookup: {
                    from: 'genres',
                    localField: 'movieGenreAssoc.genre',
                    foreignField: '_id',
                    as: 'genresArr'
                }
            },

            {
                $addFields: {
                    titleName: '$movieData.title',
                    poster_url: '$movieData.poster_url',
                    globalRating: '$movieData.rating',
                    description: '$movieData.description',
                    release_date: '$movieData.release_date',
                    duration_minutes: '$movieData.duration_minutes',
                    genresNames: {
                        $map: {
                            input: '$genresArr',
                            as: 'g',
                            in: '$$g.name'
                        }
                    }
                }
            }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    titleName: { $regex: new RegExp(search, 'i') }
                }
            });
        }

        if (status) {
            pipeline.push({ $match: { status } });
        }

        if (genre) {
            pipeline.push({
                $match: {
                    genresNames: genre
                }
            });
        }

        if (year) {
            const startYear = new Date(`${year}-01-01`);
            const endYear = new Date(`${parseInt(year, 10) + 1}-01-01`);
            pipeline.push({
                $match: {
                    release_date: { $gte: startYear, $lt: endYear }
                }
            });
        }

        let sortStage = {};
        switch (sort) {
            case 'Z-A':
                sortStage.titleName = -1;
                break;
            case 'Rating':
                sortStage.globalRating = -1;
                break;
            case 'Latest':
                sortStage.release_date = -1;
                break;
            default:
                sortStage.titleName = 1;
        }
        pipeline.push({ $sort: sortStage });

        const skipCount = (page - 1) * limit;
        pipeline.push({ $skip: skipCount });
        pipeline.push({ $limit: limit });

        const results = await MovieWatchlist.aggregate(pipeline).exec();
        res.json(results);
    } catch (err) {
        console.error('Error fetching movies watchlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/tvshows', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { search, genre, year, status, sort } = req.query;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const pipeline = [
            { $match: { user: new mongoose.Types.ObjectId(userId) } },

            {
                $lookup: {
                    from: 'tvshows',
                    localField: 'tv_show',
                    foreignField: '_id',
                    as: 'tvData'
                }
            },

            { $unwind: '$tvData' },

            {
                $lookup: {
                    from: 'tvshowgenres',
                    localField: 'tvData._id',
                    foreignField: 'tv_show',
                    as: 'tvGenreAssoc'
                }
            },

            {
                $lookup: {
                    from: 'genres',
                    localField: 'tvGenreAssoc.genre',
                    foreignField: '_id',
                    as: 'genresArr'
                }
            },

            {
                $addFields: {
                    titleName: '$tvData.title',
                    poster_url: '$tvData.poster_url',
                    globalRating: '$tvData.rating',
                    description: '$tvData.description',
                    start_date: '$tvData.start_date',
                    finish_date: '$tvData.finish_date',
                    genresNames: {
                        $map: {
                            input: '$genresArr',
                            as: 'g',
                            in: '$$g.name'
                        }
                    }
                }
            }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    titleName: { $regex: new RegExp(search, 'i') }
                }
            });
        }

        if (status) {
            pipeline.push({ $match: { status } });
        }

        if (genre) {
            pipeline.push({
                $match: {
                    genresNames: genre
                }
            });
        }

        if (year) {
            const startYear = new Date(`${year}-01-01`);
            const endYear = new Date(`${parseInt(year, 10) + 1}-01-01`);
            pipeline.push({
                $match: {
                    start_date: { $gte: startYear, $lt: endYear }
                }
            });
        }

        let sortStage = {};
        switch (sort) {
            case 'Z-A':
                sortStage.titleName = -1;
                break;
            case 'Rating':
                sortStage.globalRating = -1;
                break;
            case 'Latest':
                sortStage.start_date = -1;
                break;
            default:
                sortStage.titleName = 1;
        }
        pipeline.push({ $sort: sortStage });

        const skipCount = (page - 1) * limit;
        pipeline.push({ $skip: skipCount });
        pipeline.push({ $limit: limit });

        const results = await TVShowWatchlist.aggregate(pipeline).exec();
        res.json(results);
    } catch (err) {
        console.error('Error fetching tvshows watchlist:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
