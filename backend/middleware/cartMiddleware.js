const Cart = require('../models/cart');
const Favorites = require('../models/favorites');

module.exports = async (req, res, next) => {
    try {
        // Ensure guest cart session exists and has an items array
        if (!req.session.cart || !req.session.cart.items) {
            req.session.cart = { items: [] };
        }
        // Ensure guest favorites session exists
        if (!req.session.favorites) {
            req.session.favorites = [];
        }

        let cartCount = 0;
        let favoritesCount = 0;
        let favoritesList = [];

        if (req.session.userId) {
            // Logged-in user: read cart from database
            const cart = await Cart.findOne({ user: req.session.userId });
            if (cart) {
                cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            }

            // Read favorites from database
            const fav = await Favorites.findOne({ user: req.session.userId });
            if (fav) {
                favoritesCount = fav.products.length;
                favoritesList = fav.products.map(id => id.toString());
            }
        } else {
            // Guest user: read cart from session
            cartCount = req.session.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            
            // Read favorites from session
            favoritesCount = req.session.favorites.length;
            favoritesList = req.session.favorites;
        }

        // Expose counts and list to EJS views
        res.locals.cartCount = cartCount;
        res.locals.favoritesCount = favoritesCount;
        res.locals.favoritesList = favoritesList;
        next();
    } catch (err) {
        console.error("Cart Middleware Error:", err);
        res.locals.cartCount = 0;
        next();
    }
};
