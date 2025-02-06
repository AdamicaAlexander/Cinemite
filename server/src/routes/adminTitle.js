const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('./auth');

const Movie = require('../models/movies');
const TVShow = require('../models/tv_shows');
const Genre = require('../models/genres');
const MovieGenre = require('../models/movie_genres');
const TVShowGenre = require('../models/tv_show_genres');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only PNG or JPG files allowed'), false);
        }
        cb(null, true);
    },
});

const getModel = (type) => {
    if (type === 'movie') return Movie;
    if (type === 'tvshow') return TVShow;
    return null;
};

router.get('/:type/:titleName', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid type parameter' });

        const doc = await Model.findOne({ title: decodeURIComponent(titleName) }).lean();
        if (!doc) return res.status(404).json({ message: 'Title not found' });

        return res.json(doc);
    } catch (error) {
        console.error('Error fetching title:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:type', authMiddleware, adminMiddleware, upload.single('poster'), async (req, res) => {
    try {
        const { type } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid type parameter' });

        const { titleName, description, releaseOrStartDate, durationOrFinish, genres } = req.body;
        let poster_url = '';
        if (req.file) {
            poster_url = req.file.path.replace(/\\/g, '/');
        }

        let newDoc;
        if (type === 'movie') {
            newDoc = new Model({
                title: titleName,
                description: description,
                poster_url: poster_url,
                release_date: releaseOrStartDate ? new Date(releaseOrStartDate) : null,
                duration_minutes: durationOrFinish ? Number(durationOrFinish) : null,
            });
        } else if (type === 'tvshow') {
            newDoc = new Model({
                title: titleName,
                description: description,
                poster_url: poster_url,
                start_date: releaseOrStartDate ? new Date(releaseOrStartDate) : null,
                finish_date: durationOrFinish ? new Date(durationOrFinish) : null,
            });
        }

        await newDoc.save();

        if (genres) {
            let genresArray = [];
            try {
                genresArray = JSON.parse(genres);
            } catch (e) {
                console.error('Error parsing genres:', e);
            }

            if (type === 'movie') {
                for (const genreName of genresArray) {
                    const genreDoc = await Genre.findOne({ name: genreName });
                    if (genreDoc) {
                        const newAssociation = new MovieGenre({
                            movie: newDoc._id,
                            genre: genreDoc._id,
                        });
                        await newAssociation.save();
                    }
                }
            } else if (type === 'tvshow') {
                for (const genreName of genresArray) {
                    const genreDoc = await Genre.findOne({ name: genreName });
                    if (genreDoc) {
                        const newAssociation = new TVShowGenre({
                            tv_show: newDoc._id,
                            genre: genreDoc._id,
                        });
                        await newAssociation.save();
                    }
                }
            }
        }

        return res.status(201).json({
            message: 'Title added successfully',
            title: newDoc.title,
            _id: newDoc._id,
        });
    } catch (error) {
        console.error('Error adding title:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Title already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:type/:titleName', authMiddleware, adminMiddleware, upload.single('poster'), async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid type parameter' });

        const existingDoc = await Model.findOne({ title: decodeURIComponent(titleName) });
        if (!existingDoc) return res.status(404).json({ message: 'Title not found' });

        const { titleName: newTitle, description, releaseOrStartDate, durationOrFinish, genres } = req.body;
        if (newTitle) existingDoc.title = newTitle;
        if (description !== undefined) existingDoc.description = description;

        if (req.file) {
            if (existingDoc.poster_url && fs.existsSync(existingDoc.poster_url)) {
                fs.unlink(existingDoc.poster_url, (err) => {
                    if (err) console.error('Error deleting old poster:', err);
                });
            }
            existingDoc.poster_url = req.file.path.replace(/\\/g, '/');
        }
        if (type === 'movie') {
            if (releaseOrStartDate) existingDoc.release_date = new Date(releaseOrStartDate);
            if (durationOrFinish) existingDoc.duration_minutes = Number(durationOrFinish);
        } else if (type === 'tvshow') {
            if (releaseOrStartDate) existingDoc.start_date = new Date(releaseOrStartDate);
            if (durationOrFinish) existingDoc.finish_date = new Date(durationOrFinish);
        }

        await existingDoc.save();

        if (genres) {
            let genresArray = [];
            try {
                genresArray = JSON.parse(genres);
            } catch (e) {
                console.error('Error parsing genres:', e);
            }

            if (type === 'movie') {
                await MovieGenre.deleteMany({ movie: existingDoc._id });
                for (const genreName of genresArray) {
                    const genreDoc = await Genre.findOne({ name: genreName });
                    if (genreDoc) {
                        const newAssociation = new MovieGenre({
                            movie: existingDoc._id,
                            genre: genreDoc._id,
                        });
                        await newAssociation.save();
                    }
                }
            } else if (type === 'tvshow') {
                await TVShowGenre.deleteMany({ tv_show: existingDoc._id });
                for (const genreName of genresArray) {
                    const genreDoc = await Genre.findOne({ name: genreName });
                    if (genreDoc) {
                        const newAssociation = new TVShowGenre({
                            tv_show: existingDoc._id,
                            genre: genreDoc._id,
                        });
                        await newAssociation.save();
                    }
                }
            }
        }

        return res.json({
            message: 'Title updated successfully',
            title: existingDoc.title,
            _id: existingDoc._id,
        });
    } catch (error) {
        console.error('Error updating title:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/:type/:titleName', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { type, titleName } = req.params;
        const Model = getModel(type);
        if (!Model) return res.status(400).json({ message: 'Invalid type parameter' });

        const doc = await Model.findOne({ title: decodeURIComponent(titleName) });
        if (!doc) return res.status(404).json({ message: 'Title not found' });

        if (doc.poster_url && fs.existsSync(doc.poster_url)) {
            fs.unlink(doc.poster_url, (err) => {
                if (err) console.error('Error deleting poster file:', err);
            });
        }

        if (type === 'movie') {
            await MovieGenre.deleteMany({ movie: doc._id });
        } else if (type === 'tvshow') {
            await TVShowGenre.deleteMany({ tv_show: doc._id });
        }

        await Model.deleteOne({ _id: doc._id });
        return res.json({ message: 'Title deleted successfully' });
    } catch (error) {
        console.error('Error deleting title:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
