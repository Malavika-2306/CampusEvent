const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './backend/.env' });

async function inspectUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        console.log('--- User Emails ---');
        users.forEach(user => {
            const original = user.email;
            const normalized = original.trim().toLowerCase();
            const isNormalized = original === normalized;

            console.log(`ID: ${user._id} | Email: "${original}" | Normalized: ${isNormalized ? '✅' : '❌'}`);
        });
        console.log('-------------------');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

inspectUsers();
