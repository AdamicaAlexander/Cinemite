const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { seedDatabase } = require('./utils/dbSeed');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

mongoose.connect('mongodb+srv://cinemite:WEOB9KudoPMyVxaF@cinemite.6scxs.mongodb.net', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
    seedDatabase().catch((err) => {console.error('Seeding error:', err);});
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.get('/', (req, res) => {
    res.send('Cinemite Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes.router);

const profileRoutes = require('./routes/profile');
app.use('/api/profiles', profileRoutes);

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const titleRoutes = require('./routes/title');
app.use('/api/title', titleRoutes);

const adminTitleRoutes = require('./routes/adminTitle');
app.use('/api/admin/title', adminTitleRoutes);

const genreRoutes = require('./routes/genre');
app.use('/api/genres', genreRoutes);

const browseRoutes = require('./routes/browse');
app.use('/api/browse', browseRoutes);

const watchlistRoutes = require('./routes/watchlist');
app.use('/api/watchlist', watchlistRoutes);
