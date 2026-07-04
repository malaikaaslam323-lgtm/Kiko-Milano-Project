const Product = require('../models/Product');

exports.getHome = async (req, res) => {
    try {
        let bestsellers = await Product.find({
            name: { $in: [/3D Hydra/i, /Smart Fusion/i, /Unlimited Double Touch/i, /Lip Balm/i, /Coloured Lip/i, /Velvet Touch/i, /Velvet Passion/i] }
        }).limit(4);
        
        if (bestsellers.length < 4) {
            const extra = await Product.find({ _id: { $nin: bestsellers.map(b => b._id) } }).limit(4 - bestsellers.length);
            bestsellers = bestsellers.concat(extra);
        }
        res.render('index', { bestsellers });
    } catch (err) {
        console.error(err);
        res.render('index', { bestsellers: [] });
    }
};

exports.getContact = (req, res) => {
    res.render('contact-us'); 
};

exports.getProducts = async (req, res) => {
    try {
        let query = {}; 

        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice); 
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice); 
        }

        if (req.query.rating) {
            query.rating = { $gte: Number(req.query.rating) };
        }

        const page = parseInt(req.query.page) || 1; 
        const limit = 8; 
        const skip = (page - 1) * limit; 

        const products = await Product.find(query).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('products', {
            products: products,
            currentPage: page,
            totalPages: totalPages,
            searchQuery: req.query 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};