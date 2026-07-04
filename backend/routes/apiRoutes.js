const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const adminController = require('../controllers/adminController'); // ✨ ADD THIS IMPORT
const { verifyToken } = require('../middleware/apiAuth');
const upload = require('../middleware/upload'); // ✨ Multipart file upload middleware

// --- PUBLIC ROUTES ---
router.post('/auth/login', apiController.login);
router.post('/auth/register', apiController.register); // ✨ Added API registration route
router.get('/products', apiController.getProducts);
router.get('/products/:id', apiController.getProductById);
router.post('/newsletter/subscribe', apiController.subscribeNewsletter); // ✨ Newsletter subscription route
router.get('/settings', apiController.getSettings); // ✨ Public settings route to fetch discounts

// ✨ ADD THIS NEW ROUTE FOR YOUR SALES DASHBOARD POLLING ✨
// Note: We leave it public or use session auth since the dashboard jQuery calls it directly
router.get('/sales-data', adminController.getLiveSalesData); 

// --- PROTECTED ROUTES ---
router.get('/user/profile', verifyToken, apiController.getUserProfile);
router.post('/orders', verifyToken, apiController.submitOrder);
router.get('/user/orders', verifyToken, apiController.getUserOrders); // ✨ Get order history
router.post('/user/update-profile', verifyToken, apiController.updateUserProfile); // ✨ Update name/password

// --- ADMIN CONTROL PANEL ROUTES (verifyToken protected, admin verified in controllers) ---
router.get('/admin/dashboard', verifyToken, apiController.getAdminDashboardData);
router.get('/admin/orders', verifyToken, apiController.getAdminOrders);
router.post('/admin/orders/status/:id', verifyToken, apiController.updateOrderStatus);
router.get('/admin/users', verifyToken, apiController.getAdminUsers);
router.get('/admin/reviews', verifyToken, apiController.getAdminReviews);
router.post('/admin/reviews/delete/:id', verifyToken, apiController.deleteReview);
router.post('/admin/product/delete/:id', verifyToken, apiController.deleteProduct); // ✨ Stateless product deletion endpoint
router.post('/admin/product/add', verifyToken, upload.single('image'), apiController.addAdminProduct); // ✨ Add product endpoint
router.post('/admin/product/edit/:id', verifyToken, upload.single('image'), apiController.editAdminProduct); // ✨ Edit product endpoint
router.get('/admin/newsletter', verifyToken, apiController.getAdminNewsletter); // ✨ Fetch newsletter list
router.post('/admin/newsletter/send-campaign', verifyToken, apiController.sendAdminCampaign); // ✨ Post campaign send
router.post('/admin/settings', verifyToken, apiController.updateSettings); // ✨ Admin update global settings

module.exports = router;