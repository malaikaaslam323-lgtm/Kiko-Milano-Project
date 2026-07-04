const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Cart = require('../models/cart');

exports.getRegister = (req, res) => {
    res.render('register');
};

exports.postRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            req.flash('error_msg', 'That email is already registered. Please log in.');
            return res.redirect('/register');
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword 
        });

        await newUser.save();
        req.flash('success_msg', 'Registration successful! You can now log in.');
        res.redirect('/login');
    } catch (err) {
        console.error("Registration Error:", err);
        req.flash('error_msg', 'An error occurred during registration.');
        res.redirect('/register');
    }
};

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        
        if (!user) {
            req.flash('error_msg', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            req.flash('error_msg', 'Invalid email or password.');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.flash('success_msg', `Welcome back, ${user.name}!`);

        // Merge guest session cart into database cart
        if (req.session.cart && req.session.cart.items && req.session.cart.items.length > 0) {
            try {
                let userCart = await Cart.findOne({ user: user._id });
                if (!userCart) {
                    userCart = new Cart({ user: user._id, items: [] });
                }

                for (const sessionItem of req.session.cart.items) {
                    const existingItem = userCart.items.find(
                        item => item.product.toString() === sessionItem.product.toString()
                    );
                    if (existingItem) {
                        existingItem.quantity += sessionItem.quantity;
                    } else {
                        userCart.items.push({
                            product: sessionItem.product,
                            quantity: sessionItem.quantity
                        });
                    }
                }

                await userCart.save();
                req.session.cart = { items: [] }; // Reset guest cart
            } catch (mergeErr) {
                console.error("Cart Merge Error:", mergeErr);
            }
        }

        req.session.save((err) => {
            if (user.role.toLowerCase() === 'admin') {
                return res.redirect('/admin'); 
            } else {
                return res.redirect('/'); 
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        req.flash('error_msg', 'An error occurred during login.');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.session.userId = null; 
    req.session.userRole = null;
    req.flash('success_msg', 'You have successfully logged out.');
    res.redirect('/');
};