const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const { auth, admin } = require('../middleware/authMiddleware');

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/events
// @desc    Create an event
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
    const { title, description, date, venue } = req.body;

    try {
        const newEvent = new Event({
            title,
            description,
            date,
            venue,
            createdBy: req.user.id
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
    const { title, description, date, venue } = req.body;

    const eventFields = {};
    if (title) eventFields.title = title;
    if (description) eventFields.description = description;
    if (date) eventFields.date = date;
    if (venue) eventFields.venue = venue;

    try {
        let event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: eventFields },
            { new: true }
        );

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        await Event.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


const Registration = require('../models/Registration');

// @route   POST /api/events/:id/register
// @desc    Register for an event with details
// @access  Public (Guest or Student)
router.post('/:id/register', async (req, res) => {
    const { name, email, department, phoneNumber } = req.body;

    // Simple validation
    if (!name || !email || !department || !phoneNumber) {
        return res.status(400).json({ msg: 'Name, Email, Department, and Phone Number are required' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Optional: Get User from token if they ARE logged in
        let userId = null;
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Ignore invalid token for guest registration
            }
        }

        // Check if already registered by email or user
        const query = { event: req.params.id, $or: [{ email }] };
        if (userId) query.$or.push({ user: userId });

        const existingReg = await Registration.findOne(query);
        if (existingReg) {
            return res.status(400).json({ msg: 'You are already registered for this event' });
        }

        // Create Registration
        const newRegistration = new Registration({
            event: req.params.id,
            user: userId,
            name,
            email,
            department,
            phoneNumber
        });
        await newRegistration.save();

        // Update Event model if user is logged in
        if (userId && !event.registeredStudents.includes(userId)) {
            event.registeredStudents.push(userId);
            await event.save();
        }

        res.json(newRegistration);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/events/:id/unregister
// @desc    Cancel registration for an event
// @access  Public
router.delete('/:id/unregister', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        let userId = null;
        let email = req.query.email; // Guests might need to provide email since they aren't logged in

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) { }
        }

        const query = { event: req.params.id };
        if (userId) {
            query.user = userId;
        } else if (email) {
            query.email = email;
        } else {
            return res.status(400).json({ msg: 'User ID or Email is required to unregister' });
        }

        const registration = await Registration.findOne(query);
        if (!registration) {
            return res.status(404).json({ msg: 'Registration not found' });
        }

        await Registration.deleteOne({ _id: registration._id });

        // Update Event model if user is logged in
        if (userId) {
            event.registeredStudents = event.registeredStudents.filter(s => s.toString() !== userId);
            await event.save();
        }

        res.json({ msg: 'Registration cancelled' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/events/myevents
// @desc    Get user registered events
// @access  Private
router.get('/myevents', auth, async (req, res) => {
    try {
        // Find registrations for this user and populate event details
        const registrations = await Registration.find({ user: req.user.id }).populate('event').sort({ registeredAt: -1 });

        // Transform to just return valid events (incase event was deleted)
        const events = registrations
            .filter(reg => reg.event) // Filter out null events if deleted
            .map(reg => ({
                ...reg.event._doc,
                registrationDetails: {
                    name: reg.name,
                    email: reg.email,
                    department: reg.department,
                    phoneNumber: reg.phoneNumber,
                    registeredAt: reg.registeredAt
                }
            }));

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
