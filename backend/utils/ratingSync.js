const Product = require('../models/product');
const Review = require('../models/review');

/**
 * Recalculates and updates the rating and reviewsCount of all products
 * in the database based on existing reviews.
 */
async function syncProductRatings() {
    try {
        const products = await Product.find();
        for (const product of products) {
            const reviews = await Review.find({ product: product._id });
            const reviewsCount = reviews.length;
            let rating = 0;
            if (reviewsCount > 0) {
                const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;
                rating = Math.round(avg * 10) / 10;
            }
            await Product.findByIdAndUpdate(product._id, { rating, reviewsCount });
        }
        console.log('✅ Product ratings and reviews counts successfully synchronized!');
    } catch (err) {
        console.error('❌ Error synchronizing product ratings:', err);
    }
}

module.exports = {
    syncProductRatings
};
