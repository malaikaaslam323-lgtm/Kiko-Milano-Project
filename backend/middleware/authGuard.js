const User = require('../models/User');

const isLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return next(); 
    }
    req.flash('error_msg', 'Please log in to access this page.');
    res.redirect('/login'); 
};

const isAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error_msg', 'Please log in first.');
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (user && user.role.toLowerCase() === 'admin') {
            return next(); 
        } else {
            req.flash('error_msg', 'Access Denied: Admins Only!');
            return res.redirect('/'); 
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

module.exports = { isLoggedIn, isAdmin };