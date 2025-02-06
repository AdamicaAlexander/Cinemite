const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/users');

const JWT_SECRET = 'WEOB9KudoPMyVxaF';

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '1d',
        algorithm: 'HS256'
    });
};

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                message: 'Authentication token required',
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });

        const user = await User.findById(decoded.userId).select('-password_hash');
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
                error: 'Invalid authentication token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired',
                error: 'Please log in again'
            });
        }
        res.status(401).json({
            message: 'Authentication failed',
            error: error.message,
        });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

router.post(
    '/registration',
    [
        body('username')
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
            .matches(/^[a-zA-Z0-9_]+$/).withMessage('Only letters, numbers, and underscores are allowed'),

        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),

        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one digit')
            .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character')
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
            const { username, email, password } = req.body;

            const existingUser = await User.findOne({
                $or: [{ email }, { username }],
            });

            if (existingUser) {
                return res.status(400).json({
                    message: 'User already exists with this email or username',
                });
            }

            const newUser = new User({
                username,
                email,
                password_hash: password,
            });

            await newUser.save();

            const token = generateToken(newUser._id);
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Registration failed: Mongoose validation error',
                    error: error.message,
                });
            }

            if (error.code === 11000) {
                return res.status(400).json({
                    message: 'Username or email already exists',
                });
            }

            res.status(500).json({
                message: 'Registration failed',
                error: error.message,
            });
        }
    }
);

router.post(
    '/login',
    [
        body('loginField')
            .notEmpty().withMessage('Username or Email is required')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),

        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
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
            const { loginField, password } = req.body;

            const user = await User.findOne({
                $or: [{ email: loginField }, { username: loginField }]
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const isMatch = await user.isValidPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = generateToken(user._id);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePictureUrl: user.profilePictureUrl,
                    description: user.description,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Login failed',
                error: error.message,
            });
        }
    }
);

module.exports = {
    router,
    authMiddleware,
    adminMiddleware,
};
