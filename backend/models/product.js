const mongoose = require('mongoose');

// Define the Schema (Blueprint) for a product
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Added image so it looks good on the frontend
    description: { type: String },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    stock: { type: Number, default: 10 },
    shades: { type: [String], default: [] },
    ingredients: { type: String, default: '' }
});

// Export the model so other files can use it
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);