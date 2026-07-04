const mongoose = require('mongoose');

// 1. Define the Blueprint (Schema)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // CRITICAL: Prevents duplicate accounts
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'customer' // CRITICAL: Defaults everyone to a standard user
    }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' dates

// 2. Export the Blueprint so the rest of your app can use it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);