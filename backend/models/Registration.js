const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow guest registration
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only register once (if logged in)
// Sparse means it only creates an index entry if the user field exists
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true });

// Optional: Prevent same email from registering for same event twice as guest
RegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
