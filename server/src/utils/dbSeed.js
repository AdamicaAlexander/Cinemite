const User = require('../models/users');
const Genre = require('../models/genres');

const ADMIN_USER = {
    username: 'Admin',
    email: 'admin@cinemite.com',
    password: 'Admin00#',
    role: 'admin',
};

const GENRES = [
    'Action','Animation','Adventure','Comedy','Crime','Documentary','Drama','Family','Fantasy',
    'History','Horror','Music','Mystery','Psychological','Romance','Sci-Fi','Sport','Supernatural',
    'Thriller','War'
];

async function seedDatabase() {
    for (const name of GENRES) {
        await Genre.findOneAndUpdate(
            { name },
            { name },
            { upsert: true, new: true }
        );
    }
    console.log('Genres table seeded/updated.');

    let adminUser = await User.findOne({ username: ADMIN_USER.username });
    if (!adminUser) {
        console.log('Admin user not found, creating one...');
        adminUser = new User({
            username: ADMIN_USER.username,
            email: ADMIN_USER.email,
            password_hash: ADMIN_USER.password,
            role: 'admin',
        });
        await adminUser.save();
        console.log('Admin user created!');
    } else {
        console.log('Admin user already exists!');
    }

    console.log('Database seeding complete.');
}

module.exports = { seedDatabase };
