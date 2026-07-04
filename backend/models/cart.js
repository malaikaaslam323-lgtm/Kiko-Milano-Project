const mongoose = require('mongoose');

// Individual cart item representing a product and its selected quantity
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to Product model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

// Cart schema linking a registered user to their persistent cart items
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        unique: true,
        required: true
    },
    items: [cartItemSchema]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Cart', cartSchema);
