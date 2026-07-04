require('dotenv').config(); // Loads the .env file
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors'); 

// Import Custom Security Middlewares
const nosqlSanitize = require('./middleware/nosqlSanitize');
const xssSanitize = require('./middleware/xssSanitize');
const { csrfInit, csrfValidate } = require('./middleware/csrfProtection');

// Import Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');
const ecommerceRoutes = require('./routes/ecommerceRoutes');
const cartMiddleware = require('./middleware/cartMiddleware');

// 1. Mount Helmet Security Headers (MUST be mounted very early)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://code.jquery.com", "https://js.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'self'", "https://js.stripe.com"],
            imgSrc: ["'self'", "data:", "*"],
            connectSrc: ["'self'"]
        }
    }
}));

// 2. Body Parsers (MUST be before routes)
app.use(express.json()); // For API JSON payloads
app.use(express.urlencoded({ extended: true })); // For traditional HTML form submissions
app.use(nosqlSanitize); // Filter out NoSQL injection attempts recursively
app.use(xssSanitize); // Sanitize inputs in request bodies to prevent XSS

// Enable CORS for your React frontend
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// 3. Mount Headless API Routes
app.use('/api/v1', apiRoutes);

// 2. Set EJS & Static Files (Layouts removed!)
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); 

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kikoDB')
    .then(async () => {
        console.log('MongoDB Connected to Express Server');
        const { syncProductRatings } = require('./utils/ratingSync');
        await syncProductRatings();
    })
    .catch(err => console.log('Database connection error:', err));

// 4. Security & Session Setup
app.use(session({
    name: 'kiko_session_id', // Renamed session cookie to avoid fingerprinting
    secret: 'kiko_milano_super_secret_key', 
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({ 
        mongoUrl: 'mongodb://127.0.0.1:27017/kikoDB' 
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // Prevents client-side scripts from reading session cookie
        sameSite: 'lax', // Guards against CSRF attacks
        secure: process.env.NODE_ENV === 'production' // Requires HTTPS in production
    } 
}));

// 5. Initialize Flash & Global Variables Middleware (Required before CSRF Validation so req.flash is available)
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.currentUser = req.session.userId || null;  
    res.locals.userRole = req.session.userRole || null;    
    next(); 
});
app.use(cartMiddleware);

// Mount CSRF validation & initialization middlewares
app.use(csrfInit);
app.use(csrfValidate);

// Setup Rate Limiters
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

const newsletterLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many subscription attempts. Please try again after 10 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const reviewLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: 'Too many review submissions. Please try again after 10 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: 'Too many contact submissions. Please try again after 10 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply Rate Limiters
app.use('/api/v1/', apiLimiter);
app.post('/api/v1/newsletter/subscribe', newsletterLimiter);
app.post('/api/v1/auth/login', authLimiter);
app.post('/login', authLimiter);
app.post('/register', authLimiter);
app.post('/products/:id/reviews', reviewLimiter);
app.post('/contact-us', contactLimiter);


// 6. Traditional Route Traffic Control
app.use('/', productRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', ecommerceRoutes);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Kiko Milano Server is running at http://localhost:${PORT}`);
});