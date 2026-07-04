const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');
const { isAdmin } = require('../middleware/authGuard');

router.get('/', isAdmin, adminController.getDashboard);
router.get('/product/add', isAdmin, adminController.getAddProduct);
// Renders the Sales Dashboard page (Protected by isAdmin middleware)
router.get('/sales', isAdmin, adminController.getSalesDashboard);

router.post('/product/add', isAdmin, upload.single('image'), adminController.postAddProduct);
router.get('/product/edit/:id', isAdmin, adminController.getEditProduct);
router.post('/product/edit/:id', isAdmin, upload.single('image'), adminController.postEditProduct);
router.post('/product/delete/:id', isAdmin, adminController.postDeleteProduct);

// --- ORDER MANAGEMENT ---
router.get('/orders', isAdmin, adminController.getOrders);
router.post('/orders/update-status/:id', isAdmin, adminController.postUpdateOrderStatus);

// --- USER MANAGEMENT ---
router.get('/users', isAdmin, adminController.getUsers);

// --- NEWSLETTER SYSTEM ---
router.get('/newsletter', isAdmin, adminController.getNewsletter);
router.post('/newsletter/send-campaign', isAdmin, adminController.postSendCampaign);

// --- REVIEWS SYSTEM ---
router.get('/reviews', isAdmin, adminController.getReviews);
router.post('/reviews/delete/:id', isAdmin, adminController.postDeleteReview);

module.exports = router;