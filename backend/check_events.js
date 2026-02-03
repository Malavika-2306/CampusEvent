const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const listEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const events = await Event.find({}, '_id title');
        console.log("EVENTS_FOUND:", JSON.stringify(events));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listEvents();
