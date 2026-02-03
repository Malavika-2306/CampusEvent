const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        await User.deleteMany({});
        await Event.deleteMany({});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Admin User',
            email: 'admin@campus.com',
            password: hashedPassword,
            role: 'admin'
        });
        await admin.save();
        console.log('Created Admin: admin@campus.com / admin123');

        
        const hashedStudentPassword = await bcrypt.hash('student123', salt);
        const student = new User({
            name: 'John Student',
            email: 'john@campus.com',
            password: hashedStudentPassword,
            role: 'student'
        });
        await student.save();
        console.log('Created Student: john@campus.com / student123');

        
        const events = [
            {
                title: 'Tech Hackathon 2026',
                description: 'A 24-hour coding marathon to build innovative solutions. Prizes worth $5000!',
                date: new Date(Date.now() + 86400000 * 5), // 5 days from now
                venue: 'Main Auditorium',
                createdBy: admin._id
            },
            {
                title: 'Music Festival',
                description: 'An evening of live music performances by student bands and guest artists.',
                date: new Date(Date.now() + 86400000 * 10), // 10 days from now
                venue: 'Open Air Theatre',
                createdBy: admin._id
            },
            {
                title: 'AI Workshop',
                description: 'Hands-on workshop on Generative AI and LLMs.',
                date: new Date(Date.now() + 86400000 * 2), // 2 days from now
                venue: 'CS Seminar Hall',
                createdBy: admin._id
            },
            {
                title: 'Career Fair',
                description: 'Meet top recruiters from industry giants.',
                date: new Date(Date.now() + 86400000 * 15), 
                venue: 'Campus Gym',
                createdBy: admin._id
            }
        ];

        await Event.insertMany(events);
        console.log(`Created ${events.length} sample events`);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
