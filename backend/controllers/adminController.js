const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user'); // ✨ Import User model
const Newsletter = require('../models/newsletter'); // ✨ Import Newsletter model
const Campaign = require('../models/campaign'); // ✨ Import Campaign model
const Review = require('../models/review'); // ✨ Import Review model

exports.getDashboard = async (req, res) => {
    try {
        const products = await Product.find(); 
        const totalProducts = products.length;
        let totalValue = 0;
        let lowStockCount = 0;

        products.forEach(product => {
            totalValue += (product.price * product.stock); 
            if (product.stock < 5) {
                lowStockCount++; 
            }
        });

        // Sales & Analytics stats
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalOrders = await Order.countDocuments();
        
        const salesAggregate = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalRevenue : 0;

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email');

        // Top-selling products aggregation
        const topSellingAgg = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalQuantity: { $sum: "$items.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);
        const topSelling = await Product.populate(topSellingAgg, { path: "_id" });

        res.render('admin-dashboard', { 
            products, 
            totalProducts, 
            totalValue, 
            lowStockCount,
            totalCustomers,
            totalOrders,
            totalSales,
            recentOrders,
            topSelling
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).send("Error loading dashboard");
    }
};

exports.getAddProduct = (req, res) => {
    res.render('admin-form', { product: null });
};

exports.postAddProduct = async (req, res) => {
    try {
        let shades = [];
        if (req.body.shades) {
            shades = req.body.shades.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock,
            rating: req.body.rating || 0,
            image: req.file ? 'uploads/' + req.file.filename : 'Logo.webp',
            shades: shades,
            ingredients: req.body.ingredients || ''
        });
        await newProduct.save();
        req.flash('success_msg', 'Product added successfully!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error adding product.');
        res.redirect('/admin/product/add');
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin-form', { product }); 
    } catch (err) {
        res.redirect('/admin');
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        let shades = [];
        if (req.body.shades) {
            shades = req.body.shades.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        let updateData = {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock,
            shades: shades,
            ingredients: req.body.ingredients || ''
        };
        if (req.file) {
            updateData.image = 'uploads/' + req.file.filename;
        }
        await Product.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Product updated successfully!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.postDeleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Product permanently deleted.');
        res.redirect('/admin');
    } catch (err) {
        res.redirect('/admin');
    }
};

// ==========================================
//          PHASE 2: SALES DASHBOARD LOGIC
// ==========================================

// 1. Initial Page Load (Server-Side Rendering)
exports.getSalesDashboard = async (req, res) => {
    try {
        // Renders the empty HTML shell. The jQuery will fetch the live data instantly.
        res.render('sales', { 
            title: 'Live Sales Dashboard'
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load sales dashboard.');
        res.redirect('/admin');
    }
};

// 2. The Live API Endpoint (Returns raw JSON for jQuery to read)
exports.getLiveSalesData = async (req, res) => {
    try {
        // A. Get Total Number of Orders
        const totalOrders = await Order.countDocuments();

        // B. Calculate Total Revenue using MongoDB Aggregation
        const revenueCalc = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueCalc.length > 0 ? revenueCalc[0].totalRevenue : 0;

        // C. Get the 5 Most Recent Transactions
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(5)
            .populate('customer', 'name email'); // Grab customer name/email from User model

        // D. Send everything back as a pristine JSON package
        res.json({
            success: true,
            data: {
                totalOrders: totalOrders,
                totalRevenue: totalRevenue,
                recentOrders: recentOrders
            }
        });

    } catch (err) {
        console.error("Live Data Error:", err);
        res.status(500).json({ success: false, message: 'Server error fetching live data.' });
    }
};

// --- ORDER MANAGEMENT ---
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('customer', 'name email')
            .populate('items.product');
        res.render('admin-orders', { orders });
    } catch (err) {
        console.error("Error loading admin orders:", err);
        res.status(500).send("Error loading orders");
    }
};

exports.postUpdateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        req.flash('success_msg', 'Order status updated successfully.');
        res.redirect('/admin/orders');
    } catch (err) {
        console.error("Error updating order status:", err);
        req.flash('error_msg', 'Failed to update order status.');
        res.redirect('/admin/orders');
    }
};

// --- USER MANAGEMENT ---
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
        
        // Count orders for each user
        const usersWithOrderCount = await Promise.all(users.map(async (user) => {
            const orderCount = await Order.countDocuments({ customer: user._id });
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                orderCount
            };
        }));
        
        res.render('admin-users', { users: usersWithOrderCount });
    } catch (err) {
        console.error("Error loading users:", err);
        res.status(500).send("Error loading users");
    }
};

// --- NEWSLETTER SYSTEM ---
exports.getNewsletter = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.render('admin-newsletter', { subscribers, campaigns });
    } catch (err) {
        console.error("Error loading newsletter data:", err);
        res.status(500).send("Error loading newsletter data");
    }
};

exports.postSendCampaign = async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            req.flash('error_msg', 'Campaign title and body are required.');
            return res.redirect('/admin/newsletter');
        }

        const subscribers = await Newsletter.find();
        const sentCount = subscribers.length;

        const campaign = new Campaign({
            title,
            body,
            sentCount,
            status: 'Sent successfully'
        });
        await campaign.save();

        req.flash('success_msg', `Campaign "${title}" successfully sent to ${sentCount} subscribers.`);
        res.redirect('/admin/newsletter');
    } catch (err) {
        console.error("Error sending newsletter campaign:", err);
        req.flash('error_msg', 'Failed to send campaign.');
        res.redirect('/admin/newsletter');
    }
};

// --- PRODUCT REVIEWS MANAGEMENT ---
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .populate('customer', 'name email')
            .populate('product', 'name price');

        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
            : 0;

        // Ratings breakdown per product stats
        const productStatsAgg = await Review.aggregate([
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);
        const productStats = await Product.populate(productStatsAgg, { path: "_id", select: "name" });

        res.render('admin-reviews', { 
            reviews, 
            totalReviews, 
            averageRating: Math.round(averageRating * 10) / 10,
            productStats
        });
    } catch (err) {
        console.error("Error loading reviews management:", err);
        res.status(500).send("Error loading reviews dashboard");
    }
};

exports.postDeleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        if (!review) {
            req.flash('error_msg', 'Review not found.');
            return res.redirect('/admin/reviews');
        }

        const productId = review.product;
        await Review.findByIdAndDelete(reviewId);

        // Recalculate average rating for this product and update it
        const reviews = await Review.find({ product: productId });
        let roundedAvg = 0;
        const reviewsCount = reviews.length;
        if (reviewsCount > 0) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;
            roundedAvg = Math.round(avg * 10) / 10;
        }

        await Product.findByIdAndUpdate(productId, { 
            rating: roundedAvg,
            reviewsCount: reviewsCount
        });

        req.flash('success_msg', 'Review successfully deleted, and product rating updated.');
        res.redirect('/admin/reviews');
    } catch (err) {
        console.error("Error deleting review:", err);
        req.flash('error_msg', 'Failed to delete review.');
        res.redirect('/admin/reviews');
    }
};