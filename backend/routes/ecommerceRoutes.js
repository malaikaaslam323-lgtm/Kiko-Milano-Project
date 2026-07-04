const express = require('express');
const router = express.Router();
const ecommerceController = require('../controllers/ecommerceController');
const { isLoggedIn } = require('../middleware/authGuard');

// --- PRODUCT DETAILS PAGE ---
router.get('/products/:id', ecommerceController.getProductDetail);

// --- SHOPPING CART ---
router.get('/cart', ecommerceController.getCart);
router.post('/cart/add', ecommerceController.addToCart);
router.post('/cart/update', ecommerceController.updateCart);
router.post('/cart/remove', ecommerceController.removeFromCart);

// --- CHECKOUT ---
router.get('/checkout', isLoggedIn, ecommerceController.getCheckout);
router.post('/checkout/submit', isLoggedIn, ecommerceController.submitCheckout);

// --- CUSTOMER DASHBOARD ---
router.get('/dashboard', isLoggedIn, ecommerceController.getDashboard);

// --- MY ACCOUNT / PROFILE ---
router.get('/my-account', isLoggedIn, ecommerceController.getMyAccount);
router.post('/my-account/update-profile', isLoggedIn, ecommerceController.updateProfile);

// --- FAVORITES SYSTEM ---
router.get('/favorites', ecommerceController.getFavorites);
router.post('/favorites/toggle', ecommerceController.toggleFavorite);

// --- REVIEWS SYSTEM ---
router.post('/products/:id/reviews', isLoggedIn, ecommerceController.postProductReview);

module.exports = router;
