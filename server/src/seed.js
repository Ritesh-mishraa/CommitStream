import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from './models/Branch.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedDB = async () => {
    try {
        await connectDB();

        // Clear existing
        await Branch.deleteMany();
        await User.deleteMany();

        // Create base users
        const alice = await User.create({ username: 'Alice', avatarColor: '#ec4899' }); // pink
        const bob = await User.create({ username: 'Bob', avatarColor: '#14b8a6' });   // teal

        const branches = [
            {
                name: 'main',
                owner: alice._id,
                filesChanged: ['src/App.jsx', 'package.json'],
                lastCommit: 'Merge pull request #12 from feat/init'
            },
            {
                name: 'feat/auth',
                owner: alice._id,
                filesChanged: ['src/components/UserCard.jsx', 'src/hooks/useAuth.js', 'package-lock.json'],
                lastCommit: 'Add JWT logic'
            },
            {
                name: 'feat/payments',
                owner: bob._id,
                filesChanged: ['src/components/UserCard.jsx', 'src/api/stripe.js'],
                lastCommit: 'Update UserCard to show billing status'
            },
            {
                name: 'chore/deps',
                owner: bob._id,
                filesChanged: ['package.json', 'package-lock.json', 'README.md'],
                lastCommit: 'Bump React to v18.3'
            }
        ];

        await Branch.insertMany(branches);

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error.message}`);
        process.exit(1);
    }
};

seedDB();
