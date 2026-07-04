const xss = require('xss');

function sanitizeObject(obj) {
    if (obj instanceof Object) {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'string') {
                    obj[key] = xss(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                }
            }
        }
    }
}

module.exports = (req, res, next) => {
    if (req.body) {
        sanitizeObject(req.body);
    }
    next();
};
