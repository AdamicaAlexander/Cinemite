const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authMiddleware } = require('./auth');

const User = require('../models/users');
const MovieWatchlist = require('../models/movie_watchlist');
const TVShowWatchlist = require('../models/tv_show_watchlist');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
    },
});

const upload = multer({storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowed.includes(file.mimetype)) {
            const err = new Error('Only PNG or JPG files allowed');
            err.status = 400;
            return cb(err);
        }
        cb(null, true);
    },
});

router.put(
    '/description',
    authMiddleware,
    [
        body('description')
            .trim()
            .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        try {
            const userId = req.user._id;
            const { description } = req.body;

            const updatedUser = await User.findByIdAndUpdate(userId, { description }, { new: true }).select('-password_hash');

            res.json({ message: 'Description updated', user: updatedUser });
        } catch (err) {
            res.status(500).json({ message: 'Server error', err: err.message });
        }
    }
);

router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
        try {
            let filePath = req.file.path.replace(/\\/g, '/');

            const userId = req.user._id;
            let user = await User.findById(userId);

            if (user.profilePictureUrl && user.profilePictureUrl !== '/assets/profile-icon.png') {
                const oldPath = user.profilePictureUrl;
                if (oldPath.startsWith('uploads/')) {
                    fs.unlink(oldPath, (err) => {
                        if (err) console.error('Error deleting old profile picture:', err);
                    });
                }
            }

            user.profilePictureUrl = filePath;
            await user.save();

            const updatedUser = await User.findById(userId).select('-password_hash');
            return res.json({ message: 'Profile picture uploaded', user: updatedUser });
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

router.delete('/profile-picture', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        let user = await User.findById(userId);

        if (user.profilePictureUrl && user.profilePictureUrl.startsWith('uploads/')) {
            fs.unlink(user.profilePictureUrl, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        user.profilePictureUrl = '/assets/profile-icon.png';
        await user.save();

        const updatedUser = await User.findById(userId).select('-password_hash');
        res.json({message: 'Profile picture cleared', user: updatedUser,});
    } catch (err) {
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

router.put(
    '/password',
    authMiddleware,
    [
        body('oldPassword')
            .notEmpty().withMessage('Old password is required'),
        body('newPassword')
            .notEmpty().withMessage('New password is required')
            .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
            .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
            .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
            .matches(/[0-9]/).withMessage('New password must contain at least one digit')
            .matches(/[@$!%*?&]/).withMessage('New password must contain at least one special character'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        try {
            const userId = req.user._id;
            const { oldPassword, newPassword } = req.body;

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await user.isValidPassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password incorrect' });
            }

            user.password_hash = newPassword;
            await user.save();

            res.json({ message: 'Password updated' });
        } catch (err) {
            res.status(500).json({ message: 'Server error', err: err.message });
        }
    }
);

router.delete('/movies', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        await MovieWatchlist.deleteMany({ user: userId });

        res.json({ message: 'Movies cleared' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

router.delete('/tvshows', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        await TVShowWatchlist.deleteMany({ user: userId });

        res.json({ message: 'TV shows cleared' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

router.delete('/account', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);
        await MovieWatchlist.deleteMany({ user: userId });
        await TVShowWatchlist.deleteMany({ user: userId });

        res.json({ message: 'User account deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

module.exports = router;
