const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users');

const router = express.Router();
const JWT_SECRET = 'WEOB9KudoPMyVxaF';

// Helper function: Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '1d',
        algorithm: 'HS256'
    });
};

// Middleware: Authentication
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

// Middleware: Admin Authorization
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Register a New User
router.post('/registration', async (req, res) => {
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
        res.status(500).json({
            message: 'Registration failed',
            error: error.message,
        });
    }
});

// Login a User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
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
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Login failed',
            error: error.message,
        });
    }
});

// Protected Route: User Profile
router.get('/profile', authMiddleware, (req, res) => {
    res.json({
        message: 'Access to protected route',
        user: req.user,
    });
});

module.exports = {
    router,
    authMiddleware,
    adminMiddleware,
};
