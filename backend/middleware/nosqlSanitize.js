function sanitizeObject(obj) {
    if (obj instanceof Object) {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key.startsWith('$')) {
                    delete obj[key];
                } else {
                    sanitizeObject(obj[key]);
                }
            }
        }
    }
}

module.exports = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
};
