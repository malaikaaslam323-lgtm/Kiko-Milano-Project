const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    sentCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'Sent successfully'
    }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
