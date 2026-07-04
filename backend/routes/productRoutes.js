const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getHome);
router.get('/contact-us', productController.getContact);
router.get('/products', productController.getProducts);

module.exports = router;