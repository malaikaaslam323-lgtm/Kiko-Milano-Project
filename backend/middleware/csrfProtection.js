const crypto = require('crypto');

module.exports = {
    csrfInit: (req, res, next) => {
        // Generate a cryptographically strong 32-byte hex token if none exists in session
        if (!req.session.csrfToken) {
            req.session.csrfToken = crypto.randomBytes(32).toString('hex');
        }
        res.locals.csrfToken = req.session.csrfToken;
        next();
    },
    
    csrfValidate: (req, res, next) => {
        // Skip validation for read-only HTTP methods
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        if (safeMethods.includes(req.method)) {
            return next();
        }
        
        // Exclude stateless API endpoints
        if (req.originalUrl.startsWith('/api/v1/')) {
            return next();
        }
        
        // Extract CSRF token from various sources
        const token = req.body._csrf || 
                      req.headers['x-csrf-token'] || 
                      req.headers['x-xsrf-token'] || 
                      req.query._csrf;
                      
        if (!token || token !== req.session.csrfToken) {
            console.warn(`[SECURITY WARNING] CSRF token validation failed. IP: ${req.ip}, Route: ${req.originalUrl}`);
            req.flash('error_msg', 'Security validation failed: Invalid or missing CSRF token. Please reload the page and try again.');
            
            // Handle JSON/AJAX API requests
            if (req.xhr || req.headers['accept'] === 'application/json' || req.originalUrl.startsWith('/api/v1/')) {
                return res.status(403).json({ success: false, message: 'Invalid or missing CSRF token.' });
            }
            return res.redirect('back');
        }
        next();
    }
};
