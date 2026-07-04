const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');
const Favorites = require('../models/favorites');
const Review = require('../models/review');
const bcrypt = require('bcryptjs');

// --- SHOPPING CART ---

// GET /cart - Renders the shopping cart
exports.getCart = async (req, res) => {
    try {
        let cartItems = [];
        let subtotal = 0;

        if (req.session.userId) {
            // Logged-in user: Fetch from database and populate product info
            const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
            if (cart) {
                cartItems = cart.items.filter(item => item.product !== null);
            }
        } else {
            // Guest user: Fetch from session and manually fetch product details
            if (req.session.cart && req.session.cart.items.length > 0) {
                const productIds = req.session.cart.items.map(item => item.product);
                const products = await Product.find({ _id: { $in: productIds } });
                
                cartItems = req.session.cart.items.map(sessionItem => {
                    const product = products.find(p => p._id.toString() === sessionItem.product.toString());
                    return {
                        product: product,
                        quantity: sessionItem.quantity
                    };
                }).filter(item => item.product !== null);
            }
        }

        // Calculate Subtotal
        cartItems.forEach(item => {
            subtotal += (item.product.price * item.quantity);
        });

        // Shipping Rule: Free over 50,000 PKR, else 250 PKR. 0 if cart is empty.
        const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 250;
        const total = subtotal + shipping;

        res.render('cart', {
            cartItems: cartItems,
            subtotal: subtotal,
            shipping: shipping,
            total: total
        });
    } catch (err) {
        console.error("Error loading cart:", err);
        req.flash('error_msg', 'Failed to load shopping cart.');
        res.redirect('/');
    }
};

// POST /cart/add - Adds a product to the cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity) || 1;

        const product = await Product.findById(productId);
        if (!product) {
            if (req.xhr) return res.status(404).json({ success: false, message: 'Product not found.' });
            req.flash('error_msg', 'Product not found.');
            return res.redirect('back');
        }

        // Validate stock
        if (product.stock < qty) {
            if (req.xhr) return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock.` });
            req.flash('error_msg', `Only ${product.stock} items left in stock.`);
            return res.redirect('back');
        }

        if (req.session.userId) {
            // Logged-in user DB operations
            let cart = await Cart.findOne({ user: req.session.userId });
            if (!cart) {
                cart = new Cart({ user: req.session.userId, items: [] });
            }

            const existingItem = cart.items.find(item => item.product.toString() === productId);
            if (existingItem) {
                if (existingItem.quantity + qty > product.stock) {
                    if (req.xhr) return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} left in stock.` });
                    req.flash('error_msg', `Cannot add more. Only ${product.stock} left in stock.`);
                    return res.redirect('back');
                }
                existingItem.quantity += qty;
            } else {
                cart.items.push({ product: productId, quantity: qty });
            }

            await cart.save();
        } else {
            // Guest session operations
            if (!req.session.cart) req.session.cart = { items: [] };

            const existingItem = req.session.cart.items.find(item => item.product.toString() === productId);
            if (existingItem) {
                if (existingItem.quantity + qty > product.stock) {
                    if (req.xhr) return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} left in stock.` });
                    req.flash('error_msg', `Cannot add more. Only ${product.stock} left in stock.`);
                    return res.redirect('back');
                }
                existingItem.quantity += qty;
            } else {
                req.session.cart.items.push({ product: productId, quantity: qty });
            }
        }

        // Return JSON if AJAX request
        if (req.xhr) {
            // Compute updated cart count
            let newCount = 0;
            if (req.session.userId) {
                const cart = await Cart.findOne({ user: req.session.userId });
                newCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            } else {
                newCount = req.session.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            }
            return res.json({ success: true, message: 'Added to bag!', cartCount: newCount });
        }

        req.flash('success_msg', 'Product added to bag!');
        res.redirect('/cart');
    } catch (err) {
        console.error("Add to cart error:", err);
        if (req.xhr) return res.status(500).json({ success: false, message: 'Server error adding item.' });
        res.redirect('back');
    }
};

// POST /cart/update - Modifies the quantity of a cart item
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity);
        if (qty < 1) return res.redirect('/cart');

        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/cart');
        }

        if (product.stock < qty) {
            req.flash('error_msg', `Only ${product.stock} items left in stock.`);
            return res.redirect('/cart');
        }

        if (req.session.userId) {
            const cart = await Cart.findOne({ user: req.session.userId });
            if (cart) {
                const item = cart.items.find(item => item.product.toString() === productId);
                if (item) {
                    item.quantity = qty;
                    await cart.save();
                }
            }
        } else {
            if (req.session.cart) {
                const item = req.session.cart.items.find(item => item.product.toString() === productId);
                if (item) {
                    item.quantity = qty;
                }
            }
        }

        req.flash('success_msg', 'Bag updated.');
        res.redirect('/cart');
    } catch (err) {
        console.error("Update cart error:", err);
        res.redirect('/cart');
    }
};

// POST /cart/remove - Removes an item from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (req.session.userId) {
            const cart = await Cart.findOne({ user: req.session.userId });
            if (cart) {
                cart.items = cart.items.filter(item => item.product.toString() !== productId);
                await cart.save();
            }
        } else {
            if (req.session.cart) {
                req.session.cart.items = req.session.cart.items.filter(item => item.product.toString() !== productId);
            }
        }

        req.flash('success_msg', 'Item removed from bag.');
        res.redirect('/cart');
    } catch (err) {
        console.error("Remove from cart error:", err);
        res.redirect('/cart');
    }
};


// --- CHECKOUT & ORDER SUBMISSION ---

// GET /checkout - Renders checkout page
exports.getCheckout = async (req, res) => {
    try {
        if (!req.session.userId) {
            req.flash('error_msg', 'Please log in to checkout.');
            return res.redirect('/login');
        }

        const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Your bag is empty.');
            return res.redirect('/cart');
        }

        let subtotal = 0;
        const validItems = cart.items.filter(item => item.product !== null);

        validItems.forEach(item => {
            subtotal += (item.product.price * item.quantity);
        });

        const shipping = subtotal > 50000 ? 0 : 250;
        const total = subtotal + shipping;

        res.render('checkout', {
            cartItems: validItems,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
        });
    } catch (err) {
        console.error("Checkout error:", err);
        res.redirect('/cart');
    }
};

// POST /checkout/submit - Submits delivery details and processes payment
exports.submitCheckout = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const { name, address, city, postalCode, phone, paymentMethod, stripeToken } = req.body;

        const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Your bag is empty.');
            return res.redirect('/cart');
        }

        const validItems = cart.items.filter(item => item.product !== null);
        let subtotal = 0;

        // 1. Verify stock availability for all items
        for (const item of validItems) {
            if (item.product.stock < item.quantity) {
                req.flash('error_msg', `Stock conflict: "${item.product.name}" has only ${item.product.stock} items left.`);
                return res.redirect('/checkout');
            }
            subtotal += (item.product.price * item.quantity);
        }

        const shipping = subtotal > 50000 ? 0 : 250;
        const totalAmount = subtotal + shipping;

        // 2. Handle payment processing/simulation
        if (paymentMethod === 'card') {
            if (process.env.STRIPE_SECRET_KEY && stripeToken) {
                try {
                    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
                    await stripe.charges.create({
                        amount: Math.round(totalAmount * 100), // Amount in cents/paisas
                        currency: 'pkr',
                        source: stripeToken,
                        description: `KIKO Milano charge for order by user: ${req.session.userId}`
                    });
                } catch (stripeErr) {
                    console.error("Stripe Charge Error:", stripeErr);
                    req.flash('error_msg', 'Credit card transaction failed: ' + stripeErr.message);
                    return res.redirect('/checkout');
                }
            } else {
                // Simulate card transaction delay
                await new Promise(resolve => setTimeout(resolve, 600));
                console.log(`[SIMULATION] Simulated card charge for Rs. ${totalAmount.toLocaleString()} successful.`);
            }
        }

        // 3. Decrement Product Stock
        for (const item of validItems) {
            item.product.stock -= item.quantity;
            await item.product.save();
        }

        // 4. Save Order to Database
        const order = new Order({
            customer: req.session.userId,
            items: validItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount: totalAmount,
            status: 'Pending',
            recipientName: name,
            shippingAddress: `${address}, ${city}, ${postalCode}`,
            phone: phone,
            paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'COD'
        });

        await order.save();

        // 5. Clear Database Cart
        cart.items = [];
        await cart.save();

        req.flash('success_msg', 'Order placed successfully! Thank you for shopping with us.');
        req.flash('new_order_id', order._id.toString());
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Submit checkout error:", err);
        req.flash('error_msg', 'Failed to process checkout. Please try again.');
        res.redirect('/checkout');
    }
};


// --- CUSTOMER DASHBOARD ---

// GET /dashboard - Renders the profile and order history
exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId) {
            req.flash('error_msg', 'Please log in to access your dashboard.');
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/logout');

        // Fetch user's orders, sorted by newest first
        const orders = await Order.find({ customer: req.session.userId })
            .sort({ createdAt: -1 })
            .populate('items.product');

        const newOrderId = req.flash('new_order_id')[0] || null;

        res.render('dashboard', {
            user: user,
            orders: orders,
            newOrderId: newOrderId
        });
    } catch (err) {
        console.error("Dashboard render error:", err);
        res.redirect('/');
    }
};

// POST /dashboard/update-profile - Updates profile details and shifts passwords
exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');

        const { name, password } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/my-account');
        }

        user.name = name;

        if (password && password.trim().length >= 6) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        req.flash('success_msg', 'Profile updated successfully.');
        res.redirect('/my-account');
    } catch (err) {
        console.error("Profile update error:", err);
        req.flash('error_msg', 'Failed to update profile.');
        res.redirect('/my-account');
    }
};

// GET /my-account - Renders the spacious profile settings page
exports.getMyAccount = async (req, res) => {
    try {
        if (!req.session.userId) {
            req.flash('error_msg', 'Please log in to access your account.');
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/logout');

        res.render('my-account', {
            user: user
        });
    } catch (err) {
        console.error("My Account render error:", err);
        res.redirect('/');
    }
};


// --- DYNAMIC PRODUCT DETAILS PAGE ---

// GET /products/:id - Renders detailed product specs, shades, and categories
exports.getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found.');
            return res.redirect('/products');
        }

        // Fetch related products (same category, excluding current product, limit to 4)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        // Fallbacks for shades and ingredients if not populated
        const productShades = product.shades && product.shades.length > 0
            ? product.shades 
            : ["01 Unicorn Pearl", "02 Satin Rose", "03 Peach Velvet", "04 Mocha Crush"];
            
        const productIngredients = product.ingredients && product.ingredients.trim() !== ''
            ? product.ingredients
            : "AQUA (WATER/EAU), DIMETHICONE, SYNTHETIC WAX, TRIMETHYLSILOXYSILICATE, LAURYL PEG-9 POLYDIMETHYLSILOXYETHYL DIMETHICONE, GLYCERIN, POLYSILICONE-11, PHENOXYETHANOL, SODIUM CHLORIDE, TOCOPHEROL, POTASSIUM SORBATE, CITRIC ACID.";

        // Fetch all reviews for this product
        const reviews = await Review.find({ product: product._id })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
            : 0;

        let userHasReviewed = false;
        if (req.session.userId) {
            userHasReviewed = reviews.some(r => r.customer && r.customer._id.toString() === req.session.userId.toString());
        }

        res.render('product-detail', {
            product: product,
            shades: productShades,
            ingredients: productIngredients,
            relatedProducts: relatedProducts,
            reviews: reviews,
            averageRating: averageRating,
            userHasReviewed: userHasReviewed
        });
    } catch (err) {
        console.error("Product detail view error:", err);
        req.flash('error_msg', 'Failed to load product page.');
        res.redirect('/products');
    }
};

// POST /products/:id/reviews - Submits a review/rating for a product
exports.postProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.session.userId;

        if (!userId) {
            req.flash('error_msg', 'Please log in to submit a review.');
            return res.redirect(`/products/${productId}`);
        }

        const ratingVal = parseInt(rating);
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
            req.flash('error_msg', 'Invalid rating score. Please select between 1 and 5 stars.');
            return res.redirect(`/products/${productId}`);
        }

        if (!comment || comment.trim() === '') {
            req.flash('error_msg', 'Review comment cannot be empty.');
            return res.redirect(`/products/${productId}`);
        }

        // Check if the user already reviewed this product
        const existing = await Review.findOne({ product: productId, customer: userId });
        if (existing) {
            req.flash('error_msg', 'You have already reviewed this product.');
            return res.redirect(`/products/${productId}`);
        }

        // Create the new review
        const newReview = new Review({
            product: productId,
            customer: userId,
            rating: ratingVal,
            comment: comment.trim()
        });
        await newReview.save();

        // Recalculate average rating for this product and update it
        const reviews = await Review.find({ product: productId });
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const roundedAvg = Math.round(avg * 10) / 10; // round to 1 decimal place

        await Product.findByIdAndUpdate(productId, { 
            rating: roundedAvg,
            reviewsCount: reviews.length
        });

        req.flash('success_msg', 'Thank you! Your review has been submitted successfully.');
        res.redirect(`/products/${productId}`);
    } catch (err) {
        console.error("Review submission error:", err);
        req.flash('error_msg', 'Failed to submit review.');
        res.redirect(`/products/${req.params.id}`);
    }
};

// GET /favorites - Renders the user's favorites list
exports.getFavorites = async (req, res) => {
    try {
        let products = [];
        
        if (req.session.userId) {
            const fav = await Favorites.findOne({ user: req.session.userId }).populate('products');
            if (fav) {
                // filter out nulls just in case a product was deleted
                products = fav.products.filter(p => p !== null);
            }
        } else {
            // Guest: read from session
            if (req.session.favorites && req.session.favorites.length > 0) {
                products = await Product.find({ _id: { $in: req.session.favorites } });
            }
        }

        res.render('favorites', {
            title: 'Your Favorites',
            products: products
        });
    } catch (err) {
        console.error("Error loading favorites page:", err);
        req.flash('error_msg', 'Failed to load favorites.');
        res.redirect('/products');
    }
};

// POST /favorites/toggle - Adds/removes a product from favorites
exports.toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        let added = false;
        let favoritesCount = 0;

        if (req.session.userId) {
            let fav = await Favorites.findOne({ user: req.session.userId });
            if (!fav) {
                fav = new Favorites({ user: req.session.userId, products: [] });
            }

            const index = fav.products.indexOf(productId);
            if (index > -1) {
                // remove
                fav.products.splice(index, 1);
                added = false;
            } else {
                // add
                fav.products.push(productId);
                added = true;
            }
            await fav.save();
            favoritesCount = fav.products.length;
        } else {
            // Guest: save in session
            if (!req.session.favorites) {
                req.session.favorites = [];
            }

            const index = req.session.favorites.indexOf(productId);
            if (index > -1) {
                // remove
                req.session.favorites.splice(index, 1);
                added = false;
            } else {
                // add
                req.session.favorites.push(productId);
                added = true;
            }
            favoritesCount = req.session.favorites.length;
        }

        res.json({
            success: true,
            added,
            favoritesCount,
            message: added ? 'Added to favorites!' : 'Removed from favorites.'
        });
    } catch (err) {
        console.error("Favorites toggle error:", err);
        res.status(500).json({ success: false, message: 'Server error updating favorites.' });
    }
};
