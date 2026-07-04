const mongoose = require('mongoose');

// 1. Blueprint for individual items inside the shopping cart
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links to your existing Product model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
        // NOTE: We save the price here so if the product price changes 
        // in the future, it doesn't mess up our historical sales math!
    }
});

// 2. Main Order Blueprint
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to your existing User model
        required: true
    },
    items: [orderItemSchema], // Array of items bought in this specific order
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    shippingAddress: {
        type: String
    },
    phone: {
        type: String
    },
    recipientName: {
        type: String
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    }
}, { 
    timestamps: true 
    // CRITICAL: This automatically adds 'createdAt' and 'updatedAt'. 
    // We need 'createdAt' to calculate "recent transactions" for the dashboard!
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);