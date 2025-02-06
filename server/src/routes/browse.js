const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Movie = require('../models/movies');
const TVShow = require('../models/tv_shows');
const MovieGenre = require('../models/movie_genres');
const TVShowGenre = require('../models/tv_show_genres');

router.get('/', async (req, res) => {
    try {
        const { term } = req.query;
        if (!term) {
            return res.json({ movies: [], tvshows: [] });
        }

        const searchRegex = new RegExp(term, 'i');

        const [movies, tvshows] = await Promise.all([
            Movie.find({ title: { $regex: searchRegex } })
                .sort({ title: 1 })
                .limit(10)
                .select('title poster_url'),
            TVShow.find({ title: { $regex: searchRegex } })
                .sort({ title: 1 })
                .limit(10)
                .select('title poster_url'),
        ]);

        return res.json({ movies, tvshows });
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { search, genre, year, sort, page = 1, limit = 20 } = req.query;
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);

        let Model, lookupCollection, localField, foreignField, lookupAlias, dateField;
        if (type === 'movies') {
            Model = Movie;
            lookupCollection = 'moviegenres';
            localField = '_id';
            foreignField = 'movie';
            lookupAlias = 'movieGenreAssociations';
            dateField = 'release_date';
        } else if (type === 'tvshows') {
            Model = TVShow;
            lookupCollection = 'tvshowgenres';
            localField = '_id';
            foreignField = 'tv_show';
            lookupAlias = 'tvGenreAssociations';
            dateField = 'start_date';
        } else {
            return res.status(400).json({ message: 'Invalid type parameter' });
        }

        const matchCriteria = {};
        if (search) {
            matchCriteria.title = { $regex: new RegExp(search, 'i') };
        }
        if (year) {
            const startYear = new Date(`${year}-01-01`);
            const endYear = new Date(`${parseInt(year, 10) + 1}-01-01`);
            matchCriteria[dateField] = { $gte: startYear, $lt: endYear };
        }

        const pipeline = [];
        if (Object.keys(matchCriteria).length > 0) {
            pipeline.push({ $match: matchCriteria });
        }

        pipeline.push({
            $lookup: {
                from: lookupCollection,
                localField: localField,
                foreignField: foreignField,
                as: lookupAlias,
            }
        });

        pipeline.push({
            $lookup: {
                from: 'genres',
                localField: `${lookupAlias}.genre`,
                foreignField: '_id',
                as: 'genres',
            }
        });

        if (genre) {
            pipeline.push({
                $match: { 'genres.name': genre }
            });
        }

        let sortStage = {};
        if (sort === 'A-Z') {
            sortStage.title = 1;
        } else if (sort === 'Z-A') {
            sortStage.title = -1;
        } else if (sort === 'Rating') {
            sortStage.rating = -1;
        } else if (sort === 'Latest') {
            sortStage[dateField] = -1;
        } else {
            sortStage.title = 1;
        }
        pipeline.push({ $sort: sortStage });

        pipeline.push({ $skip: (numericPage - 1) * numericLimit });
        pipeline.push({ $limit: numericLimit });

        pipeline.push({
            $project: {
                title: 1,
                poster_url: 1,
                rating: 1,
                year: { $year: `$${dateField}` },
                genres: { $map: { input: '$genres', as: 'g', in: '$$g.name' } },
            }
        });

        const results = await Model.aggregate(pipeline);
        return res.json(results);
    } catch (err) {
        console.error('Error in browse route:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
