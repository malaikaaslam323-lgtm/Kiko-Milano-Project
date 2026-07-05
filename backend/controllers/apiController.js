const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Newsletter = require('../models/newsletter'); // ✨ Import Newsletter model
require('dotenv').config();

// --- NEWSLETTER SUBSCRIPTION ---
exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || email.trim() === '') {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This email is already subscribed!' });
        }

        const newSubscriber = new Newsletter({ email: email.toLowerCase().trim() });
        await newSubscriber.save();

        res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
    } catch (err) {
        console.error("Newsletter subscription error:", err);
        res.status(500).json({ success: false, message: 'Server error subscribing to newsletter.' });
    }
};

// --- AUTHENTICATION ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Generate the JWT Token (Expires in 1 hour)
        const payload = {
            user_id: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            success: true, 
            message: 'Authentication successful',
            token: token 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// --- PUBLIC ENDPOINTS ---
exports.getProducts = async (req, res) => {
    try {
        let query = {};
        
        // Basic filtering mirroring your EJS logic
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }
        if (req.query.rating) query.rating = { $gte: Number(req.query.rating) };

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find(query).skip(skip).limit(limit);
        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Fetch all reviews for this product and populate customer name
        const Review = require('../models/review');
        const reviews = await Review.find({ product: product._id })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        // Fetch related products (same category, excluding current product, limit to 4)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.json({ 
            success: true, 
            data: product,
            reviews: reviews,
            relatedProducts: relatedProducts
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// --- PROTECTED ENDPOINTS ---
exports.getUserProfile = async (req, res) => {
    try {
        // req.user is populated by the verifyToken middleware
        const user = await User.findById(req.user.user_id).select('-password'); // Exclude password hash
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.submitOrder = async (req, res) => {
    try {
        const { name, address, city, postalCode, phone, paymentMethod, items } = req.body;
        if (!name || !address || !city || !postalCode || !phone || !paymentMethod || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'All delivery and cart fields are required.' });
        }

        const Order = require('../models/order');
        const Product = require('../models/product');

        // 1. Verify stock availability for all items in database
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Stock conflict: "${product.name}" has only ${product.stock} items left.` });
            }
        }

        // 2. Fetch active global discount settings
        const Settings = require('../models/settings');
        let discountSetting = await Settings.findOne({ key: 'globalDiscount' });
        const discountPct = discountSetting ? Number(discountSetting.value) : 0;

        // 3. Decrement Product Stock and calculate totals
        let subtotal = 0;
        const validItems = [];
        for (const item of items) {
            const product = await Product.findById(item._id);
            product.stock -= item.quantity;
            await product.save();
            
            const originalPrice = product.price;
            const finalPrice = discountPct > 0 ? Math.round(originalPrice * (1 - discountPct / 100)) : originalPrice;
            
            subtotal += (finalPrice * item.quantity);
            validItems.push({
                product: product._id,
                quantity: item.quantity,
                price: finalPrice
            });
        }

        const shipping = subtotal > 50000 ? 0 : 250;
        const totalAmount = subtotal + shipping;

        // 3. Save Order to Database
        const order = new Order({
            customer: req.user.user_id,
            items: validItems,
            totalAmount: totalAmount,
            status: 'Pending',
            recipientName: name,
            shippingAddress: `${address}, ${city}, ${postalCode}`,
            phone: phone,
            paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'COD'
        });

        await order.save();

        res.status(201).json({ 
            success: true, 
            message: 'Order placed successfully! Thank you for shopping with us.', 
            orderId: order._id 
        });
    } catch (err) {
        console.error("API submitOrder Error:", err);
        res.status(500).json({ success: false, message: 'Server error processing checkout.', error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'That email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new User({
            name,
            email,
            password: hashedPassword 
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
    } catch (err) {
        console.error("API Registration Error:", err);
        res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const Order = require('../models/order');
        const orders = await Order.find({ customer: req.user.user_id })
            .sort({ createdAt: -1 })
            .populate('items.product');
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching orders', error: err.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.name = name;

        if (password && password.trim().length >= 6) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully!', data: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error updating profile', error: err.message });
    }
};

// --- ADMIN SYSTEM MANAGEMENT API ENDPOINTS ---

exports.getAdminDashboardData = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Product = require('../models/product');
        const Order = require('../models/order');
        const User = require('../models/user');

        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        
        const orders = await Order.find();
        const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        
        const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });
        
        // Dynamic aggregation for top selling products
        const topSelling = await Order.aggregate([
            { $unwind: '$items' },
            { $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.quantity' }
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);
        await Product.populate(topSelling, { path: '_id', select: 'name image price' });

        const products = await Product.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalCustomers,
                totalSales,
                lowStockCount,
                topSelling: topSelling.filter(item => item._id !== null),
                products
            }
        });
    } catch (err) {
        console.error("API Admin Dashboard Error:", err);
        res.status(500).json({ success: false, message: 'Server error loading admin dashboard', error: err.message });
    }
};

exports.getAdminOrders = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Order = require('../models/order');
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('customer', 'name email')
            .populate('items.product');

        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error loading admin orders', error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Order = require('../models/order');
        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: `Order status updated to ${status} successfully!` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error updating order status', error: err.message });
    }
};

exports.getAdminUsers = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const User = require('../models/user');
        const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error loading admin users', error: err.message });
    }
};

exports.getAdminReviews = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Review = require('../models/review');
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .populate('customer', 'name email')
            .populate('product', 'name');

        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error loading admin reviews', error: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Review = require('../models/review');
        await Review.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Review deleted and moderated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error deleting review', error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Product = require('../models/product');
        await Product.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Product successfully deleted from database!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error deleting product', error: err.message });
    }
};

exports.addAdminProduct = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Product = require('../models/product');
        let shades = [];
        if (req.body.shades) {
            shades = req.body.shades.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        const newProduct = new Product({
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category,
            description: req.body.description,
            stock: Number(req.body.stock),
            rating: 0,
            image: req.file ? 'uploads/' + req.file.filename : 'Logo.webp',
            shades: shades,
            ingredients: req.body.ingredients || ''
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product added successfully!' });
    } catch (err) {
        console.error("API addAdminProduct error:", err);
        res.status(500).json({ success: false, message: 'Server error adding product.', error: err.message });
    }
};

exports.editAdminProduct = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }

        const Product = require('../models/product');
        let shades = [];
        if (req.body.shades) {
            shades = req.body.shades.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        let updateData = {
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category,
            description: req.body.description,
            stock: Number(req.body.stock),
            shades: shades,
            ingredients: req.body.ingredients || ''
        };

        if (req.file) {
            updateData.image = 'uploads/' + req.file.filename;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true, message: 'Product updated successfully!' });
    } catch (err) {
        console.error("API editAdminProduct error:", err);
        res.status(500).json({ success: false, message: 'Server error updating product.', error: err.message });
    }
};

// --- NEWSLETTER SYSTEM CONTROLLERS ---
exports.getAdminNewsletter = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }
        const Newsletter = require('../models/newsletter');
        const Campaign = require('../models/campaign');

        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        const campaigns = await Campaign.find().sort({ createdAt: -1 });

        res.json({ success: true, subscribers, campaigns });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching newsletter data', error: err.message });
    }
};

exports.sendAdminCampaign = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }
        const Newsletter = require('../models/newsletter');
        const Campaign = require('../models/campaign');

        const { subject, body } = req.body;
        if (!subject || !body) {
            return res.status(400).json({ success: false, message: 'Subject and Body are required.' });
        }

        const subscribers = await Newsletter.find();
        if (subscribers.length === 0) {
            return res.status(400).json({ success: false, message: 'No subscribers to send to.' });
        }

        // Create campaign record
        const campaign = new Campaign({
            title: subject,
            body: body,
            sentCount: subscribers.length
        });
        await campaign.save();

        res.json({ success: true, message: `Campaign sent successfully to ${subscribers.length} subscribers!` });
    } catch (err) {
        console.error("sendAdminCampaign error:", err);
        res.status(500).json({ success: false, message: 'Server error dispatching campaign.', error: err.message });
    }
};

// --- GLOBAL STORE SETTINGS CONTROLLERS ---
exports.getSettings = async (req, res) => {
    try {
        const Settings = require('../models/settings');
        let discountSetting = await Settings.findOne({ key: 'globalDiscount' });
        if (!discountSetting) {
            discountSetting = new Settings({ key: 'globalDiscount', value: 0 });
            await discountSetting.save();
        }
        res.json({ success: true, globalDiscount: Number(discountSetting.value) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching settings', error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
        }
        const Settings = require('../models/settings');
        const { globalDiscount } = req.body;

        if (globalDiscount === undefined || isNaN(Number(globalDiscount)) || Number(globalDiscount) < 0 || Number(globalDiscount) > 100) {
            return res.status(400).json({ success: false, message: 'Please provide a valid discount percentage between 0 and 100.' });
        }

        let discountSetting = await Settings.findOne({ key: 'globalDiscount' });
        if (!discountSetting) {
            discountSetting = new Settings({ key: 'globalDiscount', value: Number(globalDiscount) });
        } else {
            discountSetting.value = Number(globalDiscount);
        }
        await discountSetting.save();

        res.json({ success: true, message: `Global discount successfully set to ${globalDiscount}%!`, globalDiscount: Number(discountSetting.value) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error updating settings', error: err.message });
    }
};

exports.seedDatabase = async (req, res) => {
    try {
        const { seedDatabase } = require('../seedProducts');
        const result = await seedDatabase();
        res.json({ success: true, message: 'Database seeded successfully!', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
    }
};