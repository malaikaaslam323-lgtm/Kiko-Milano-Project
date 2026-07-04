const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // 1. Check if the Authorization header exists
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided.' });
    }

    // 2. Extract the token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied: Invalid Token Format.' });
    }

    // 3. Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Append the decoded payload (user_id and role) to the request object
        req.user = decoded; 
        
        // 5. Move to the next middleware or controller
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Forbidden: Invalid or Expired Token.' });
    }
};

module.exports = { verifyToken };